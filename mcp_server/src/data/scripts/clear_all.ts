import { DataSource } from 'typeorm';
import { RelationshipManager } from '../../rm/entities/rm.entity';
import { Customer } from '../../customer/entities/customer.entity';
import { FactRmTask } from '../../rm_task/entities/fact_rm_task.entity';
import { Card } from '../../card/entities/card.entity';
import { GeneratedEmail } from '../../gen_email/entities/generated-email.entity';
import configuration from '../../config/configuration';

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

async function clearAllData() {
    try {
        console.log('🚀 Đang kết nối đến cơ sở dữ liệu...');
        await AppDataSource.initialize();
        console.log('✅ Kết nối thành công!');

        console.log('\n⚠️  BẮT ĐẦU XÓA TẤT CẢ DỮ LIỆU...');
        console.log('='.repeat(60));

        // Get repositories
        const taskRepository = AppDataSource.getRepository(FactRmTask);
        const cardRepository = AppDataSource.getRepository(Card);
        const emailRepository = AppDataSource.getRepository(GeneratedEmail);
        const customerRepository = AppDataSource.getRepository(Customer);
        const rmRepository = AppDataSource.getRepository(RelationshipManager);

        // Count before deletion
        const taskCount = await taskRepository.count();
        const cardCount = await cardRepository.count();
        const emailCount = await emailRepository.count();
        const customerCount = await customerRepository.count();
        const rmCount = await rmRepository.count();

        console.log('📊 Dữ liệu hiện tại:');
        console.log(`   - Nhiệm vụ RM: ${taskCount}`);
        console.log(`   - Thẻ: ${cardCount}`);
        console.log(`   - Email đã tạo: ${emailCount}`);
        console.log(`   - Khách hàng: ${customerCount}`);
        console.log(`   - Relationship Managers: ${rmCount}`);
        console.log('='.repeat(60));

        // Delete in correct order (respecting foreign key constraints)
        // Using createQueryBuilder().delete() to delete all records

        // 1. Delete Tasks first (depends on Customers and RMs)
        console.log('\n🗑️  Đang xóa nhiệm vụ RM...');
        if (taskCount > 0) {
            await taskRepository.createQueryBuilder().delete().execute();
        }
        console.log(`✅ Đã xóa ${taskCount} nhiệm vụ`);

        // 2. Delete Generated Emails (depends on Customers and RMs)
        console.log('\n🗑️  Đang xóa email đã tạo...');
        if (emailCount > 0) {
            await emailRepository.createQueryBuilder().delete().execute();
        }
        console.log(`✅ Đã xóa ${emailCount} email`);

        // 3. Delete Cards (depends on Customers)
        console.log('\n🗑️  Đang xóa thẻ...');
        if (cardCount > 0) {
            await cardRepository.createQueryBuilder().delete().execute();
        }
        console.log(`✅ Đã xóa ${cardCount} thẻ`);

        // 4. Delete Customers (depends on RMs)
        console.log('\n🗑️  Đang xóa khách hàng...');
        if (customerCount > 0) {
            await customerRepository.createQueryBuilder().delete().execute();
        }
        console.log(`✅ Đã xóa ${customerCount} khách hàng`);

        // 5. Delete RMs last (no dependencies)
        console.log('\n🗑️  Đang xóa Relationship Managers...');
        if (rmCount > 0) {
            await rmRepository.createQueryBuilder().delete().execute();
        }
        console.log(`✅ Đã xóa ${rmCount} Relationship Managers`);

        // Verify deletion
        console.log('\n🔍 Xác nhận dữ liệu đã được xóa...');
        const remainingTasks = await taskRepository.count();
        const remainingEmails = await emailRepository.count();
        const remainingCards = await cardRepository.count();
        const remainingCustomers = await customerRepository.count();
        const remainingRMs = await rmRepository.count();

        console.log('='.repeat(60));
        console.log('📊 Dữ liệu còn lại:');
        console.log(`   - Nhiệm vụ RM: ${remainingTasks}`);
        console.log(`   - Email đã tạo: ${remainingEmails}`);
        console.log(`   - Thẻ: ${remainingCards}`);
        console.log(`   - Khách hàng: ${remainingCustomers}`);
        console.log(`   - Relationship Managers: ${remainingRMs}`);
        console.log('='.repeat(60));

        if (remainingTasks === 0 && remainingEmails === 0 && remainingCards === 0 && remainingCustomers === 0 && remainingRMs === 0) {
            console.log('\n✅ ĐÃ XÓA TẤT CẢ DỮ LIỆU THÀNH CÔNG!');
            console.log('💾 Cơ sở dữ liệu hiện đã trống');
        } else {
            console.log('\n⚠️  CẢNH BÁO: Vẫn còn dữ liệu trong cơ sở dữ liệu');
        }

        await AppDataSource.destroy();
        console.log('\n✅ Đã đóng kết nối cơ sở dữ liệu');

    } catch (error) {
        console.error('❌ Lỗi khi xóa dữ liệu:', error);
        console.error('\n💡 Gợi ý:');
        console.error('   - Kiểm tra kết nối cơ sở dữ liệu');
        console.error('   - Đảm bảo không có ràng buộc foreign key đang chặn việc xóa');
        console.error('   - Kiểm tra quyền truy cập cơ sở dữ liệu');
        process.exit(1);
    }
}

// Confirmation prompt
console.log('⚠️  CẢNH BÁO: Script này sẽ XÓA TẤT CẢ dữ liệu trong cơ sở dữ liệu!');
console.log('📋 Các bảng sẽ bị xóa:');
console.log('   - FactRmTask (Nhiệm vụ RM)');
console.log('   - GeneratedEmail (Email đã tạo)');
console.log('   - Card (Thẻ)');
console.log('   - Customer (Khách hàng)');
console.log('   - RelationshipManager (RM)');
console.log('\n⏳ Bắt đầu trong 3 giây...\n');

setTimeout(() => {
    clearAllData();
}, 3000);

