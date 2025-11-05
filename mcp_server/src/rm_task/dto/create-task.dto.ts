import { IsString, IsNotEmpty, IsEnum, IsInt, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TaskType, TaskStatus } from '../entities/fact_rm_task.entity';

export class CreateTaskDto {
    @ApiProperty({
        description: 'Unique task identifier',
        example: 'TASK-2024-001',
    })
    @IsString()
    @IsNotEmpty()
    taskId: string;

    @ApiProperty({
        description: 'Relationship Manager ID',
        example: 1,
        minimum: 1,
    })
    @IsInt()
    @Min(1)
    @Type(() => Number)
    rmId: number;

    @ApiProperty({
        description: 'Customer ID',
        example: 1,
        minimum: 1,
    })
    @IsInt()
    @Min(1)
    @Type(() => Number)
    customerId: number;

    @ApiProperty({
        description: 'Type of task',
        enum: TaskType,
        example: TaskType.CALL,
    })
    @IsEnum(TaskType)
    @IsNotEmpty()
    taskType: TaskType;

    @ApiProperty({
        description: 'Status of the task',
        enum: TaskStatus,
        example: TaskStatus.PENDING,
    })
    @IsEnum(TaskStatus)
    @IsNotEmpty()
    status: TaskStatus;

    @ApiProperty({
        description: 'Detailed description of the task',
        example: 'Call customer to discuss investment options',
    })
    @IsString()
    @IsNotEmpty()
    taskDetails: string;

    @ApiProperty({
        description: 'Due date for the task',
        example: '2024-12-31',
        type: String,
        format: 'date',
    })
    @IsDateString()
    @IsNotEmpty()
    dueDate: Date;
}

