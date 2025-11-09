import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsBoolean, IsDateString, IsNumber, IsEnum, IsOptional } from 'class-validator';
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

    @ApiPropertyOptional({
        description: 'Email signature template that will be appended to all generated emails. Supports template variables: {{Name}} for RM name, {{Title}} for RM title. If not provided, uses default template.',
        example: 'Best regards,\n{{Name}}\n{{Title}}\nVPBank',
        type: String,
        nullable: true,
    })
    @IsString()
    @IsOptional()
    emailSignature?: string | null;
}

