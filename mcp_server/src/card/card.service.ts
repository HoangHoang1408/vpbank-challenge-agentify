import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Card } from './entities/card.entity';
import { CreateCardDto, UpdateCardDto, FilterCardDto } from './dto';

@Injectable()
export class CardService {
    constructor(
        @InjectRepository(Card)
        private readonly cardRepository: Repository<Card>,
    ) { }

    /**
     * Create a new card
     */
    async create(createCardDto: CreateCardDto): Promise<Card> {
        // Check if card with same product name already exists
        const existingCard = await this.cardRepository.findOne({
            where: { cardProductName: createCardDto.cardProductName },
        });

        if (existingCard) {
            throw new ConflictException(
                `Card with product name "${createCardDto.cardProductName}" already exists`,
            );
        }

        const card = this.cardRepository.create({
            ...createCardDto,
            isActive: createCardDto.isActive ?? true,
        });

        return await this.cardRepository.save(card);
    }

    /**
     * Find all cards with optional filters and pagination
     */
    async findAll(filterDto: FilterCardDto): Promise<{
        data: Card[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        const { page = 1, limit = 10, cardProductName, ...filters } = filterDto;
        const skip = (page - 1) * limit;

        const where: any = {};

        // Add filters
        if (filters.cardType) where.cardType = filters.cardType;
        if (filters.cardNetwork) where.cardNetwork = filters.cardNetwork;
        if (filters.isActive !== undefined) where.isActive = filters.isActive;

        // Handle card product name search with LIKE operator
        if (cardProductName) {
            where.cardProductName = Like(`%${cardProductName}%`);
        }

        const [data, total] = await this.cardRepository.findAndCount({
            where,
            skip,
            take: limit,
            order: {
                createdAt: 'DESC',
            },
        });

        const totalPages = Math.ceil(total / limit);

        return {
            data,
            total,
            page,
            limit,
            totalPages,
        };
    }

    /**
     * Find a card by ID
     */
    async findOne(id: number): Promise<Card> {
        const card = await this.cardRepository.findOne({
            where: { id },
        });

        if (!card) {
            throw new NotFoundException(`Card with ID ${id} not found`);
        }

        return card;
    }

    /**
     * Find a card by product name
     */
    async findByProductName(productName: string): Promise<Card> {
        const card = await this.cardRepository.findOne({
            where: { cardProductName: productName },
        });

        if (!card) {
            throw new NotFoundException(`Card with product name "${productName}" not found`);
        }

        return card;
    }

    /**
     * Update a card
     */
    async update(id: number, updateCardDto: UpdateCardDto): Promise<Card> {
        const card = await this.findOne(id);

        // Check if card product name is being changed and if new one already exists
        if (updateCardDto.cardProductName && updateCardDto.cardProductName !== card.cardProductName) {
            const existingCard = await this.cardRepository.findOne({
                where: { cardProductName: updateCardDto.cardProductName },
            });

            if (existingCard) {
                throw new ConflictException(
                    `Card with product name "${updateCardDto.cardProductName}" already exists`,
                );
            }
        }

        Object.assign(card, updateCardDto);
        return await this.cardRepository.save(card);
    }

    /**
     * Delete a card (soft delete by setting isActive to false)
     */
    async softDelete(id: number): Promise<Card> {
        const card = await this.findOne(id);
        card.isActive = false;
        return await this.cardRepository.save(card);
    }

    /**
     * Delete a card permanently
     */
    async remove(id: number): Promise<void> {
        const card = await this.findOne(id);
        await this.cardRepository.remove(card);
    }

    /**
     * Get card statistics
     */
    async getStatistics(): Promise<{
        total: number;
        active: number;
        inactive: number;
        byCardType: Record<string, number>;
        byCardNetwork: Record<string, number>;
    }> {
        const [total, active, inactive] = await Promise.all([
            this.cardRepository.count(),
            this.cardRepository.count({ where: { isActive: true } }),
            this.cardRepository.count({ where: { isActive: false } }),
        ]);

        const cards = await this.cardRepository.find();

        const byCardType = cards.reduce((acc, card) => {
            acc[card.cardType] = (acc[card.cardType] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const byCardNetwork = cards.reduce((acc, card) => {
            acc[card.cardNetwork] = (acc[card.cardNetwork] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            total,
            active,
            inactive,
            byCardType,
            byCardNetwork,
        };
    }
}

