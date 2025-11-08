import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Card, CardType, CardNetwork } from "src/card/entities/card.entity";
import { Repository } from "typeorm";
import { type Context, Tool } from "@rekog/mcp-nest";
import type { Request } from "express";
import z from "zod";

@Injectable()
export class CardTool {
    constructor(
        @InjectRepository(Card)
        private readonly cardRepository: Repository<Card>,
    ) { }

    @Tool({
        name: "find_card_product",
        description: "Tool to search for a card product by various criteria. Returns card product information if found, or a message asking for more specific information if multiple products match.",
        parameters: z.object({
            cardType: z.optional(z.nativeEnum(CardType, {
                "description": "The type of card product to search for",
            })),
            cardProductName: z.optional(z.string({
                "description": "The specific name of the card product",
            })),
            cardNetwork: z.optional(z.nativeEnum(CardNetwork, {
                "description": "The card network provider",
            })),
        })
    })
    async findCardProduct({
        cardType,
        cardProductName,
        cardNetwork
    }: {
        cardType?: CardType;
        cardProductName?: string;
        cardNetwork?: CardNetwork;
    }, context: Context, request: Request) {
        // Build query builder with optimized select
        const queryBuilder = this.cardRepository
            .createQueryBuilder('card')
            .select([
                'card.id',
                'card.cardType',
                'card.cardProductName',
                'card.cardDescription',
                'card.targetDescription',
                'card.cardNetwork',
                'card.isActive'
            ]);

        // Track which fields were used in search for later analysis
        const usedFields = new Set<string>();

        // Build WHERE conditions using parameterized queries for better performance and security
        if (cardType) {
            queryBuilder.andWhere('card.cardType = :cardType', {
                cardType
            });
            usedFields.add('cardType');
        }
        if (cardProductName) {
            queryBuilder.andWhere('card.cardProductName ILIKE :cardProductName', {
                cardProductName: `%${cardProductName}%`
            });
            usedFields.add('cardProductName');
        }
        if (cardNetwork) {
            queryBuilder.andWhere('card.cardNetwork = :cardNetwork', {
                cardNetwork
            });
            usedFields.add('cardNetwork');
        }

        // If no conditions provided, return empty result
        if (usedFields.size === 0) {
            return {
                product_info: {},
                message: "No search criteria provided. Please provide at least one information (card type, product name, or card network) to search for a card product."
            };
        }

        try {
            // Execute the optimized query
            const cards = await queryBuilder.getMany();

            // Check the number of results
            if (!cards || cards.length === 0) {
                return {
                    product_info: {},
                    message: "No card product found matching the provided criteria. Please ask back for different information."
                };
            }

            if (cards.length > 1) {
                // Find the column with the most unique values using efficient Set operations
                const cols = ["cardType", "cardProductName", "cardDescription", "targetDescription", "cardNetwork", "isActive"];
                let maxValueCount: [string, number] = ["cardProductName", 0];

                for (const col of cols) {
                    // Skip id field
                    if (col === "id") continue;

                    const uniqueValues = new Set(
                        cards.map(c => {
                            const val = (c as any)[col];
                            return val ?? null;
                        })
                    );
                    const count = uniqueValues.size;
                    if (count > maxValueCount[1]) {
                        maxValueCount = [col, count];
                    }
                }

                // Check if this field was already used in the search
                const fieldName = maxValueCount[0];
                const wasUsedInSearch = usedFields.has(fieldName);

                return {
                    product_info: {},
                    message: wasUsedInSearch
                        ? `Multiple card products (${cards.length}) found matching the criteria. Please ask back for full ${fieldName}.`
                        : `Multiple card products (${cards.length}) found matching the criteria. Please ask back for ${fieldName}.`
                };
            }

            // Exactly one card product found
            const card = cards[0];
            const productInfo = {
                id: card.id,
                cardType: card.cardType,
                cardProductName: card.cardProductName,
                cardDescription: card.cardDescription,
                targetDescription: card.targetDescription,
                cardNetwork: card.cardNetwork,
                isActive: card.isActive,
            };

            return {
                product_info: productInfo,
                message: card.isActive
                    ? "Card product found successfully."
                    : "Warning: Card product is not active."
            };

        } catch (error) {
            return {
                product_info: {},
                message: `An error occurred while searching for card product: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
}

