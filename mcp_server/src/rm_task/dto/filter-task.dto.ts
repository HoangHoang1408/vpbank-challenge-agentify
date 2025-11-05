import { IsEnum, IsInt, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TaskType, TaskStatus } from '../entities/fact_rm_task.entity';

export class FilterTaskDto {
    @ApiPropertyOptional({
        description: 'Filter by Relationship Manager ID',
        example: 1,
        minimum: 1,
    })
    @IsInt()
    @Min(1)
    @Type(() => Number)
    @IsOptional()
    rmId?: number;

    @ApiPropertyOptional({
        description: 'Filter by Customer ID',
        example: 1,
        minimum: 1,
    })
    @IsInt()
    @Min(1)
    @Type(() => Number)
    @IsOptional()
    customerId?: number;

    @ApiPropertyOptional({
        description: 'Filter by task status',
        enum: TaskStatus,
        example: TaskStatus.IN_PROGRESS,
    })
    @IsEnum(TaskStatus)
    @IsOptional()
    status?: TaskStatus;

    @ApiPropertyOptional({
        description: 'Filter by task type',
        enum: TaskType,
        example: TaskType.CALL,
    })
    @IsEnum(TaskType)
    @IsOptional()
    taskType?: TaskType;
}

