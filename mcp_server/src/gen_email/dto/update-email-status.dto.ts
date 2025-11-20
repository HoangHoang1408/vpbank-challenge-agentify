import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EmailStatus } from '../entities/generated-email.entity';

export class UpdateEmailStatusDto {
    @ApiProperty({
        description: 'The new status for the email. Use SENT_EMAIL when the email has been sent via email, SENT_MESSAGE when sent via direct message, or DELETED to mark it as deleted.',
        enum: EmailStatus,
        example: EmailStatus.SENT_EMAIL,
        enumName: 'EmailStatus',
    })
    @IsEnum(EmailStatus)
    status: EmailStatus;
}

