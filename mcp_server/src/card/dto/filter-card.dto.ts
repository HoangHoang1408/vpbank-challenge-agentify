import { IsOptional, IsEnum, IsString, IsBoolean, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CardType, CardNetwork } from '../entities/card.entity';

export class FilterCardDto {
    @ApiPropertyOptional({
        description: 'Page number for pagination',
        example: 1,
        minimum: 1,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number;

    @ApiPropertyOptional({
        description: 'Number of items per page',
        example: 10,
        minimum: 1,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number;

    @ApiPropertyOptional({
        enum: CardType,
        description: 'Filter by card type',
        example: CardType.CREDIT,
    })
    @IsOptional()
    @IsEnum(CardType)
    cardType?: CardType;

    @ApiPropertyOptional({
        enum: CardNetwork,
        description: 'Filter by card network',
        example: CardNetwork.VISA,
    })
    @IsOptional()
    @IsEnum(CardNetwork)
    cardNetwork?: CardNetwork;

    @ApiPropertyOptional({
        description: 'Filter by card product name (partial match)',
        example: 'Platinum',
    })
    @IsOptional()
    @IsString()
    cardProductName?: string;

    @ApiPropertyOptional({
        description: 'Filter by active status',
        example: true,
    })
    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    isActive?: boolean;
}

