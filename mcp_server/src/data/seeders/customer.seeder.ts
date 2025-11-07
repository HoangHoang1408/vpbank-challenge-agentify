import { DataSource, Repository } from 'typeorm';
import { Customer, Gender, JobTitle, Segment } from '../../customer/entities/customer.entity';
import { RelationshipManager } from '../../rm/entities/rm.entity';
import {
    generateVietnameseName,
    generateVietnameseAddress,
    generateEmail,
    generatePhone,
    generateDOB,
    generateCustomerId,
    generateBehaviorDescription,
    randomElement,
} from '../utils/generators';

/**
 * Seeder class for Customers
 */
export class CustomerSeeder {
    private customerRepository: Repository<Customer>;

    constructor(private dataSource: DataSource) {
        this.customerRepository = this.dataSource.getRepository(Customer);
    }

    /**
     * Seed customers data
     * @param count Number of customers to create
     * @param rms Array of relationship managers to assign to customers
     * @returns Array of created customers
     */
    async seed(count: number, rms: RelationshipManager[]): Promise<Customer[]> {
        console.log(`\n👥 Đang tạo dữ liệu Khách hàng...`);

        const segments = Object.values(Segment);
        const jobTitles = Object.values(JobTitle);
        const genders = [Gender.MALE, Gender.FEMALE, Gender.OTHER];
        const customers: Customer[] = [];

        const activeRMs = rms.filter(rm => rm.isActive);

        for (let i = 0; i < count; i++) {
            const gender = randomElement(genders);
            const name = generateVietnameseName(gender);
            const addressData = generateVietnameseAddress();

            const customer = this.customerRepository.create({
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
                behaviorDescription: generateBehaviorDescription(),
                relationshipManager: randomElement(activeRMs),
                rmId: 0, // Will be set by the relation
            });

            customer.rmId = customer.relationshipManager.id;
            customers.push(await this.customerRepository.save(customer));
        }

        console.log(`✅ Đã tạo ${customers.length} Khách hàng`);
        return customers;
    }

    /**
     * Get statistics about customers
     */
    getStatistics(customers: Customer[]): void {
        const activeCustomers = customers.filter(c => c.isActive).length;
        console.log(`   - Khách hàng hoạt động: ${activeCustomers}/${customers.length}`);

        const segments = Object.values(Segment);
        const segmentCounts = segments.reduce((acc, seg) => {
            acc[seg] = customers.filter(c => c.segment === seg).length;
            return acc;
        }, {} as Record<string, number>);

        console.log(`   - Phân khúc khách hàng:`);
        Object.entries(segmentCounts).forEach(([seg, count]) => {
            console.log(`     • ${seg}: ${count}`);
        });
    }
}

