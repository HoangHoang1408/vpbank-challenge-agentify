import { IsEnum, IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CardType, CardNetwork } from '../entities/card.entity';

export class CreateCardDto {
    @ApiProperty({
        enum: CardType,
        description: 'Type of card (DEBIT or CREDIT)',
        example: CardType.CREDIT,
    })
    @IsEnum(CardType)
    cardType: CardType;

    @ApiProperty({
        description: 'Unique name of the card product',
        example: 'VPBank Platinum Cashback',
    })
    @IsString()
    cardProductName: string;

    @ApiProperty({
        description: 'Description of the card product',
        example: 'Premium credit card with cashback benefits',
    })
    @IsString()
    cardDescription: string;

    @ApiProperty({
        description: 'Target customer description',
        example: 'High-income professionals seeking cashback rewards',
    })
    @IsString()
    targetDescription: string;

    @ApiProperty({
        enum: CardNetwork,
        description: 'Card network (VISA or MASTERCARD)',
        example: CardNetwork.VISA,
    })
    @IsEnum(CardNetwork)
    cardNetwork: CardNetwork;

    @ApiProperty({
        description: 'Whether the card is active',
        example: true,
        required: false,
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

