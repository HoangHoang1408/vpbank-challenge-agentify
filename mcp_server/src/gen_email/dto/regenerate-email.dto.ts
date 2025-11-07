import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class RegenerateEmailDto {
    @ApiPropertyOptional({
        description: 'The OpenAI model to use for email regeneration. Defaults to gpt-4o if not provided.',
        example: 'gpt-4o',
        default: 'gpt-4o',
        enum: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'],
    })
    @IsOptional()
    @IsString()
    model?: string;

    @ApiPropertyOptional({
        description: 'Custom prompt for this specific regeneration. This allows RMs to provide additional instructions or adjustments for the regenerated content. Will be combined with the RM\'s default custom prompt if one exists.',
        example: 'Làm cho nội dung ngắn gọn hơn và tập trung vào ưu đãi thẻ tín dụng.',
        type: String,
    })
    @IsOptional()
    @IsString()
    customPrompt?: string;
}

