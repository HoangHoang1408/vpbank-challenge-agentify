import { DataSource } from 'typeorm';
import { RelationshipManager } from '../../rm/entities/rm.entity';
import { Customer } from '../../customer/entities/customer.entity';
import { FactRmTask } from '../../rm_task/entities/fact_rm_task.entity';
import { Card } from '../../card/entities/card.entity';
import { GeneratedEmail } from '../../gen_email/entities/generated-email.entity';
import configuration from '../../config/configuration';
import { RmSeeder } from '../seeders/rm.seeder';
import { CustomerSeeder } from '../seeders/customer.seeder';
import { TaskSeeder } from '../seeders/task.seeder';
import { CardSeeder } from '../seeders/card.seeder';

// Initialize DataSource
const config = configuration();
const AppDataSource = new DataSource({
    type: 'postgres',
    host: config.postgres.host,
    port: config.postgres.port,
    username: config.postgres.username,
    password: config.postgres.password,
    database: config.postgres.database,
    entities: [RelationshipManager, Customer, FactRmTask, Card, GeneratedEmail],
    synchronize: true,
    dropSchema: true, // This will drop and recreate the schema to handle enum changes
});

async function createMockData() {
    try {
        console.log('🚀 Đang kết nối đến cơ sở dữ liệu...');
        await AppDataSource.initialize();
        console.log('✅ Kết nối thành công!');

        // Initialize seeders
        const rmSeeder = new RmSeeder(AppDataSource);
        const customerSeeder = new CustomerSeeder(AppDataSource);
        const taskSeeder = new TaskSeeder(AppDataSource);
        const cardSeeder = new CardSeeder(AppDataSource);

        // Seed data
        const rms = await rmSeeder.seed(15);
        const customers = await customerSeeder.seed(200, rms);
        const tasks = await taskSeeder.seed(500, customers);
        const cards = await cardSeeder.seed();
        const totalAssignments = await cardSeeder.assignCardsToCustomers(customers, cards);

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('🎉 TẠO DỮ LIỆU MẪU THÀNH CÔNG!');
        console.log('='.repeat(60));
        console.log(`📊 Tổng kết:`);
        console.log(`   - Relationship Managers: ${rms.length}`);
        console.log(`   - Khách hàng: ${customers.length}`);
        console.log(`   - Nhiệm vụ: ${tasks.length}`);
        console.log(`   - Sản phẩm thẻ: ${cards.length}`);
        console.log(`   - Tổng số thẻ được gán: ${totalAssignments}`);
        console.log('='.repeat(60));

        // Additional statistics
        console.log('\n📈 Thống kê chi tiết:');
        rmSeeder.getStatistics(rms);
        customerSeeder.getStatistics(customers);
        taskSeeder.getStatistics(tasks);
        cardSeeder.getStatistics(cards);

        await AppDataSource.destroy();
        console.log('\n✅ Đã đóng kết nối cơ sở dữ liệu');

    } catch (error) {
        console.error('❌ Lỗi khi tạo dữ liệu mẫu:', error);
        process.exit(1);
    }
}

// Run the script
createMockData();

