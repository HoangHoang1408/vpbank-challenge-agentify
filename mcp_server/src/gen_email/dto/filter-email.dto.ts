import { IsOptional, IsNumber, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { EmailStatus, EmailType } from '../entities/generated-email.entity';

export class FilterEmailDto {
    @ApiPropertyOptional({
        description: 'Filter emails by Relationship Manager ID',
        example: 1,
        type: Number,
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    rmId?: number;

    @ApiPropertyOptional({
        description: 'Filter emails by Customer ID',
        example: 5,
        type: Number,
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    customerId?: number;

    @ApiPropertyOptional({
        description: 'Filter emails by their current status',
        enum: EmailStatus,
        example: EmailStatus.DRAFT,
        enumName: 'EmailStatus',
    })
    @IsOptional()
    @IsEnum(EmailStatus)
    status?: EmailStatus;

    @ApiPropertyOptional({
        description: 'Filter emails by type',
        enum: EmailType,
        example: EmailType.BIRTHDAY,
        enumName: 'EmailType',
    })
    @IsOptional()
    @IsEnum(EmailType)
    emailType?: EmailType;
}

