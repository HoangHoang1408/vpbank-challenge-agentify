import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateCustomPromptDto {
    @ApiProperty({
        description: 'Custom prompt that will be applied to all auto-generated emails for this RM. Set to null to remove the custom prompt.',
        example: 'Tôi muốn tất cả email đều có giọng điệu vui vẻ và nhiệt tình hơn, nhấn mạnh vào lợi ích cụ thể cho khách hàng.',
        type: String,
        nullable: true,
    })
    @IsString()
    @IsOptional()
    customPrompt: string | null;
}

