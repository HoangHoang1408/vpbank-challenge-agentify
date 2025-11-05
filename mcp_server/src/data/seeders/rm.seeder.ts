import { DataSource, Repository } from 'typeorm';
import { RelationshipManager, RmLevel } from '../../rm/entities/rm.entity';
import { Gender } from '../../customer/entities/customer.entity';
import { generateVietnameseName, generateDOB, generateEmployeeId, randomElement, randomInt } from '../utils/generators';

/**
 * Seeder class for Relationship Managers
 */
export class RmSeeder {
    private rmRepository: Repository<RelationshipManager>;

    constructor(private dataSource: DataSource) {
        this.rmRepository = this.dataSource.getRepository(RelationshipManager);
    }

    /**
     * Seed relationship managers data
     * @param count Number of RMs to create
     * @returns Array of created RMs
     */
    async seed(count: number = 15): Promise<RelationshipManager[]> {
        console.log(`\n📋 Đang tạo dữ liệu Relationship Managers...`);

        const rmTitles = [
            'Chuyên viên quan hệ khách hàng cá nhân cao cấp',
            'Trưởng nhóm QLKH',
            'Giám đốc khách hàng doanh nghiệp',
            'Chuyên viên QLKH Senior',
            'Chuyên viên Private Banking',
        ];

        const rmLevels = Object.values(RmLevel);
        const rms: RelationshipManager[] = [];

        for (let i = 0; i < count; i++) {
            const gender = randomElement([Gender.MALE, Gender.FEMALE]);
            const rm = this.rmRepository.create({
                employeeId: generateEmployeeId(),
                name: generateVietnameseName(gender),
                dob: generateDOB(28, 50),
                level: randomElement(rmLevels),
                title: randomElement(rmTitles),
                hireDate: new Date(randomInt(2015, 2023), randomInt(0, 11), randomInt(1, 28)),
                isActive: Math.random() > 0.1, // 90% active
            });
            rms.push(await this.rmRepository.save(rm));
        }

        console.log(`✅ Đã tạo ${rms.length} Relationship Managers`);
        return rms;
    }

    /**
     * Get statistics about RMs
     */
    getStatistics(rms: RelationshipManager[]): void {
        const activeRMs = rms.filter(rm => rm.isActive).length;
        console.log(`   - RMs hoạt động: ${activeRMs}/${rms.length}`);
    }
}

