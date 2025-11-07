import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EmailStatus } from '../entities/generated-email.entity';

export class UpdateEmailStatusDto {
    @ApiProperty({
        description: 'The new status for the email. Use SENT when the email has been sent to the customer, or DELETED to mark it as deleted.',
        enum: EmailStatus,
        example: EmailStatus.SENT,
        enumName: 'EmailStatus',
    })
    @IsEnum(EmailStatus)
    status: EmailStatus;
}

