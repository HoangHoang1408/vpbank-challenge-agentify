import { IsEnum, IsNumber, IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EmailType } from '../entities/generated-email.entity';

export class CreateGeneratedEmailDto {
    @ApiProperty({
        description: 'The ID of the Relationship Manager who will send this email',
        example: 1,
        type: Number,
    })
    @IsNumber()
    rmId: number;

    @ApiProperty({
        description: 'The ID of the customer who will receive this email',
        example: 1,
        type: Number,
    })
    @IsNumber()
    customerId: number;

    @ApiProperty({
        description: 'The type of email being generated',
        enum: EmailType,
        example: EmailType.BIRTHDAY,
        enumName: 'EmailType',
    })
    @IsEnum(EmailType)
    emailType: EmailType;

    @ApiProperty({
        description: 'The subject line of the email',
        example: 'Chúc mừng sinh nhật thân mến!',
        type: String,
    })
    @IsString()
    subject: string;

    @ApiProperty({
        description: 'The full body content of the email in Vietnamese',
        example: 'Kính gửi Anh/Chị...',
        type: String,
    })
    @IsString()
    body: string;

    @ApiProperty({
        description: 'Informal direct message that can be sent via chat/SMS. More casual and conversational than the email.',
        example: 'Chào anh! Chúc mừng sinh nhật anh nhé! 🎉 Có nhiều ưu đãi đặc biệt dành cho anh đấy.',
        type: String,
    })
    @IsString()
    message: string;

    @ApiPropertyOptional({
        description: 'Additional metadata about the email context (e.g., birthday age, card renewal info, milestone details)',
        example: { age: 35, birthdayDate: '1989-05-15' },
        type: Object,
    })
    @IsOptional()
    @IsObject()
    metadata?: Record<string, any>;
}

