import { DataSource, Repository } from 'typeorm';
import { FactRmTask, TaskType, TaskStatus } from '../../rm_task/entities/fact_rm_task.entity';
import { Customer } from '../../customer/entities/customer.entity';
import { generateTaskId, randomElement, randomInt } from '../utils/generators';
import { taskDescriptions } from '../constants/task-descriptions';

/**
 * Seeder class for RM Tasks
 */
export class TaskSeeder {
    private taskRepository: Repository<FactRmTask>;

    constructor(private dataSource: DataSource) {
        this.taskRepository = this.dataSource.getRepository(FactRmTask);
    }

    /**
     * Seed RM tasks data
     * @param count Number of tasks to create
     * @param customers Array of customers to assign tasks to
     * @returns Array of created tasks
     */
    async seed(count: number, customers: Customer[]): Promise<FactRmTask[]> {
        console.log(`\n📝 Đang tạo dữ liệu Nhiệm vụ RM...`);

        const taskTypes = Object.values(TaskType);
        const taskStatuses = Object.values(TaskStatus);
        const tasks: FactRmTask[] = [];

        for (let i = 0; i < count; i++) {
            const customer = randomElement(customers);
            const taskType = randomElement(taskTypes);
            const status = randomElement(taskStatuses);

            // Create due dates spread across past, present, and future
            const daysOffset = randomInt(-60, 60);
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + daysOffset);

            const task = this.taskRepository.create({
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

            tasks.push(await this.taskRepository.save(task));
        }

        console.log(`✅ Đã tạo ${tasks.length} nhiệm vụ`);
        return tasks;
    }

    /**
     * Get statistics about tasks
     */
    getStatistics(tasks: FactRmTask[]): void {
        const taskStatuses = Object.values(TaskStatus);
        const statusCounts = taskStatuses.reduce((acc, status) => {
            acc[status] = tasks.filter(t => t.status === status).length;
            return acc;
        }, {} as Record<string, number>);

        console.log(`   - Trạng thái nhiệm vụ:`);
        Object.entries(statusCounts).forEach(([status, count]) => {
            console.log(`     • ${status}: ${count}`);
        });
    }
}

