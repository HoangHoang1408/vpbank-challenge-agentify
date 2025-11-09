import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../customer/entities/customer.entity';
import { EmailType } from './entities/generated-email.entity';

export interface EligibleCustomer {
    customer: Customer;
    emailType: EmailType;
    metadata: Record<string, any>;
}

@Injectable()
export class EmailRulesService {
    constructor(
        @InjectRepository(Customer)
        private readonly customerRepository: Repository<Customer>,
    ) { }

    /**
     * Get all customers eligible for email generation today
     */
    async getEligibleCustomers(): Promise<EligibleCustomer[]> {
        const allCustomers = await this.customerRepository.find({
            where: { isActive: true },
            relations: ['relationshipManager', 'cards'],
        });

        const eligible: EligibleCustomer[] = [];
        const today = new Date();

        for (const customer of allCustomers) {
            // Check birthday rule
            if (this.isBirthday(customer.dob, today)) {
                eligible.push({
                    customer,
                    emailType: EmailType.BIRTHDAY,
                    metadata: {
                        birthdayDate: customer.dob,
                        age: this.calculateAge(customer.dob, today),
                    },
                });
            }

            // Check card renewal rule
            const cardRenewalInfo = this.checkCardRenewal(customer, today);
            if (cardRenewalInfo) {
                eligible.push({
                    customer,
                    emailType: EmailType.CARD_RENEWAL,
                    metadata: cardRenewalInfo,
                });
            }

            // Check segment milestone rule
            const milestoneInfo = this.checkSegmentMilestone(customer, today);
            if (milestoneInfo) {
                eligible.push({
                    customer,
                    emailType: EmailType.SEGMENT_MILESTONE,
                    metadata: milestoneInfo,
                });
            }
        }

        return eligible;
    }

    /**
     * Check if today is customer's birthday (day and month match)
     */
    private isBirthday(dob: Date, today: Date): boolean {
        const dobDate = new Date(dob);
        return (
            dobDate.getDate() === today.getDate() &&
            dobDate.getMonth() === today.getMonth()
        );
    }

    /**
     * Calculate customer's age
     */
    private calculateAge(dob: Date, today: Date): number {
        const dobDate = new Date(dob);
        let age = today.getFullYear() - dobDate.getFullYear();
        const monthDiff = today.getMonth() - dobDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
            age--;
        }

        return age;
    }

    /**
     * Check if customer has cards due for renewal within 30 days
     */
    private checkCardRenewal(customer: Customer, today: Date): Record<string, any> | null {
        if (!customer.cards || customer.cards.length === 0) {
            return null;
        }

        const renewalThreshold = 30; // days
        const renewingCards: Array<{
            cardProductName: string;
            cardType: string;
            cardNetwork: string;
            renewalDate: string;
            daysUntilRenewal: number;
        }> = [];

        for (const card of customer.cards) {
            const cardCreatedDate = new Date(card.createdAt);
            const nextRenewalDate = new Date(cardCreatedDate);

            // Calculate next anniversary year
            const yearsSinceCreation = today.getFullYear() - cardCreatedDate.getFullYear();
            nextRenewalDate.setFullYear(cardCreatedDate.getFullYear() + yearsSinceCreation + 1);

            // If we've passed this year's anniversary, it's next year
            if (nextRenewalDate < today) {
                nextRenewalDate.setFullYear(nextRenewalDate.getFullYear() + 1);
            }

            const daysUntilRenewal = Math.ceil(
                (nextRenewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
            );

            if (daysUntilRenewal > 0 && daysUntilRenewal <= renewalThreshold) {
                renewingCards.push({
                    cardProductName: card.cardProductName,
                    cardType: card.cardType,
                    cardNetwork: card.cardNetwork,
                    renewalDate: nextRenewalDate.toISOString().split('T')[0],
                    daysUntilRenewal,
                });
            }
        }

        if (renewingCards.length > 0) {
            return {
                renewingCards,
                totalCards: renewingCards.length,
            };
        }

        return null;
    }

    /**
     * Check for segment milestones or account age milestones
     */
    private checkSegmentMilestone(customer: Customer, today: Date): Record<string, any> | null {
        // Check account age milestones (1, 3, 5 years)
        const accountCreatedDate = new Date(customer.createdAt);
        const daysSinceCreation = Math.ceil(
            (today.getTime() - accountCreatedDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Check if today is exactly 1, 3, or 5 year anniversary (within 1 day tolerance)
        const yearMilestones = [1, 3, 5];
        for (const years of yearMilestones) {
            const milestoneDate = new Date(accountCreatedDate);
            milestoneDate.setFullYear(milestoneDate.getFullYear() + years);

            const daysDiff = Math.abs(
                Math.ceil((today.getTime() - milestoneDate.getTime()) / (1000 * 60 * 60 * 24))
            );

            if (daysDiff === 0) {
                return {
                    milestoneType: 'account_anniversary',
                    years,
                    customerSince: accountCreatedDate.toISOString().split('T')[0],
                    segment: customer.segment,
                };
            }
        }

        // Check for high-tier segments (these customers get special attention)
        const highTierSegments = ['Diamond Elite', 'Diamond', 'Pre-Diamond'];
        if (highTierSegments.includes(customer.segment)) {
            // Check if customer joined this segment recently (within last 7 days)
            // This is a simplified check - in production, you'd track segment history
            const recentDays = 7;
            if (daysSinceCreation <= recentDays) {
                return {
                    milestoneType: 'segment_achievement',
                    segment: customer.segment,
                    achievedDate: accountCreatedDate.toISOString().split('T')[0],
                };
            }
        }

        return null;
    }

    /**
     * Get eligible customers for a specific Relationship Manager
     */
    async getEligibleCustomersByRm(rmId: number): Promise<EligibleCustomer[]> {
        const allCustomers = await this.customerRepository.find({
            where: { isActive: true, rmId },
            relations: ['relationshipManager', 'cards'],
        });

        const eligible: EligibleCustomer[] = [];
        const today = new Date();

        for (const customer of allCustomers) {
            // Check birthday rule
            if (this.isBirthday(customer.dob, today)) {
                eligible.push({
                    customer,
                    emailType: EmailType.BIRTHDAY,
                    metadata: {
                        birthdayDate: customer.dob,
                        age: this.calculateAge(customer.dob, today),
                    },
                });
            }

            // Check card renewal rule
            const cardRenewalInfo = this.checkCardRenewal(customer, today);
            if (cardRenewalInfo) {
                eligible.push({
                    customer,
                    emailType: EmailType.CARD_RENEWAL,
                    metadata: cardRenewalInfo,
                });
            }

            // Check segment milestone rule
            const milestoneInfo = this.checkSegmentMilestone(customer, today);
            if (milestoneInfo) {
                eligible.push({
                    customer,
                    emailType: EmailType.SEGMENT_MILESTONE,
                    metadata: milestoneInfo,
                });
            }
        }

        return eligible;
    }

    /**
     * Check if a specific customer is eligible for a specific email type
     */
    async isCustomerEligible(customerId: number, emailType: EmailType): Promise<boolean> {
        const customer = await this.customerRepository.findOne({
            where: { id: customerId, isActive: true },
            relations: ['cards'],
        });

        if (!customer) {
            return false;
        }

        const today = new Date();

        switch (emailType) {
            case EmailType.BIRTHDAY:
                return this.isBirthday(customer.dob, today);

            case EmailType.CARD_RENEWAL:
                return this.checkCardRenewal(customer, today) !== null;

            case EmailType.SEGMENT_MILESTONE:
                return this.checkSegmentMilestone(customer, today) !== null;

            default:
                return false;
        }
    }
}

