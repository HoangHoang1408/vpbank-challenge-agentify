import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString, IsBoolean, IsDateString, IsOptional, IsNumber } from 'class-validator';
import { Gender, JobTitle, Segment } from '../entities/customer.entity';

export class CreateCustomerDto {
    @ApiProperty({
        description: 'Unique customer ID',
        example: 'CUST001',
    })
    @IsString()
    @IsNotEmpty()
    customerId: string;

    @ApiProperty({
        description: 'Customer full name',
        example: 'Nguyen Van A',
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        description: 'Customer email address',
        example: 'nguyenvana@example.com',
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        description: 'Customer phone number',
        example: '+84901234567',
    })
    @IsString()
    @IsNotEmpty()
    phone: string;

    @ApiProperty({
        description: 'Customer address',
        example: '123 Nguyen Hue Street',
    })
    @IsString()
    @IsNotEmpty()
    address: string;

    @ApiProperty({
        description: 'Country',
        example: 'Vietnam',
    })
    @IsString()
    @IsNotEmpty()
    country: string;

    @ApiProperty({
        description: 'Date of birth',
        example: '1990-01-01',
        type: String,
    })
    @IsDateString()
    @IsNotEmpty()
    dob: Date;

    @ApiProperty({
        description: 'Gender',
        enum: Gender,
        example: Gender.MALE,
    })
    @IsEnum(Gender)
    @IsNotEmpty()
    gender: Gender;

    @ApiProperty({
        description: 'Job title',
        enum: JobTitle,
        example: JobTitle.ENGINEER,
    })
    @IsEnum(JobTitle)
    @IsNotEmpty()
    jobTitle: JobTitle;

    @ApiProperty({
        description: 'Customer segment',
        enum: Segment,
        example: Segment.DIAMOND,
    })
    @IsEnum(Segment)
    @IsNotEmpty()
    segment: Segment;

    @ApiProperty({
        description: 'State/Province',
        example: 'Ho Chi Minh',
    })
    @IsString()
    @IsNotEmpty()
    state: string;

    @ApiProperty({
        description: 'Zip/Postal code',
        example: '700000',
    })
    @IsString()
    @IsNotEmpty()
    zip: string;

    @ApiProperty({
        description: 'Whether the customer is active',
        example: true,
        default: true,
    })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @ApiProperty({
        description: 'Relationship Manager ID',
        example: 1,
    })
    @IsNumber()
    @IsNotEmpty()
    rmId: number;
}

