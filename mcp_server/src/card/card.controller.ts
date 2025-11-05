import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    HttpCode,
    HttpStatus,
    ParseIntPipe,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
} from '@nestjs/swagger';
import { CardService } from './card.service';
import { CreateCardDto, UpdateCardDto, FilterCardDto } from './dto';
import { Card } from './entities/card.entity';

@ApiTags('cards')
@Controller('cards')
export class CardController {
    constructor(private readonly cardService: CardService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new card' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Card has been successfully created.',
        type: Card,
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'Card with the same product name already exists.',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid input data.',
    })
    async create(@Body() createCardDto: CreateCardDto): Promise<Card> {
        return await this.cardService.create(createCardDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all cards with filters and pagination' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Returns a paginated list of cards.',
        schema: {
            properties: {
                data: {
                    type: 'array',
                    items: { type: 'object' },
                },
                total: { type: 'number', example: 100 },
                page: { type: 'number', example: 1 },
                limit: { type: 'number', example: 10 },
                totalPages: { type: 'number', example: 10 },
            },
        },
    })
    async findAll(@Query() filterDto: FilterCardDto) {
        return await this.cardService.findAll(filterDto);
    }

    @Get('statistics')
    @ApiOperation({ summary: 'Get card statistics' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Returns card statistics.',
        schema: {
            properties: {
                total: { type: 'number' },
                active: { type: 'number' },
                inactive: { type: 'number' },
                byCardType: { type: 'object' },
                byCardNetwork: { type: 'object' },
            },
        },
    })
    async getStatistics() {
        return await this.cardService.getStatistics();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a card by ID' })
    @ApiParam({ name: 'id', type: 'number', description: 'Card ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Returns the card.',
        type: Card,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Card not found.',
    })
    async findOne(@Param('id', ParseIntPipe) id: number): Promise<Card> {
        return await this.cardService.findOne(id);
    }

    @Get('by-product-name/:productName')
    @ApiOperation({ summary: 'Get a card by product name' })
    @ApiParam({ name: 'productName', type: 'string', description: 'Card product name' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Returns the card.',
        type: Card,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Card not found.',
    })
    async findByProductName(@Param('productName') productName: string): Promise<Card> {
        return await this.cardService.findByProductName(productName);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a card' })
    @ApiParam({ name: 'id', type: 'number', description: 'Card ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Card has been successfully updated.',
        type: Card,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Card not found.',
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'Card with the same product name already exists.',
    })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateCardDto: UpdateCardDto,
    ): Promise<Card> {
        return await this.cardService.update(id, updateCardDto);
    }

    @Delete(':id/soft')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Soft delete a card (set isActive to false)' })
    @ApiParam({ name: 'id', type: 'number', description: 'Card ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Card has been successfully deactivated.',
        type: Card,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Card not found.',
    })
    async softDelete(@Param('id', ParseIntPipe) id: number): Promise<Card> {
        return await this.cardService.softDelete(id);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Permanently delete a card' })
    @ApiParam({ name: 'id', type: 'number', description: 'Card ID' })
    @ApiResponse({
        status: HttpStatus.NO_CONTENT,
        description: 'Card has been successfully deleted.',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Card not found.',
    })
    async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return await this.cardService.remove(id);
    }
}

