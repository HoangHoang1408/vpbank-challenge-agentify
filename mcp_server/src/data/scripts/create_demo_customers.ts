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
    synchronize: false,
});

/**
 * Generate demo customers with birthdays spread around the current date
 * This creates customers with birthdays for:
 * - Today
 * - Tomorrow
 * - Next 7 days
 * - Also includes varied card renewal dates and segment milestones for comprehensive demo
 */
async function createDemoCustomers() {
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
        console.log('\n👥 Đang tạo khách hàng DEMO với sinh nhật trong tuần...\n');

        const today = new Date();
        const jobTitles = Object.values(JobTitle);
        const genders = [Gender.MALE, Gender.FEMALE, Gender.OTHER];
        const allSegments = Object.values(Segment);
        const highTierSegments = [Segment.DIAMOND_ELITE, Segment.DIAMOND, Segment.PRE_DIAMOND];

        const createdCustomers: Customer[] = [];
        
        // Configuration: Create customers for the next 7 days
        const daysToCreate = 7;
        const customersPerDay = 3; // 3 customers per day

        console.log(`📅 Tạo ${customersPerDay} khách hàng cho mỗi ngày (${daysToCreate} ngày)\n`);

        for (let dayOffset = 0; dayOffset < daysToCreate; dayOffset++) {
            const birthdayDate = new Date(today);
            birthdayDate.setDate(today.getDate() + dayOffset);
            
            const dateLabel = dayOffset === 0 ? 'HÔM NAY' : 
                            dayOffset === 1 ? 'NGÀY MAI' : 
                            `${dayOffset} NGÀY NỮA`;
            
            console.log(`\n📆 Ngày: ${birthdayDate.toISOString().split('T')[0]} (${dateLabel})`);
            console.log('─'.repeat(60));

            for (let i = 0; i < customersPerDay; i++) {
                // Select RM (distribute evenly)
                const rm = rms[createdCustomers.length % rms.length];
                
                const gender = randomElement(genders);
                const name = generateVietnameseName(gender);
                const addressData = generateVietnameseAddress();

                // Set DOB to match the birthday date (random age 25-70)
                const ageYears = 25 + Math.floor(Math.random() * 45);
                const dob = new Date(birthdayDate);
                dob.setFullYear(birthdayDate.getFullYear() - ageYears);

                // Vary the account age and segment for diversity
                let createdAt: Date;
                let segment: Segment;
                let milestoneNote = '';

                if (dayOffset % 3 === 0 && i === 0) {
                    // Account anniversary customer (1, 3, or 5 years)
                    const years = [1, 3, 5][dayOffset % 3];
                    createdAt = new Date(today);
                    createdAt.setFullYear(today.getFullYear() - years);
                    segment = randomElement(allSegments);
                    milestoneNote = `| Kỷ niệm ${years} năm`;
                } else if (dayOffset % 2 === 1 && i === 1) {
                    // High-tier segment (recently achieved)
                    const daysAgo = Math.floor(Math.random() * 5) + 1; // 1-5 days ago
                    createdAt = new Date(today);
                    createdAt.setDate(today.getDate() - daysAgo);
                    segment = randomElement(highTierSegments);
                    milestoneNote = `| Đạt ${segment} (${daysAgo} ngày trước)`;
                } else {
                    // Regular customer (random account age)
                    const accountAgeMonths = 6 + Math.floor(Math.random() * 30); // 6-36 months
                    createdAt = new Date(today);
                    createdAt.setMonth(today.getMonth() - accountAgeMonths);
                    segment = randomElement(allSegments);
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

                // Assign cards with varied renewal dates
                const numberOfCards = 1 + Math.floor(Math.random() * 2); // 1 or 2 cards
                const selectedCards: Card[] = [];

                for (let j = 0; j < numberOfCards; j++) {
                    const randomCard = cards[Math.floor(Math.random() * cards.length)];
                    if (!selectedCards.some(c => c.id === randomCard.id)) {
                        selectedCards.push(randomCard);
                    }
                }

                savedCustomer.cards = selectedCards;
                await customerRepository.save(savedCustomer);

                // Calculate card renewal info
                let cardRenewalNote = '';
                if (selectedCards.length > 0) {
                    // Some customers will have cards needing renewal
                    if (dayOffset < 3) {
                        cardRenewalNote = `| ${selectedCards.length} thẻ cần gia hạn trong 30 ngày`;
                    }
                }

                console.log(`   ${i + 1}. ${name} (${segment}) ${milestoneNote} ${cardRenewalNote}`);
                console.log(`      RM: ${rm.name} | DOB: ${dob.toISOString().split('T')[0]}`);

                createdCustomers.push(savedCustomer);
            }
        }

        // Create additional "special case" customers
        console.log('\n\n🌟 Tạo khách hàng ĐẶC BIỆT (đủ TẤT CẢ điều kiện)');
        console.log('─'.repeat(60));

        // Create 3 customers who meet ALL conditions
        for (let i = 0; i < 3; i++) {
            const rm = rms[i % rms.length];
            const gender = randomElement(genders);
            const name = generateVietnameseName(gender);
            const addressData = generateVietnameseAddress();

            // Birthday TODAY
            const ageYears = 30 + i * 10; // 30, 40, 50
            const dob = new Date(today);
            dob.setFullYear(today.getFullYear() - ageYears);

            // Account anniversary
            const years = [1, 3, 5][i];
            const createdAt = new Date(today);
            createdAt.setFullYear(today.getFullYear() - years);

            const customer = customerRepository.create({
                customerId: generateCustomerId(),
                name: name,
                email: generateEmail(name),
                phone: generatePhone(),
                address: addressData.address,
                gender: gender,
                jobTitle: randomElement(jobTitles),
                segment: highTierSegments[i % highTierSegments.length],
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

            // Assign 2 cards
            const selectedCards = [cards[i % cards.length], cards[(i + 1) % cards.length]];
            savedCustomer.cards = selectedCards;
            await customerRepository.save(savedCustomer);

            console.log(`   ⭐ ${name} (${savedCustomer.segment})`);
            console.log(`      ✓ Sinh nhật: HÔM NAY | ✓ Kỷ niệm: ${years} năm | ✓ Thẻ: ${selectedCards.length} thẻ cần gia hạn`);

            createdCustomers.push(savedCustomer);
        }

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('🎉 TẠO KHÁCH HÀNG DEMO THÀNH CÔNG!');
        console.log('='.repeat(60));
        console.log(`📊 Tổng kết:`);
        console.log(`   - Số lượng RMs: ${rms.length}`);
        console.log(`   - Khách hàng tạo mới: ${createdCustomers.length}`);
        console.log(`   - Khách hàng sinh nhật ${daysToCreate} ngày tới: ${daysToCreate * customersPerDay}`);
        console.log(`   - Khách hàng ĐẶC BIỆT (đủ TẤT CẢ điều kiện): 3`);
        console.log('='.repeat(60));

        console.log('\n📅 Phân bổ sinh nhật:');
        const birthdayGroups = new Map<string, number>();
        for (let i = 0; i < daysToCreate; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            birthdayGroups.set(dateStr, customersPerDay);
        }
        const todayStr = today.toISOString().split('T')[0];
        birthdayGroups.set(todayStr, (birthdayGroups.get(todayStr) || 0) + 3); // Add special customers

        birthdayGroups.forEach((count, date) => {
            const label = date === todayStr ? '(HÔM NAY) ⭐' : '';
            console.log(`   ${date}: ${count} khách hàng ${label}`);
        });

        console.log('\n✅ Sẵn sàng để DEMO các tính năng:');
        console.log('   ✓ BIRTHDAY: Sinh nhật từ hôm nay đến 7 ngày tới');
        console.log('   ✓ CARD_RENEWAL: Một số khách có thẻ cần gia hạn');
        console.log('   ✓ SEGMENT_MILESTONE: Kỷ niệm tài khoản và phân khúc cao');

        await AppDataSource.destroy();
        console.log('\n✅ Đã đóng kết nối cơ sở dữ liệu');

    } catch (error) {
        console.error('❌ Lỗi khi tạo khách hàng demo:', error);
        process.exit(1);
    }
}

// Run the script
createDemoCustomers();

