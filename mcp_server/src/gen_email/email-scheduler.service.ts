import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GenEmailService } from './genEmail.service';
import { EmailRulesService } from './email-rules.service';

@Injectable()
export class EmailSchedulerService {
    private readonly logger = new Logger(EmailSchedulerService.name);

    constructor(
        private readonly genEmailService: GenEmailService,
        private readonly emailRulesService: EmailRulesService,
    ) { }

    /**
     * Run daily at 5 AM to generate emails and cleanup expired ones
     */
    // @Cron('0 5 * * *', {
    //     name: 'daily-email-generation',
    //     timeZone: 'Asia/Ho_Chi_Minh',
    // })
    async handleDailyEmailGeneration() {
        this.logger.log('Starting daily email generation job at 5 AM...');

        try {
            // Step 1: Clean up expired draft emails
            const cleanedCount = await this.genEmailService.cleanupExpiredEmails();
            this.logger.log(`Cleaned up ${cleanedCount} expired draft emails`);

            // Step 2: Get eligible customers for today
            const eligibleCustomers = await this.emailRulesService.getEligibleCustomers();
            this.logger.log(`Found ${eligibleCustomers.length} eligible customers for email generation`);

            // Step 3: Generate emails for each eligible customer
            let successCount = 0;
            let errorCount = 0;

            for (const { customer, emailType, metadata } of eligibleCustomers) {
                try {
                    // Generate personalized email content
                    const emailContent = await this.genEmailService.generatePersonalizedEmail(
                        customer.id,
                        customer.rmId,
                        emailType,
                        metadata
                    );

                    // Save generated email to database
                    await this.genEmailService.createGeneratedEmail({
                        rmId: customer.rmId,
                        customerId: customer.id,
                        emailType,
                        subject: emailContent.subject,
                        body: emailContent.body,
                        message: emailContent.message,
                        metadata,
                    });

                    successCount++;
                    this.logger.debug(
                        `Generated ${emailType} email for customer ${customer.name} (ID: ${customer.id})`
                    );
                } catch (error) {
                    errorCount++;
                    this.logger.error(
                        `Failed to generate email for customer ${customer.name} (ID: ${customer.id}): ${error.message}`,
                        error.stack
                    );
                }
            }

            this.logger.log(
                `Daily email generation completed. Success: ${successCount}, Errors: ${errorCount}`
            );
        } catch (error) {
            this.logger.error(
                `Fatal error in daily email generation job: ${error.message}`,
                error.stack
            );
        }
    }

    /**
     * Manual trigger for testing (can be called via API or internally)
     */
    async triggerManualGeneration(): Promise<{
        cleaned: number;
        generated: number;
        errors: number;
    }> {
        this.logger.log('Manual email generation triggered...');

        // Clean up expired emails
        const cleaned = await this.genEmailService.cleanupExpiredEmails();

        // Get eligible customers
        const eligibleCustomers = await this.emailRulesService.getEligibleCustomers();

        let generated = 0;
        let errors = 0;

        for (const { customer, emailType, metadata } of eligibleCustomers) {
            try {
                const emailContent = await this.genEmailService.generatePersonalizedEmail(
                    customer.id,
                    customer.rmId,
                    emailType,
                    metadata
                );

                await this.genEmailService.createGeneratedEmail({
                    rmId: customer.rmId,
                    customerId: customer.id,
                    emailType,
                    subject: emailContent.subject,
                    body: emailContent.body,
                    message: emailContent.message,
                    metadata,
                });

                generated++;
            } catch (error) {
                errors++;
                this.logger.error(
                    `Failed to generate email for customer ${customer.id}: ${error.message}`
                );
            }
        }

        return { cleaned, generated, errors };
    }

    /**
     * Trigger email generation for a specific Relationship Manager
     */
    async triggerGenerationForRm(rmId: number): Promise<{
        generated: number;
        errors: number;
        details: Array<{ customerId: number; emailType: string; success: boolean; error?: string }>;
    }> {
        this.logger.log(`Triggering email generation for RM ${rmId}...`);

        // Get eligible customers for this RM
        const eligibleCustomers = await this.emailRulesService.getEligibleCustomersByRm(rmId);

        if (eligibleCustomers.length === 0) {
            this.logger.log(`No eligible customers found for RM ${rmId}`);
            return { generated: 0, errors: 0, details: [] };
        }

        this.logger.log(`Found ${eligibleCustomers.length} eligible customers for RM ${rmId}`);

        let generated = 0;
        let errors = 0;
        const details: Array<{ customerId: number; emailType: string; success: boolean; error?: string }> = [];

        for (const { customer, emailType, metadata } of eligibleCustomers) {
            try {
                const emailContent = await this.genEmailService.generatePersonalizedEmail(
                    customer.id,
                    customer.rmId,
                    emailType,
                    metadata
                );

                await this.genEmailService.createGeneratedEmail({
                    rmId: customer.rmId,
                    customerId: customer.id,
                    emailType,
                    subject: emailContent.subject,
                    body: emailContent.body,
                    message: emailContent.message,
                    metadata,
                });

                generated++;
                details.push({
                    customerId: customer.id,
                    emailType,
                    success: true,
                });

                this.logger.debug(
                    `Generated ${emailType} email for customer ${customer.name} (ID: ${customer.id})`
                );
            } catch (error) {
                errors++;
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                details.push({
                    customerId: customer.id,
                    emailType,
                    success: false,
                    error: errorMessage,
                });
                this.logger.error(
                    `Failed to generate email for customer ${customer.id}: ${errorMessage}`
                );
            }
        }

        this.logger.log(
            `Email generation for RM ${rmId} completed. Generated: ${generated}, Errors: ${errors}`
        );

        return { generated, errors, details };
    }
}

