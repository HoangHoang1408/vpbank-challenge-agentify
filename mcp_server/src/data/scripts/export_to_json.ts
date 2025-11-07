import { DataSource } from 'typeorm';
import { RelationshipManager } from '../../rm/entities/rm.entity';
import { Customer } from '../../customer/entities/customer.entity';
import { FactRmTask } from '../../rm_task/entities/fact_rm_task.entity';
import { Card } from '../../card/entities/card.entity';
import configuration from '../../config/configuration';
import * as fs from 'fs';
import * as path from 'path';

// Initialize DataSource
const config = configuration();
const AppDataSource = new DataSource({
    type: 'postgres',
    host: config.postgres.host,
    port: config.postgres.port,
    username: config.postgres.username,
    password: config.postgres.password,
    database: config.postgres.database,
    entities: [RelationshipManager, Customer, FactRmTask, Card],
    synchronize: false, // Don't modify schema
});

// Create exports directory if it doesn't exist
const exportDir = path.join(__dirname, '../exports');
if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
}

// Generate timestamp for filename
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];

async function exportToJson() {
    try {
        console.log('🚀 Đang kết nối đến cơ sở dữ liệu...');
        await AppDataSource.initialize();
        console.log('✅ Kết nối thành công!');

        console.log('\n📤 BẮT ĐẦU XUẤT DỮ LIỆU...');
        console.log('='.repeat(60));

        // Get repositories
        const rmRepository = AppDataSource.getRepository(RelationshipManager);
        const customerRepository = AppDataSource.getRepository(Customer);
        const taskRepository = AppDataSource.getRepository(FactRmTask);
        const cardRepository = AppDataSource.getRepository(Card);

        // Export Relationship Managers
        console.log('\n📊 Đang xuất Relationship Managers...');
        const rms = await rmRepository.find({
            order: { id: 'ASC' }
        });
        const rmFilePath = path.join(exportDir, `relationship_managers_${timestamp}.json`);
        fs.writeFileSync(rmFilePath, JSON.stringify(rms, null, 2), 'utf-8');
        console.log(`✅ Đã xuất ${rms.length} Relationship Managers`);
        console.log(`   📁 File: ${rmFilePath}`);

        // Export Customers (with relationships)
        console.log('\n📊 Đang xuất Customers...');
        const customers = await customerRepository.find({
            relations: ['relationshipManager', 'cards'],
            order: { id: 'ASC' }
        });
        const customerFilePath = path.join(exportDir, `customers_${timestamp}.json`);
        fs.writeFileSync(customerFilePath, JSON.stringify(customers, null, 2), 'utf-8');
        console.log(`✅ Đã xuất ${customers.length} Customers`);
        console.log(`   📁 File: ${customerFilePath}`);

        // Export Tasks (with relationships)
        console.log('\n📊 Đang xuất RM Tasks...');
        const tasks = await taskRepository.find({
            relations: ['relationshipManager', 'customer'],
            order: { id: 'ASC' }
        });
        const taskFilePath = path.join(exportDir, `rm_tasks_${timestamp}.json`);
        fs.writeFileSync(taskFilePath, JSON.stringify(tasks, null, 2), 'utf-8');
        console.log(`✅ Đã xuất ${tasks.length} RM Tasks`);
        console.log(`   📁 File: ${taskFilePath}`);

        // Export Cards (with relationships)
        console.log('\n📊 Đang xuất Cards...');
        const cards = await cardRepository.find({
            relations: ['customers'],
            order: { id: 'ASC' }
        });
        const cardFilePath = path.join(exportDir, `cards_${timestamp}.json`);
        fs.writeFileSync(cardFilePath, JSON.stringify(cards, null, 2), 'utf-8');
        console.log(`✅ Đã xuất ${cards.length} Cards`);
        console.log(`   📁 File: ${cardFilePath}`);

        // Export all data in one file
        console.log('\n📊 Đang tạo file tổng hợp...');
        const allData = {
            exportDate: new Date().toISOString(),
            statistics: {
                relationshipManagers: rms.length,
                customers: customers.length,
                tasks: tasks.length,
                cards: cards.length,
            },
            data: {
                relationshipManagers: rms,
                customers: customers,
                tasks: tasks,
                cards: cards,
            }
        };
        const allDataFilePath = path.join(exportDir, `database_export_${timestamp}.json`);
        fs.writeFileSync(allDataFilePath, JSON.stringify(allData, null, 2), 'utf-8');
        console.log(`✅ Đã tạo file tổng hợp`);
        console.log(`   📁 File: ${allDataFilePath}`);

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('🎉 XUẤT DỮ LIỆU THÀNH CÔNG!');
        console.log('='.repeat(60));
        console.log(`📊 Tổng kết:`);
        console.log(`   - Relationship Managers: ${rms.length}`);
        console.log(`   - Khách hàng: ${customers.length}`);
        console.log(`   - Nhiệm vụ: ${tasks.length}`);
        console.log(`   - Thẻ: ${cards.length}`);
        console.log(`\n📁 Thư mục xuất: ${exportDir}`);
        console.log(`📅 Timestamp: ${timestamp}`);
        console.log('='.repeat(60));

        // Calculate file sizes
        console.log('\n📦 Kích thước file:');
        const files = [
            { name: 'Relationship Managers', path: rmFilePath },
            { name: 'Customers', path: customerFilePath },
            { name: 'RM Tasks', path: taskFilePath },
            { name: 'Cards', path: cardFilePath },
            { name: 'Tổng hợp', path: allDataFilePath },
        ];

        let totalSize = 0;
        files.forEach(file => {
            const stats = fs.statSync(file.path);
            const sizeKB = (stats.size / 1024).toFixed(2);
            totalSize += stats.size;
            console.log(`   - ${file.name}: ${sizeKB} KB`);
        });
        console.log(`   - Tổng cộng: ${(totalSize / 1024).toFixed(2)} KB`);

        await AppDataSource.destroy();
        console.log('\n✅ Đã đóng kết nối cơ sở dữ liệu');

    } catch (error) {
        console.error('❌ Lỗi khi xuất dữ liệu:', error);
        console.error('\n💡 Gợi ý:');
        console.error('   - Kiểm tra kết nối cơ sở dữ liệu');
        console.error('   - Đảm bảo có quyền ghi vào thư mục exports');
        console.error('   - Kiểm tra cấu hình trong file .env');
        process.exit(1);
    }
}

// Run the script
console.log('📋 Script xuất dữ liệu sang JSON');
console.log('='.repeat(60));
console.log('📁 Dữ liệu sẽ được xuất vào thư mục: src/data/exports/');
console.log('📝 Các file sẽ được tạo:');
console.log('   - relationship_managers_[date].json');
console.log('   - customers_[date].json');
console.log('   - rm_tasks_[date].json');
console.log('   - cards_[date].json');
console.log('   - database_export_[date].json (tổng hợp)');
console.log('='.repeat(60));
console.log('\n⏳ Bắt đầu xuất dữ liệu...\n');

exportToJson();

