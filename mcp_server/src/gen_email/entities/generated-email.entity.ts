import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RelationshipManager } from "../../rm/entities/rm.entity";
import { Customer } from "../../customer/entities/customer.entity";

/**
 * Email types supported by the generation system
 * - BIRTHDAY: Birthday greeting emails sent on customer's birthday
 * - CARD_RENEWAL: Reminder emails for card renewals (30 days before expiry)
 * - SEGMENT_MILESTONE: Celebration emails for account milestones (1, 3, 5 years) or segment achievements
 */
export enum EmailType {
    BIRTHDAY = "BIRTHDAY",
    CARD_RENEWAL = "CARD_RENEWAL",
    SEGMENT_MILESTONE = "SEGMENT_MILESTONE",
}

/**
 * Email status lifecycle
 * - DRAFT: Email generated but not yet sent (expires after 7 days)
 * - SENT: Email has been sent to the customer
 * - DELETED: Email marked as deleted (soft delete)
 */
export enum EmailStatus {
    DRAFT = "DRAFT",
    SENT = "SENT",
    DELETED = "DELETED",
}

@Entity()
export class GeneratedEmail {
    @ApiProperty({
        description: 'Unique identifier for the generated email',
        example: 1,
    })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({
        description: 'The relationship manager who will send this email',
        type: () => RelationshipManager,
    })
    @ManyToOne(() => RelationshipManager, rm => rm.id)
    relationshipManager: RelationshipManager;

    @ApiProperty({
        description: 'Foreign key to the relationship manager',
        example: 1,
    })
    @Column()
    rmId: number;

    @ApiProperty({
        description: 'The customer who will receive this email',
        type: () => Customer,
    })
    @ManyToOne(() => Customer, customer => customer.id)
    customer: Customer;

    @ApiProperty({
        description: 'Foreign key to the customer',
        example: 5,
    })
    @Column()
    customerId: number;

    @ApiProperty({
        description: 'The type of email (BIRTHDAY, CARD_RENEWAL, or SEGMENT_MILESTONE)',
        enum: EmailType,
        example: EmailType.BIRTHDAY,
    })
    @Column({ type: 'enum', enum: EmailType })
    emailType: EmailType;

    @ApiProperty({
        description: 'The subject line of the email',
        example: 'Chúc mừng sinh nhật thân mến!',
    })
    @Column()
    subject: string;

    @ApiProperty({
        description: 'The full body content of the email in Vietnamese',
        example: 'Kính gửi Anh/Chị...',
    })
    @Column({ type: 'text' })
    body: string;

    @ApiProperty({
        description: 'Informal direct message that can be sent via chat/SMS. More casual and conversational than the email.',
        example: 'Chào anh! Chúc mừng sinh nhật anh nhé! 🎉 Có nhiều ưu đãi đặc biệt dành cho anh đấy.',
    })
    @Column({ type: 'text', nullable: true })
    message: string | null;

    @ApiProperty({
        description: 'Timestamp when the email was generated',
        example: '2025-11-07T10:30:00Z',
    })
    @CreateDateColumn()
    generatedAt: Date;

    @ApiProperty({
        description: 'Expiration timestamp (7 days from generation). Draft emails are auto-deleted after this time.',
        example: '2025-11-14T10:30:00Z',
    })
    @Column({ type: 'timestamp' })
    expiresAt: Date;

    @ApiProperty({
        description: 'Current status of the email (DRAFT, SENT, or DELETED)',
        enum: EmailStatus,
        example: EmailStatus.DRAFT,
        default: EmailStatus.DRAFT,
    })
    @Column({ type: 'enum', enum: EmailStatus, default: EmailStatus.DRAFT })
    status: EmailStatus;

    @ApiPropertyOptional({
        description: 'Additional metadata about the email context (e.g., age for birthday, card info for renewal, milestone details)',
        example: { age: 35, birthdayDate: '1989-05-15' },
    })
    @Column({ type: 'jsonb', nullable: true })
    metadata: Record<string, any>;

    @ApiProperty({
        description: 'Timestamp of last update to the email',
        example: '2025-11-07T10:30:00Z',
    })
    @UpdateDateColumn()
    updatedAt: Date;
}

