import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString, IsBoolean, IsDateString, IsOptional, IsNumber } from 'class-validator';
import { Gender, JobTitle, Segment } from '../entities/customer.entity';

export class UpdateCustomerDto {
    @ApiPropertyOptional({
        description: 'Unique customer ID',
        example: 'CUST001',
    })
    @IsString()
    @IsOptional()
    customerId?: string;

    @ApiPropertyOptional({
        description: 'Customer full name',
        example: 'Nguyen Van A',
    })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiPropertyOptional({
        description: 'Customer email address',
        example: 'nguyenvana@example.com',
    })
    @IsEmail()
    @IsOptional()
    email?: string;

    @ApiPropertyOptional({
        description: 'Customer phone number',
        example: '+84901234567',
    })
    @IsString()
    @IsOptional()
    phone?: string;

    @ApiPropertyOptional({
        description: 'Customer address',
        example: '123 Nguyen Hue Street',
    })
    @IsString()
    @IsOptional()
    address?: string;

    @ApiPropertyOptional({
        description: 'Country',
        example: 'Vietnam',
    })
    @IsString()
    @IsOptional()
    country?: string;

    @ApiPropertyOptional({
        description: 'Date of birth',
        example: '1990-01-01',
        type: String,
    })
    @IsDateString()
    @IsOptional()
    dob?: Date;

    @ApiPropertyOptional({
        description: 'Gender',
        enum: Gender,
        example: Gender.MALE,
    })
    @IsEnum(Gender)
    @IsOptional()
    gender?: Gender;

    @ApiPropertyOptional({
        description: 'Job title',
        enum: JobTitle,
        example: JobTitle.ENGINEER,
    })
    @IsEnum(JobTitle)
    @IsOptional()
    jobTitle?: JobTitle;

    @ApiPropertyOptional({
        description: 'Customer segment',
        enum: Segment,
        example: Segment.DIAMOND,
    })
    @IsEnum(Segment)
    @IsOptional()
    segment?: Segment;

    @ApiPropertyOptional({
        description: 'State/Province',
        example: 'Ho Chi Minh',
    })
    @IsString()
    @IsOptional()
    state?: string;

    @ApiPropertyOptional({
        description: 'Zip/Postal code',
        example: '700000',
    })
    @IsString()
    @IsOptional()
    zip?: string;

    @ApiPropertyOptional({
        description: 'Whether the customer is active',
        example: true,
    })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @ApiPropertyOptional({
        description: 'Relationship Manager ID',
        example: 1,
    })
    @IsNumber()
    @IsOptional()
    rmId?: number;
}

