import { IsString, IsEnum, IsInt, IsDateString, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TaskType, TaskStatus } from '../../entities/fact_rm_task.entity';

export class UpdateTaskDto {
    @ApiPropertyOptional({
        description: 'Type of task',
        enum: TaskType,
        example: TaskType.EMAIL,
    })
    @IsEnum(TaskType)
    @IsOptional()
    taskType?: TaskType;

    @ApiPropertyOptional({
        description: 'Status of the task',
        enum: TaskStatus,
        example: TaskStatus.IN_PROGRESS,
    })
    @IsEnum(TaskStatus)
    @IsOptional()
    status?: TaskStatus;

    @ApiPropertyOptional({
        description: 'Detailed description of the task',
        example: 'Updated task details',
    })
    @IsString()
    @IsOptional()
    taskDetails?: string;

    @ApiPropertyOptional({
        description: 'Due date for the task',
        example: '2024-12-31',
        type: String,
        format: 'date',
    })
    @IsDateString()
    @IsOptional()
    dueDate?: Date;

    @ApiPropertyOptional({
        description: 'Relationship Manager ID',
        example: 1,
        minimum: 1,
    })
    @IsInt()
    @Min(1)
    @Type(() => Number)
    @IsOptional()
    rmId?: number;

    @ApiPropertyOptional({
        description: 'Customer ID',
        example: 1,
        minimum: 1,
    })
    @IsInt()
    @Min(1)
    @Type(() => Number)
    @IsOptional()
    customerId?: number;
}

