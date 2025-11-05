import { DataSource, Repository } from 'typeorm';
import { Card, CardType, CardNetwork } from '../../card/entities/card.entity';
import { Customer } from '../../customer/entities/customer.entity';
import { cardProducts } from '../constants/card-products';
import { randomElement, randomInt } from '../utils/generators';

/**
 * Seeder class for Card Products
 */
export class CardSeeder {
    private cardRepository: Repository<Card>;
    private customerRepository: Repository<Customer>;

    constructor(private dataSource: DataSource) {
        this.cardRepository = this.dataSource.getRepository(Card);
        this.customerRepository = this.dataSource.getRepository(Customer);
    }

    /**
     * Seed card products data
     * @returns Array of created card products
     */
    async seed(): Promise<Card[]> {
        console.log(`\n💳 Đang tạo dữ liệu Sản phẩm thẻ...`);

        const cards: Card[] = [];

        // Create card products (only 9 products as defined)
        for (const product of cardProducts) {
            const card = this.cardRepository.create({
                cardType: product.cardType,
                cardProductName: product.cardProductName,
                cardDescription: product.cardDescription,
                targetDescription: product.targetDescription,
                cardNetwork: product.cardNetwork,
                isActive: true,
            });
            cards.push(await this.cardRepository.save(card));
        }

        console.log(`✅ Đã tạo ${cards.length} sản phẩm thẻ`);
        return cards;
    }

    /**
     * Assign cards to customers (many-to-many relationship)
     * @param customers Array of customers
     * @param cards Array of card products
     * @returns Total number of card assignments
     */
    async assignCardsToCustomers(customers: Customer[], cards: Card[]): Promise<number> {
        console.log(`\n🔗 Đang gán thẻ cho khách hàng...`);

        let totalAssignments = 0;

        for (const customer of customers) {
            // Each customer gets 1-3 cards randomly
            const numberOfCards = randomInt(1, 3);
            const selectedCards: Card[] = [];

            // Randomly select unique card products for this customer
            while (selectedCards.length < numberOfCards) {
                const randomCard = randomElement(cards);
                if (!selectedCards.includes(randomCard)) {
                    selectedCards.push(randomCard);
                }
            }

            customer.cards = selectedCards;
            await this.customerRepository.save(customer);
            totalAssignments += selectedCards.length;
        }

        console.log(`✅ Đã gán ${totalAssignments} thẻ cho khách hàng`);
        return totalAssignments;
    }

    /**
     * Get statistics about cards
     */
    getStatistics(cards: Card[]): void {
        const activeCards = cards.filter(c => c.isActive).length;
        console.log(`   - Sản phẩm thẻ hoạt động: ${activeCards}/${cards.length}`);

        const creditCards = cards.filter(c => c.cardType === CardType.CREDIT).length;
        const debitCards = cards.filter(c => c.cardType === CardType.DEBIT).length;
        console.log(`   - Loại sản phẩm thẻ:`);
        console.log(`     • Thẻ tín dụng: ${creditCards} sản phẩm`);
        console.log(`     • Thẻ ghi nợ: ${debitCards} sản phẩm`);

        const cardNetworkCounts = {
            VISA: cards.filter(c => c.cardNetwork === CardNetwork.VISA).length,
            MASTERCARD: cards.filter(c => c.cardNetwork === CardNetwork.MASTERCARD).length,
        };
        console.log(`   - Mạng lưới thẻ:`);
        Object.entries(cardNetworkCounts).forEach(([network, count]) => {
            console.log(`     • ${network}: ${count} sản phẩm`);
        });

        console.log(`   - Danh sách sản phẩm thẻ:`);
        cards.forEach(card => {
            console.log(`     • ${card.cardProductName} (${card.cardType})`);
        });
    }
}

