import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsString, IsBoolean, IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { Gender, JobTitle, Segment } from '../entities/customer.entity';

export class FilterCustomerDto {
    @ApiPropertyOptional({
        description: 'Customer ID to filter by',
        example: 'CUST001',
    })
    @IsString()
    @IsOptional()
    customerId?: string;

    @ApiPropertyOptional({
        description: 'Search by name (partial match)',
        example: 'Nguyen',
    })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiPropertyOptional({
        description: 'Filter by email',
        example: 'example@email.com',
    })
    @IsString()
    @IsOptional()
    email?: string;

    @ApiPropertyOptional({
        description: 'Filter by phone',
        example: '+84901234567',
    })
    @IsString()
    @IsOptional()
    phone?: string;

    @ApiPropertyOptional({
        description: 'Filter by gender',
        enum: Gender,
    })
    @IsEnum(Gender)
    @IsOptional()
    gender?: Gender;

    @ApiPropertyOptional({
        description: 'Filter by job title',
        enum: JobTitle,
    })
    @IsEnum(JobTitle)
    @IsOptional()
    jobTitle?: JobTitle;

    @ApiPropertyOptional({
        description: 'Filter by segment',
        enum: Segment,
    })
    @IsEnum(Segment)
    @IsOptional()
    segment?: Segment;

    @ApiPropertyOptional({
        description: 'Filter by state',
        example: 'Ho Chi Minh',
    })
    @IsString()
    @IsOptional()
    state?: string;

    @ApiPropertyOptional({
        description: 'Filter by active status',
        example: true,
    })
    @IsBoolean()
    @IsOptional()
    @Type(() => Boolean)
    isActive?: boolean;

    @ApiPropertyOptional({
        description: 'Filter by Relationship Manager ID',
        example: 1,
    })
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    rmId?: number;

    @ApiPropertyOptional({
        description: 'Page number for pagination',
        example: 1,
        minimum: 1,
        default: 1,
    })
    @IsNumber()
    @IsOptional()
    @Min(1)
    @Type(() => Number)
    page?: number = 1;

    @ApiPropertyOptional({
        description: 'Number of items per page',
        example: 10,
        minimum: 1,
        default: 10,
    })
    @IsNumber()
    @IsOptional()
    @Min(1)
    @Type(() => Number)
    limit?: number = 10;
}

