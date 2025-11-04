import { DataSource } from 'typeorm';
import { RelationshipManager } from '../rm.entity';
import { Customer, Gender, JobTitle, Segment } from '../../customer/entities/customer.entity';
import { FactRmTask, TaskType, TaskStatus } from '../fact_rm_task.entity';
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
    entities: [RelationshipManager, Customer, FactRmTask],
    synchronize: true,
    dropSchema: true, // This will drop and recreate the schema to handle enum changes
});

// Vietnamese names data
const vietnameseLastNames = [
    'Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng',
    'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý', 'Đinh', 'Mai', 'Tô', 'Trương'
];

const vietnameseMaleMiddleNames = [
    'Văn', 'Đức', 'Hữu', 'Quang', 'Minh', 'Thành', 'Tuấn', 'Anh', 'Công', 'Duy'
];

const vietnameseFemaleMiddleNames = [
    'Thị', 'Thu', 'Thanh', 'Hương', 'Phương', 'Lan', 'Mai', 'Kim', 'Hồng', 'Ngọc'
];

const vietnameseMaleFirstNames = [
    'Hùng', 'Nam', 'Long', 'Bình', 'Khang', 'Kiên', 'Phong', 'Toàn', 'Tùng', 'Hoàng',
    'Việt', 'Quân', 'Hải', 'Đức', 'Thắng', 'Hưng', 'Sơn', 'Tâm', 'Trung', 'Cường'
];

const vietnameseFemaleFirstNames = [
    'Linh', 'Hà', 'Trang', 'Anh', 'Nga', 'Hương', 'Thảo', 'Chi', 'Nhung', 'Vy',
    'Phương', 'Ngân', 'Yến', 'Dung', 'Hạnh', 'Tú', 'Hằng', 'Giang', 'Nhi', 'My'
];

// Vietnamese cities and provinces
const vietnameseCities = [
    { city: 'Hà Nội', districts: ['Ba Đình', 'Hoàn Kiếm', 'Cầu Giấy', 'Đống Đa', 'Hai Bà Trưng', 'Thanh Xuân', 'Long Biên', 'Hoàng Mai'] },
    { city: 'Hồ Chí Minh', districts: ['Quận 1', 'Quận 2', 'Quận 3', 'Quận 7', 'Bình Thạnh', 'Phú Nhuận', 'Thủ Đức', 'Tân Bình'] },
    { city: 'Đà Nẵng', districts: ['Hải Châu', 'Thanh Khê', 'Sơn Trà', 'Ngũ Hành Sơn', 'Liên Chiểu', 'Cẩm Lệ'] },
    { city: 'Hải Phòng', districts: ['Hồng Bàng', 'Ngô Quyền', 'Lê Chân', 'Kiến An', 'Đồ Sơn'] },
    { city: 'Cần Thơ', districts: ['Ninh Kiều', 'Cái Răng', 'Bình Thủy', 'Ô Môn', 'Thốt Nốt'] },
];

// Vietnamese streets
const vietnameseStreets = [
    'Trần Hưng Đạo', 'Lê Lợi', 'Nguyễn Huệ', 'Hai Bà Trưng', 'Lý Thái Tổ', 'Trần Phú',
    'Hoàng Văn Thụ', 'Phan Chu Trinh', 'Võ Nguyên Giáp', 'Điện Biên Phủ', 'Cách Mạng Tháng Tám',
    'Nguyễn Thị Minh Khai', 'Lê Duẩn', 'Phan Đình Phùng', 'Nam Kỳ Khởi Nghĩa'
];

// Helper functions
function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement<T>(array: T[]): T {
    return array[randomInt(0, array.length - 1)];
}

function generateVietnameseName(gender: Gender): string {
    const lastName = randomElement(vietnameseLastNames);

    if (gender === Gender.MALE) {
        const middleName = randomElement(vietnameseMaleMiddleNames);
        const firstName = randomElement(vietnameseMaleFirstNames);
        return `${lastName} ${middleName} ${firstName}`;
    } else if (gender === Gender.FEMALE) {
        const middleName = randomElement(vietnameseFemaleMiddleNames);
        const firstName = randomElement(vietnameseFemaleFirstNames);
        return `${lastName} ${middleName} ${firstName}`;
    } else {
        const middleName = randomElement([...vietnameseMaleMiddleNames, ...vietnameseFemaleMiddleNames]);
        const firstName = randomElement([...vietnameseMaleFirstNames, ...vietnameseFemaleFirstNames]);
        return `${lastName} ${middleName} ${firstName}`;
    }
}

function generateVietnameseAddress(): { address: string; state: string; zip: string } {
    const cityData = randomElement(vietnameseCities);
    const district = randomElement(cityData.districts);
    const street = randomElement(vietnameseStreets);
    const houseNumber = randomInt(1, 999);

    return {
        address: `${houseNumber} ${street}, ${district}`,
        state: cityData.city,
        zip: `${randomInt(100000, 999999)}`
    };
}

function generateEmail(name: string): string {
    const nameWithoutAccents = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/\s+/g, '.');
    const domains = ['gmail.com', 'vpbank.com.vn', 'outlook.com', 'yahoo.com'];
    return `${nameWithoutAccents}${randomInt(1, 999)}@${randomElement(domains)}`;
}

function generatePhone(): string {
    const prefixes = ['091', '094', '088', '083', '084', '085', '081', '082', '096', '097', '098', '032', '033', '034', '035', '036', '037', '038', '039'];
    return `+84${randomElement(prefixes)}${randomInt(1000000, 9999999)}`;
}

function generateDOB(minAge: number, maxAge: number): Date {
    const today = new Date();
    const birthYear = today.getFullYear() - randomInt(minAge, maxAge);
    const birthMonth = randomInt(0, 11);
    const birthDay = randomInt(1, 28);
    return new Date(birthYear, birthMonth, birthDay);
}

function generateTaskId(): string {
    return `TASK-${Date.now()}-${randomInt(1000, 9999)}`;
}

function generateCustomerId(): string {
    return `CUS-${randomInt(100000, 999999)}`;
}

function generateEmployeeId(): number {
    return randomInt(10000, 99999);
}

// Task descriptions in Vietnamese
const taskDescriptions = {
    [TaskType.CALL]: [
        'Gọi điện tư vấn sản phẩm thẻ tín dụng VPBank',
        'Liên hệ khách hàng về gói ưu đãi lãi suất',
        'Gọi điện xác nhận thông tin cập nhật tài khoản',
        'Tư vấn gói bảo hiểm kết hợp tiết kiệm',
        'Giới thiệu dịch vụ ngân hàng số VPBank NEO',
    ],
    [TaskType.EMAIL]: [
        'Gửi email thông tin sản phẩm đầu tư chứng khoán',
        'Gửi catalog các sản phẩm vay ưu đãi',
        'Gửi báo cáo tài chính định kỳ cho khách hàng',
        'Gửi thông tin về chương trình khuyến mãi mới',
        'Gửi hướng dẫn sử dụng dịch vụ Mobile Banking',
    ],
    [TaskType.MEETING]: [
        'Họp tư vấn kế hoạch tài chính cá nhân',
        'Gặp gỡ thảo luận gói vay mua nhà',
        'Họp giới thiệu sản phẩm Private Banking',
        'Gặp khách hàng để ký hợp đồng vay',
        'Họp tư vấn đầu tư quỹ mở',
    ],
    [TaskType.FOLLOW_UP]: [
        'Theo dõi tiến độ hồ sơ vay của khách hàng',
        'Kiểm tra tình trạng giải quyết khiếu nại',
        'Theo dõi kết quả đăng ký thẻ tín dụng',
        'Cập nhật tình trạng mở tài khoản',
        'Theo dõi phản hồi về dịch vụ',
    ],
    [TaskType.SEND_INFOR_PACKAGE]: [
        'Gửi tài liệu hồ sơ vay tín chấp',
        'Gửi gói thông tin về các sản phẩm tiết kiệm',
        'Gửi bộ hồ sơ mở tài khoản doanh nghiệp',
        'Gửi tài liệu về dịch vụ treasury',
        'Gửi thông tin sản phẩm bảo lãnh ngân hàng',
    ],
};

async function createMockData() {
    try {
        console.log('🚀 Đang kết nối đến cơ sở dữ liệu...');
        await AppDataSource.initialize();
        console.log('✅ Kết nối thành công!');

        // Create Relationship Managers
        console.log('\n📋 Đang tạo dữ liệu Relationship Managers...');
        const rmRepository = AppDataSource.getRepository(RelationshipManager);
        const rms: RelationshipManager[] = [];

        const rmTitles = [
            'Chuyên viên quan hệ khách hàng cá nhân cao cấp',
            'Trưởng nhóm QLKH',
            'Giám đốc khách hàng doanh nghiệp',
            'Chuyên viên QLKH Senior',
            'Chuyên viên Private Banking',
        ];

        const rmLevels = ['Senior', 'Manager', 'Associate', 'Director', 'Vice President'];

        for (let i = 0; i < 15; i++) {
            const gender = randomElement([Gender.MALE, Gender.FEMALE]);
            const rm = rmRepository.create({
                employeeId: generateEmployeeId(),
                name: generateVietnameseName(gender),
                dob: generateDOB(28, 50),
                level: randomElement(rmLevels),
                title: randomElement(rmTitles),
                hireDate: new Date(randomInt(2015, 2023), randomInt(0, 11), randomInt(1, 28)),
                isActive: Math.random() > 0.1, // 90% active
            });
            rms.push(await rmRepository.save(rm));
        }
        console.log(`✅ Đã tạo ${rms.length} Relationship Managers`);

        // Create Customers
        console.log('\n👥 Đang tạo dữ liệu Khách hàng...');
        const customerRepository = AppDataSource.getRepository(Customer);
        const customers: Customer[] = [];

        const segments = Object.values(Segment);
        const jobTitles = Object.values(JobTitle);
        const genders = [Gender.MALE, Gender.FEMALE, Gender.OTHER];

        for (let i = 0; i < 200; i++) {
            const gender = randomElement(genders);
            const name = generateVietnameseName(gender);
            const addressData = generateVietnameseAddress();

            const customer = customerRepository.create({
                customerId: generateCustomerId(),
                name: name,
                email: generateEmail(name),
                phone: generatePhone(),
                address: addressData.address,
                gender: gender,
                jobTitle: randomElement(jobTitles),
                segment: randomElement(segments),
                dob: generateDOB(25, 70),
                state: addressData.state,
                zip: addressData.zip,
                country: 'Việt Nam',
                isActive: Math.random() > 0.05, // 95% active
                relationshipManager: randomElement(rms.filter(rm => rm.isActive)),
                rmId: 0, // Will be set by the relation
            });

            customer.rmId = customer.relationshipManager.id;
            customers.push(await customerRepository.save(customer));
        }
        console.log(`✅ Đã tạo ${customers.length} Khách hàng`);

        // Create RM Tasks
        console.log('\n📝 Đang tạo dữ liệu Nhiệm vụ RM...');
        const taskRepository = AppDataSource.getRepository(FactRmTask);
        const tasks: FactRmTask[] = [];

        const taskTypes = Object.values(TaskType);
        const taskStatuses = Object.values(TaskStatus);

        for (let i = 0; i < 500; i++) {
            const customer = randomElement(customers);
            const taskType = randomElement(taskTypes);
            const status = randomElement(taskStatuses);

            // Create due dates spread across past, present, and future
            const daysOffset = randomInt(-60, 60);
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + daysOffset);

            const task = taskRepository.create({
                taskId: generateTaskId(),
                relationshipManager: customer.relationshipManager,
                rmId: customer.rmId,
                customer: customer,
                customerId: customer.id,
                taskType: taskType,
                status: status,
                taskDetails: randomElement(taskDescriptions[taskType]),
                dueDate: dueDate,
            });

            tasks.push(await taskRepository.save(task));
        }
        console.log(`✅ Đã tạo ${tasks.length} nhiệm vụ`);

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('🎉 TẠO DỮ LIỆU MẪU THÀNH CÔNG!');
        console.log('='.repeat(60));
        console.log(`📊 Tổng kết:`);
        console.log(`   - Relationship Managers: ${rms.length}`);
        console.log(`   - Khách hàng: ${customers.length}`);
        console.log(`   - Nhiệm vụ: ${tasks.length}`);
        console.log('='.repeat(60));

        // Additional statistics
        console.log('\n📈 Thống kê chi tiết:');

        const activeRMs = rms.filter(rm => rm.isActive).length;
        console.log(`   - RMs hoạt động: ${activeRMs}/${rms.length}`);

        const activeCustomers = customers.filter(c => c.isActive).length;
        console.log(`   - Khách hàng hoạt động: ${activeCustomers}/${customers.length}`);

        const segmentCounts = segments.reduce((acc, seg) => {
            acc[seg] = customers.filter(c => c.segment === seg).length;
            return acc;
        }, {} as Record<string, number>);
        console.log(`   - Phân khúc khách hàng:`);
        Object.entries(segmentCounts).forEach(([seg, count]) => {
            console.log(`     • ${seg}: ${count}`);
        });

        const statusCounts = taskStatuses.reduce((acc, status) => {
            acc[status] = tasks.filter(t => t.status === status).length;
            return acc;
        }, {} as Record<string, number>);
        console.log(`   - Trạng thái nhiệm vụ:`);
        Object.entries(statusCounts).forEach(([status, count]) => {
            console.log(`     • ${status}: ${count}`);
        });

        await AppDataSource.destroy();
        console.log('\n✅ Đã đóng kết nối cơ sở dữ liệu');

    } catch (error) {
        console.error('❌ Lỗi khi tạo dữ liệu mẫu:', error);
        process.exit(1);
    }
}

// Run the script
createMockData();

