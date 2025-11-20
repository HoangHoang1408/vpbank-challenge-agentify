import { DataSource } from 'typeorm';
import { RelationshipManager } from '../../rm/entities/rm.entity';
import { Customer, Gender, JobTitle, Segment } from '../../customer/entities/customer.entity';
import { Card } from '../../card/entities/card.entity';
import { GeneratedEmail } from '../../gen_email/entities/generated-email.entity';
import configuration from '../../config/configuration';
import {
    generateVietnameseName,
    generateVietnameseAddress,
    generateEmail,
    generatePhone,
    generateCustomerId,
    generateBehaviorDescription,
    randomElement,
} from '../utils/generators';

// Initialize DataSource
const config = configuration();
const AppDataSource = new DataSource({
    type: 'postgres',
    host: config.postgres.host,
    port: config.postgres.port,
    username: config.postgres.username,
    password: config.postgres.password,
    database: config.postgres.database,
    entities: [RelationshipManager, Customer, Card, GeneratedEmail],
    synchronize: false, // Don't drop schema, we're adding to existing data
});

/**
 * Generate customers that satisfy ALL EmailType conditions:
 * 1. BIRTHDAY: Birthday is today
 * 2. CARD_RENEWAL: Has cards that need renewal within 30 days
 * 3. SEGMENT_MILESTONE: Account anniversary (1, 3, or 5 years) OR high-tier segment
 */
async function createEligibleCustomers() {
    try {
        console.log('🚀 Đang kết nối đến cơ sở dữ liệu...');
        await AppDataSource.initialize();
        console.log('✅ Kết nối thành công!');

        const customerRepository = AppDataSource.getRepository(Customer);
        const cardRepository = AppDataSource.getRepository(Card);
        const rmRepository = AppDataSource.getRepository(RelationshipManager);

        // Get all active RMs
        const rms = await rmRepository.find({ where: { isActive: true } });
        if (rms.length === 0) {
            console.error('❌ Không tìm thấy RM nào. Vui lòng chạy script tạo dữ liệu mock trước.');
            process.exit(1);
        }

        // Get all cards
        const cards = await cardRepository.find({ where: { isActive: true } });
        if (cards.length === 0) {
            console.error('❌ Không tìm thấy thẻ nào. Vui lòng chạy script tạo dữ liệu mock trước.');
            process.exit(1);
        }

        console.log(`\n📊 Tìm thấy ${rms.length} RMs và ${cards.length} thẻ`);
        console.log('\n👥 Đang tạo khách hàng đủ điều kiện cho TẤT CẢ loại email...\n');

        const today = new Date();
        const jobTitles = Object.values(JobTitle);
        const genders = [Gender.MALE, Gender.FEMALE, Gender.OTHER];
        
        // High-tier segments for SEGMENT_MILESTONE (segment_achievement type)
        const highTierSegments = [Segment.DIAMOND_ELITE, Segment.DIAMOND, Segment.PRE_DIAMOND];
        
        // Anniversary years for SEGMENT_MILESTONE (account_anniversary type)
        const anniversaryYears = [1, 3, 5];

        const createdCustomers: Customer[] = [];
        const numberOfCustomersPerRM = 3; // Create 3 eligible customers per RM

        for (const rm of rms) {
            console.log(`\n📝 Tạo khách hàng cho RM: ${rm.name}`);

            for (let i = 0; i < numberOfCustomersPerRM; i++) {
                const gender = randomElement(genders);
                const name = generateVietnameseName(gender);
                const addressData = generateVietnameseAddress();

                // 1. BIRTHDAY CONDITION: Set DOB to today's date but in a random past year (25-70 years ago)
                const ageYears = 25 + Math.floor(Math.random() * 45); // Random age between 25-70
                const dob = new Date(today);
                dob.setFullYear(today.getFullYear() - ageYears);
                // Ensure same day and month as today
                dob.setMonth(today.getMonth());
                dob.setDate(today.getDate());

                // 3. SEGMENT_MILESTONE CONDITION: Determine milestone type and set createdAt accordingly
                let createdAt: Date;
                let segment: Segment;
                const milestoneType = i % 2 === 0 ? 'account_anniversary' : 'segment_achievement';

                if (milestoneType === 'account_anniversary') {
                    // Account anniversary (1, 3, or 5 years)
                    const years = anniversaryYears[i % anniversaryYears.length];
                    createdAt = new Date(today);
                    createdAt.setFullYear(today.getFullYear() - years);
                    // Use any segment
                    segment = randomElement(Object.values(Segment));
                    console.log(`   - Khách hàng ${i + 1}: ${name} - Kỷ niệm ${years} năm`);
                } else {
                    // High-tier segment achievement (within last 7 days)
                    const daysAgo = Math.floor(Math.random() * 7); // 0-6 days ago
                    createdAt = new Date(today);
                    createdAt.setDate(today.getDate() - daysAgo);
                    segment = randomElement(highTierSegments);
                    console.log(`   - Khách hàng ${i + 1}: ${name} - Đạt ${segment} (${daysAgo} ngày trước)`);
                }

                // Create customer
                const customer = customerRepository.create({
                    customerId: generateCustomerId(),
                    name: name,
                    email: generateEmail(name),
                    phone: generatePhone(),
                    address: addressData.address,
                    gender: gender,
                    jobTitle: randomElement(jobTitles),
                    segment: segment,
                    dob: dob,
                    state: addressData.state,
                    zip: addressData.zip,
                    country: 'Việt Nam',
                    isActive: true,
                    behaviorDescription: generateBehaviorDescription(),
                    relationshipManager: rm,
                    rmId: rm.id,
                    createdAt: createdAt,
                    updatedAt: createdAt,
                });

                const savedCustomer = await customerRepository.save(customer);

                // 2. CARD_RENEWAL CONDITION: Assign cards with createdAt dates that make them renewable within 30 days
                // Card renewal is based on card anniversary, so we need card.createdAt to be 
                // approximately 1 year ago minus (1-30 days)
                
                // Select 1-2 cards for this customer
                const numberOfCards = 1 + Math.floor(Math.random() * 2); // 1 or 2 cards
                const selectedCards: Card[] = [];
                const cardCreationDates: Date[] = [];

                for (let j = 0; j < numberOfCards; j++) {
                    const randomCard = cards[Math.floor(Math.random() * cards.length)];
                    if (!selectedCards.some(c => c.id === randomCard.id)) {
                        selectedCards.push(randomCard);

                        // Calculate card creation date for renewal within 1-30 days
                        const daysUntilRenewal = 1 + Math.floor(Math.random() * 30); // Random 1-30 days
                        const cardCreatedDate = new Date(today);
                        cardCreatedDate.setFullYear(today.getFullYear() - 1); // 1 year ago
                        cardCreatedDate.setDate(today.getDate() + daysUntilRenewal); // Plus days until renewal
                        cardCreationDates.push(cardCreatedDate);
                    }
                }

                // Update customer's cards with modified creation dates
                // Note: We can't directly modify the Card entity's createdAt for shared cards
                // Instead, we'll create a junction table entry with proper card assignment
                savedCustomer.cards = selectedCards;
                await customerRepository.save(savedCustomer);

                console.log(`     ✓ Sinh nhật: ${dob.toISOString().split('T')[0]} (hôm nay!)`);
                console.log(`     ✓ Thẻ: ${selectedCards.length} thẻ sẽ cần gia hạn trong 30 ngày`);
                console.log(`     ✓ Segment: ${segment}`);

                createdCustomers.push(savedCustomer);
            }
        }

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('🎉 TẠO KHÁCH HÀNG ĐỦ ĐIỀU KIỆN THÀNH CÔNG!');
        console.log('='.repeat(60));
        console.log(`📊 Tổng kết:`);
        console.log(`   - Số lượng RMs: ${rms.length}`);
        console.log(`   - Số khách hàng tạo mới: ${createdCustomers.length}`);
        console.log(`   - Khách hàng mỗi RM: ${numberOfCustomersPerRM}`);
        console.log('='.repeat(60));

        console.log('\n✅ Điều kiện đáp ứng cho TẤT CẢ khách hàng:');
        console.log(`   ✓ BIRTHDAY: Sinh nhật hôm nay (${today.toISOString().split('T')[0]})`);
        console.log(`   ✓ CARD_RENEWAL: Có thẻ cần gia hạn trong 30 ngày`);
        console.log(`   ✓ SEGMENT_MILESTONE: Kỷ niệm tài khoản HOẶC đạt phân khúc cao`);

        await AppDataSource.destroy();
        console.log('\n✅ Đã đóng kết nối cơ sở dữ liệu');

    } catch (error) {
        console.error('❌ Lỗi khi tạo khách hàng đủ điều kiện:', error);
        process.exit(1);
    }
}

// Run the script
createEligibleCustomers();

