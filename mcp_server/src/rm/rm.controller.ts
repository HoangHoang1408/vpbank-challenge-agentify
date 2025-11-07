import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    HttpCode,
    HttpStatus,
    ParseIntPipe,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiBody,
} from '@nestjs/swagger';
import { RmService } from './rm.service';
import { CreateRmDto, UpdateRmDto, FilterRmDto, UpdateCustomPromptDto } from './dto';
import { RelationshipManager } from './entities/rm.entity';

@ApiTags('relationship-managers')
@Controller('rms')
export class RmController {
    constructor(private readonly rmService: RmService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new Relationship Manager' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'RM has been successfully created.',
        type: RelationshipManager,
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'RM with the same Employee ID already exists.',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid input data.',
    })
    async create(@Body() createRmDto: CreateRmDto): Promise<RelationshipManager> {
        return await this.rmService.create(createRmDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all RMs with filters and pagination' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Returns a paginated list of RMs.',
        schema: {
            properties: {
                data: {
                    type: 'array',
                    items: { type: 'object' },
                },
                total: { type: 'number', example: 100 },
                page: { type: 'number', example: 1 },
                limit: { type: 'number', example: 10 },
                totalPages: { type: 'number', example: 10 },
            },
        },
    })
    async findAll(@Query() filterDto: FilterRmDto) {
        return await this.rmService.findAll(filterDto);
    }

    @Get('statistics')
    @ApiOperation({ summary: 'Get RM statistics' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Returns RM statistics.',
        schema: {
            properties: {
                total: { type: 'number' },
                active: { type: 'number' },
                inactive: { type: 'number' },
                byLevel: { type: 'object' },
                byTitle: { type: 'object' },
            },
        },
    })
    async getStatistics() {
        return await this.rmService.getStatistics();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get an RM by ID' })
    @ApiParam({ name: 'id', type: 'number', description: 'RM ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Returns the RM.',
        type: RelationshipManager,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'RM not found.',
    })
    async findOne(@Param('id', ParseIntPipe) id: number): Promise<RelationshipManager> {
        return await this.rmService.findOne(id);
    }

    @Get('by-employee-id/:employeeId')
    @ApiOperation({ summary: 'Get an RM by employee ID' })
    @ApiParam({ name: 'employeeId', type: 'number', description: 'Employee ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Returns the RM.',
        type: RelationshipManager,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'RM not found.',
    })
    async findByEmployeeId(@Param('employeeId', ParseIntPipe) employeeId: number): Promise<RelationshipManager> {
        return await this.rmService.findByEmployeeId(employeeId);
    }

    @Get(':id/customer-count')
    @ApiOperation({ summary: 'Get RM with customer count' })
    @ApiParam({ name: 'id', type: 'number', description: 'RM ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Returns the RM with customer count.',
        schema: {
            properties: {
                rm: { type: 'object' },
                customerCount: { type: 'number' },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'RM not found.',
    })
    async getRmWithCustomerCount(@Param('id', ParseIntPipe) id: number) {
        return await this.rmService.getRmWithCustomerCount(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update an RM' })
    @ApiParam({ name: 'id', type: 'number', description: 'RM ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'RM has been successfully updated.',
        type: RelationshipManager,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'RM not found.',
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'RM with the same Employee ID already exists.',
    })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateRmDto: UpdateRmDto,
    ): Promise<RelationshipManager> {
        return await this.rmService.update(id, updateRmDto);
    }

    @Delete(':id/soft')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Soft delete an RM (set isActive to false)' })
    @ApiParam({ name: 'id', type: 'number', description: 'RM ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'RM has been successfully deactivated.',
        type: RelationshipManager,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'RM not found.',
    })
    async softDelete(@Param('id', ParseIntPipe) id: number): Promise<RelationshipManager> {
        return await this.rmService.softDelete(id);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Permanently delete an RM' })
    @ApiParam({ name: 'id', type: 'number', description: 'RM ID' })
    @ApiResponse({
        status: HttpStatus.NO_CONTENT,
        description: 'RM has been successfully deleted.',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'RM not found.',
    })
    async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return await this.rmService.remove(id);
    }

    @Patch(':id/custom-prompt')
    @ApiOperation({
        summary: 'Update RM custom prompt',
        description: 'Set or update the custom prompt that will be applied to all auto-generated emails for this RM. This allows each RM to personalize their communication style across all generated content.',
    })
    @ApiParam({ name: 'id', type: 'number', description: 'RM ID' })
    @ApiBody({
        type: UpdateCustomPromptDto,
        description: 'Custom prompt configuration',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Custom prompt successfully updated',
        schema: {
            properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'Custom prompt updated successfully' },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'number', example: 1 },
                        customPrompt: {
                            type: 'string',
                            example: 'Tôi muốn tất cả email đều có giọng điệu vui vẻ và nhiệt tình hơn.',
                            nullable: true,
                        },
                    },
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'RM not found',
    })
    async updateCustomPrompt(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateCustomPromptDto
    ) {
        const rm = await this.rmService.update(id, { customPrompt: dto.customPrompt });

        return {
            success: true,
            message: 'Custom prompt updated successfully',
            data: {
                id: rm.id,
                customPrompt: rm.customPrompt,
            },
        };
    }

    @Get(':id/custom-prompt')
    @ApiOperation({
        summary: 'Get RM custom prompt',
        description: 'Retrieve the current custom prompt configuration for this RM',
    })
    @ApiParam({ name: 'id', type: 'number', description: 'RM ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successfully retrieved custom prompt',
        schema: {
            properties: {
                success: { type: 'boolean', example: true },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'number', example: 1 },
                        name: { type: 'string', example: 'Nguyen Van A' },
                        customPrompt: {
                            type: 'string',
                            example: 'Tôi muốn tất cả email đều có giọng điệu vui vẻ và nhiệt tình hơn.',
                            nullable: true,
                        },
                    },
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'RM not found',
    })
    async getCustomPrompt(@Param('id', ParseIntPipe) id: number) {
        const rm = await this.rmService.findOne(id);

        return {
            success: true,
            data: {
                id: rm.id,
                name: rm.name,
                customPrompt: rm.customPrompt,
            },
        };
    }
}

