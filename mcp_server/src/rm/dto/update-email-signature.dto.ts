import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateEmailSignatureDto {
    @ApiProperty({
        description: 'Email signature template that will be appended to all generated emails. Supports template variables: {{Name}} for RM name, {{Title}} for RM title. Set to null to use default template.',
        example: 'Best regards,\n{{Name}}\n{{Title}}\nVPBank',
        type: String,
        nullable: true,
    })
    @IsString()
    @IsOptional()
    emailSignature: string | null;
}

