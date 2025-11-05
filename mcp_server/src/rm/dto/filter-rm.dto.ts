import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsNumber, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { RmLevel } from '../entities/rm.entity';

export class FilterRmDto {
    @ApiPropertyOptional({
        description: 'Filter by employee ID',
        example: 12345,
    })
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    employeeId?: number;

    @ApiPropertyOptional({
        description: 'Search by name (partial match)',
        example: 'Tran',
    })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiPropertyOptional({
        description: 'Filter by level',
        example: RmLevel.LEVEL_5,
        enum: RmLevel,
    })
    @IsEnum(RmLevel)
    @IsOptional()
    level?: RmLevel;

    @ApiPropertyOptional({
        description: 'Filter by title',
        example: 'Senior Relationship Manager',
    })
    @IsString()
    @IsOptional()
    title?: string;

    @ApiPropertyOptional({
        description: 'Filter by active status',
        example: true,
    })
    @IsBoolean()
    @IsOptional()
    @Type(() => Boolean)
    isActive?: boolean;

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

