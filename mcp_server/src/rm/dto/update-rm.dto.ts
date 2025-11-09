import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsDateString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { RmLevel } from '../entities/rm.entity';

export class UpdateRmDto {
    @ApiPropertyOptional({
        description: 'Employee ID',
        example: 12345,
    })
    @IsNumber()
    @IsOptional()
    employeeId?: number;

    @ApiPropertyOptional({
        description: 'Relationship Manager full name',
        example: 'Tran Van B',
    })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiPropertyOptional({
        description: 'Date of birth',
        example: '1985-05-15',
        type: String,
    })
    @IsDateString()
    @IsOptional()
    dob?: Date;

    @ApiPropertyOptional({
        description: 'RM level',
        example: RmLevel.LEVEL_5,
        enum: RmLevel,
    })
    @IsEnum(RmLevel)
    @IsOptional()
    level?: RmLevel;

    @ApiPropertyOptional({
        description: 'Job title',
        example: 'Senior Relationship Manager',
    })
    @IsString()
    @IsOptional()
    title?: string;

    @ApiPropertyOptional({
        description: 'Hire date',
        example: '2015-03-20',
        type: String,
    })
    @IsDateString()
    @IsOptional()
    hireDate?: Date;

    @ApiPropertyOptional({
        description: 'Whether the RM is active',
        example: true,
    })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @ApiPropertyOptional({
        description: 'Custom prompt that will be applied to all auto-generated emails for this RM. Set to null to remove the custom prompt.',
        example: 'Tôi muốn tất cả email đều có giọng điệu vui vẻ và nhiệt tình hơn, nhấn mạnh vào lợi ích cụ thể cho khách hàng.',
        type: String,
        nullable: true,
    })
    @IsString()
    @IsOptional()
    customPrompt?: string | null;

    @ApiPropertyOptional({
        description: 'Email signature template that will be appended to all generated emails. Supports template variables: {{Name}} for RM name, {{Title}} for RM title. Set to null to use default template.',
        example: 'Best regards,\n{{Name}}\n{{Title}}\nVPBank',
        type: String,
        nullable: true,
    })
    @IsString()
    @IsOptional()
    emailSignature?: string | null;
}

