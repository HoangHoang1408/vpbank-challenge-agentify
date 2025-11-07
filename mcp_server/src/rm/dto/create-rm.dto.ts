import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsBoolean, IsDateString, IsNumber, IsEnum } from 'class-validator';
import { RmLevel } from '../entities/rm.entity';

export class CreateRmDto {
    @ApiProperty({
        description: 'Employee ID',
        example: 12345,
    })
    @IsNumber()
    @IsNotEmpty()
    employeeId: number;

    @ApiProperty({
        description: 'Relationship Manager full name',
        example: 'Tran Van B',
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        description: 'Date of birth',
        example: '1985-05-15',
        type: String,
    })
    @IsDateString()
    @IsNotEmpty()
    dob: Date;

    @ApiProperty({
        description: 'RM level',
        example: RmLevel.LEVEL_5,
        enum: RmLevel,
    })
    @IsEnum(RmLevel)
    @IsNotEmpty()
    level: RmLevel;

    @ApiProperty({
        description: 'Job title',
        example: 'Senior Relationship Manager',
    })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({
        description: 'Hire date',
        example: '2015-03-20',
        type: String,
    })
    @IsDateString()
    @IsNotEmpty()
    hireDate: Date;

    @ApiProperty({
        description: 'Whether the RM is active',
        example: true,
        default: true,
    })
    @IsBoolean()
    @IsNotEmpty()
    isActive: boolean;
}

