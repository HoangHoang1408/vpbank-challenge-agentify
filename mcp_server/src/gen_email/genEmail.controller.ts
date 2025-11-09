import { Controller, Get, Post, Patch, Delete, Query, Param, Body, ParseIntPipe, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { GenEmailService } from "./genEmail.service";
import { EmailSchedulerService } from "./email-scheduler.service";
import { UpdateEmailStatusDto, FilterEmailDto, RegenerateEmailDto } from "./dto";
import { EmailStatus, EmailType } from "./entities/generated-email.entity";

@ApiTags('Generated Emails')
@Controller('gen-email')
export class GenEmailController {
    constructor(
        private readonly genEmailService: GenEmailService,
        private readonly emailSchedulerService: EmailSchedulerService,
    ) { }

    /**
     * GET /gen-email/list?rmId={id}&status={status}
     * Get all emails for an RM with optional status filter
     */
    @Get('list')
    @ApiOperation({
        summary: 'List generated emails',
        description: 'Retrieve a list of generated emails with optional filters. At minimum, rmId must be provided to filter emails by Relationship Manager. Additional filters include status, customerId, and emailType.',
    })
    @ApiQuery({
        name: 'rmId',
        required: true,
        type: Number,
        description: 'The ID of the Relationship Manager whose emails to retrieve',
        example: 1,
    })
    @ApiQuery({
        name: 'status',
        required: false,
        enum: EmailStatus,
        description: 'Filter by email status (DRAFT, SENT, or DELETED)',
        example: EmailStatus.DRAFT,
    })
    @ApiQuery({
        name: 'customerId',
        required: false,
        type: Number,
        description: 'Filter by customer ID',
        example: 5,
    })
    @ApiQuery({
        name: 'emailType',
        required: false,
        enum: ['BIRTHDAY', 'CARD_RENEWAL', 'SEGMENT_MILESTONE'],
        description: 'Filter by email type',
        example: 'BIRTHDAY',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successfully retrieved list of emails',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                count: { type: 'number', example: 5 },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'number', example: 1 },
                            subject: { type: 'string', example: 'Chúc mừng sinh nhật!' },
                            body: { type: 'string', example: 'Kính gửi Anh/Chị...' },
                            message: { type: 'string', example: 'Chào anh! Chúc mừng sinh nhật anh nhé! 🎉' },
                            emailType: { type: 'string', example: 'BIRTHDAY' },
                            status: { type: 'string', example: 'DRAFT' },
                            generatedAt: { type: 'string', format: 'date-time' },
                            expiresAt: { type: 'string', format: 'date-time' },
                            customer: { type: 'object' },
                            relationshipManager: { type: 'object' },
                        },
                    },
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid parameters or missing rmId',
        schema: {
            type: 'object',
            properties: {
                error: { type: 'string', example: 'rmId query parameter is required' },
            },
        },
    })
    async listEmails(@Query() filters: FilterEmailDto) {
        if (!filters.rmId) {
            return { error: 'rmId query parameter is required' };
        }

        const emails = await this.genEmailService.getEmailsByRm(
            filters.rmId,
            filters.status as EmailStatus
        );

        return {
            success: true,
            count: emails.length,
            data: emails,
        };
    }

    /**
     * GET /gen-email/:id
     * Get a specific email by ID
     */
    @Get(':id')
    @ApiOperation({
        summary: 'Get email by ID',
        description: 'Retrieve detailed information about a specific generated email including customer and relationship manager details.',
    })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'The unique ID of the generated email',
        example: 1,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successfully retrieved email details',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'number', example: 1 },
                        subject: { type: 'string', example: 'Chúc mừng sinh nhật!' },
                        body: { type: 'string', example: 'Kính gửi Anh/Chị...' },
                        message: { type: 'string', example: 'Chào anh! Chúc mừng sinh nhật anh nhé! 🎉' },
                        emailType: { type: 'string', example: 'BIRTHDAY' },
                        status: { type: 'string', example: 'DRAFT' },
                        generatedAt: { type: 'string', format: 'date-time' },
                        expiresAt: { type: 'string', format: 'date-time' },
                        metadata: { type: 'object', example: { age: 35 } },
                        customer: {
                            type: 'object',
                            properties: {
                                id: { type: 'number' },
                                name: { type: 'string' },
                                email: { type: 'string' },
                            },
                        },
                        relationshipManager: {
                            type: 'object',
                            properties: {
                                id: { type: 'number' },
                                name: { type: 'string' },
                                title: { type: 'string' },
                            },
                        },
                    },
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Email not found',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid email ID format',
    })
    async getEmail(@Param('id', ParseIntPipe) id: number) {
        const email = await this.genEmailService.getEmailById(id);
        return {
            success: true,
            data: email,
        };
    }

    /**
     * POST /gen-email/regenerate/:emailId
     * Regenerate a specific email
     */
    @Post('regenerate/:emailId')
    @ApiOperation({
        summary: 'Regenerate email content',
        description: 'Regenerate the content of an existing email using OpenAI. This will create new subject and body text based on the same customer context and email type. The email status will be reset to DRAFT and expiration extended by 7 days.',
    })
    @ApiParam({
        name: 'emailId',
        type: Number,
        description: 'The unique ID of the email to regenerate',
        example: 1,
    })
    @ApiBody({
        type: RegenerateEmailDto,
        required: false,
        description: 'Optional model configuration for regeneration',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Email successfully regenerated',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'Email regenerated successfully' },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'number', example: 1 },
                        subject: { type: 'string', example: 'Chúc mừng sinh nhật!' },
                        body: { type: 'string', example: 'Kính gửi Anh/Chị...' },
                        message: { type: 'string', example: 'Chào anh! Chúc mừng sinh nhật anh nhé! 🎉' },
                        status: { type: 'string', example: 'DRAFT' },
                        expiresAt: { type: 'string', format: 'date-time' },
                    },
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Email not found',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Failed to regenerate email content',
    })
    async regenerateEmail(
        @Param('emailId', ParseIntPipe) emailId: number,
        @Body() body?: RegenerateEmailDto
    ) {
        const model = body?.model || 'gpt-4o';
        const customPrompt = body?.customPrompt;
        const email = await this.genEmailService.regenerateEmail(emailId, model, customPrompt);

        return {
            success: true,
            message: 'Email regenerated successfully',
            data: email,
        };
    }

    /**
     * POST /gen-email/regenerate-rm/:rmId
     * Regenerate all emails for a Relationship Manager
     */
    @Post('regenerate-rm/:rmId')
    @ApiOperation({
        summary: 'Regenerate emails for Relationship Manager',
        description: 'Regenerate all emails for a specific Relationship Manager. Optionally filter by status and email type. Each email will be regenerated using OpenAI with new content based on the same customer context. Email status will be reset to DRAFT and expiration extended by 7 days.',
    })
    @ApiParam({
        name: 'rmId',
        type: Number,
        description: 'The unique ID of the Relationship Manager whose emails to regenerate',
        example: 1,
    })
    @ApiQuery({
        name: 'status',
        required: false,
        enum: EmailStatus,
        description: 'Filter by email status (DRAFT, SENT, or DELETED). If not provided, all emails will be regenerated.',
        example: EmailStatus.DRAFT,
    })
    @ApiQuery({
        name: 'emailType',
        required: false,
        enum: EmailType,
        description: 'Filter by email type (BIRTHDAY, CARD_RENEWAL, or SEGMENT_MILESTONE). If not provided, all email types will be regenerated.',
        example: EmailType.BIRTHDAY,
    })
    @ApiBody({
        type: RegenerateEmailDto,
        required: false,
        description: 'Optional model configuration for regeneration',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Emails successfully regenerated',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'Regenerated 5 emails successfully, 0 failed' },
                data: {
                    type: 'object',
                    properties: {
                        regenerated: { type: 'number', example: 5, description: 'Number of successfully regenerated emails' },
                        failed: { type: 'number', example: 0, description: 'Number of failed regenerations' },
                        errors: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    emailId: { type: 'number', example: 10 },
                                    error: { type: 'string', example: 'Error message' },
                                },
                            },
                            description: 'Array of errors for failed regenerations',
                        },
                        emails: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'number' },
                                    subject: { type: 'string' },
                                    body: { type: 'string' },
                                    message: { type: 'string' },
                                    status: { type: 'string' },
                                    expiresAt: { type: 'string', format: 'date-time' },
                                },
                            },
                            description: 'Array of regenerated email objects',
                        },
                    },
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Relationship Manager not found',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid parameters',
    })
    async regenerateEmailsByRm(
        @Param('rmId', ParseIntPipe) rmId: number,
        @Query('status') status?: EmailStatus,
        @Query('emailType') emailType?: EmailType,
        @Body() body?: RegenerateEmailDto
    ) {
        const model = body?.model || 'gpt-4o';
        const customPrompt = body?.customPrompt;
        const result = await this.genEmailService.regenerateEmailsByRm(rmId, status, emailType, model, customPrompt);

        return {
            success: true,
            message: `Regenerated ${result.regenerated} emails successfully, ${result.failed} failed`,
            data: result,
        };
    }

    /**
     * PATCH /gen-email/:id/status
     * Update email status (mark as SENT/DELETED)
     */
    @Patch(':id/status')
    @ApiOperation({
        summary: 'Update email status',
        description: 'Update the status of a generated email. Use this endpoint to mark an email as SENT after sending it to the customer, or DELETED to remove it from active drafts.',
    })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'The unique ID of the email to update',
        example: 1,
    })
    @ApiBody({
        type: UpdateEmailStatusDto,
        description: 'The new status for the email',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Email status successfully updated',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'Email status updated to SENT' },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'number', example: 1 },
                        status: { type: 'string', example: 'SENT' },
                        subject: { type: 'string' },
                        body: { type: 'string' },
                        message: { type: 'string' },
                    },
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Email not found',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid status value',
    })
    async updateStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateEmailStatusDto
    ) {
        const email = await this.genEmailService.updateEmailStatus(id, dto.status);

        return {
            success: true,
            message: `Email status updated to ${dto.status}`,
            data: email,
        };
    }

    /**
     * DELETE /gen-email/:id
     * Hard delete an email
     */
    @Delete(':id')
    @ApiOperation({
        summary: 'Delete email',
        description: 'Permanently delete a generated email from the database. This is a hard delete and cannot be undone. Consider using the status update endpoint to mark as DELETED instead for soft deletion.',
    })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'The unique ID of the email to delete',
        example: 1,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Email successfully deleted',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'Email deleted successfully' },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Email not found',
    })
    async deleteEmail(@Param('id', ParseIntPipe) id: number) {
        await this.genEmailService.deleteEmail(id);

        return {
            success: true,
            message: 'Email deleted successfully',
        };
    }

    /**
     * POST /gen-email/trigger-generation
     * Manually trigger email generation (for testing)
     */
    @Post('trigger-generation')
    @ApiOperation({
        summary: 'Trigger email generation manually',
        description: 'Manually trigger the email generation process that normally runs daily at 5 AM. This endpoint will check all customers for eligibility (birthdays, card renewals, milestones) and generate appropriate emails. Useful for testing and on-demand generation.',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Email generation successfully triggered',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'Email generation triggered' },
                data: {
                    type: 'object',
                    properties: {
                        cleaned: {
                            type: 'number',
                            example: 3,
                            description: 'Number of expired draft emails cleaned up',
                        },
                        generated: {
                            type: 'number',
                            example: 12,
                            description: 'Number of emails successfully generated',
                        },
                        errors: {
                            type: 'number',
                            example: 0,
                            description: 'Number of errors encountered during generation',
                        },
                    },
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Error during email generation process',
    })
    async triggerGeneration() {
        const result = await this.emailSchedulerService.triggerManualGeneration();

        return {
            success: true,
            message: 'Email generation triggered',
            data: result,
        };
    }

    /**
     * POST /gen-email/trigger-generation-rm/:rmId
     * Trigger email generation for a specific Relationship Manager
     */
    @Post('trigger-generation-rm/:rmId')
    @ApiOperation({
        summary: 'Trigger email generation for specific RM',
        description: 'Trigger email generation from scratch for all eligible customers of a specific Relationship Manager. This will check the RM\'s customers for eligibility (birthdays, card renewals, milestones) and generate appropriate emails. Useful for on-demand generation for a specific RM.',
    })
    @ApiParam({
        name: 'rmId',
        type: Number,
        description: 'The unique ID of the Relationship Manager',
        example: 1,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Email generation successfully triggered for RM',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'Generated 5 emails for RM, 0 errors' },
                data: {
                    type: 'object',
                    properties: {
                        generated: {
                            type: 'number',
                            example: 5,
                            description: 'Number of emails successfully generated',
                        },
                        errors: {
                            type: 'number',
                            example: 0,
                            description: 'Number of errors encountered during generation',
                        },
                        details: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    customerId: { type: 'number', example: 10 },
                                    emailType: { type: 'string', example: 'BIRTHDAY' },
                                    success: { type: 'boolean', example: true },
                                    error: { type: 'string', example: 'Error message (only present if success is false)' },
                                },
                            },
                            description: 'Detailed results for each customer',
                        },
                    },
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'No eligible customers found for this RM',
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Error during email generation process',
    })
    async triggerGenerationForRm(@Param('rmId', ParseIntPipe) rmId: number) {
        const result = await this.emailSchedulerService.triggerGenerationForRm(rmId);

        return {
            success: true,
            message: `Generated ${result.generated} emails for RM, ${result.errors} errors`,
            data: result,
        };
    }
}