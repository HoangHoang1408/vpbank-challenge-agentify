import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FactRmTask, TaskStatus, TaskType } from './entities/fact_rm_task.entity';
import { RelationshipManager } from '../rm/entities/rm.entity';
import { Customer } from '../customer/entities/customer.entity';
import { CreateTaskDto, UpdateTaskDto, FilterTaskDto } from './dto';

@Injectable()
export class FactRmTaskService {
    constructor(
        @InjectRepository(FactRmTask)
        private readonly taskRepository: Repository<FactRmTask>,
        @InjectRepository(RelationshipManager)
        private readonly rmRepository: Repository<RelationshipManager>,
        @InjectRepository(Customer)
        private readonly customerRepository: Repository<Customer>,
    ) { }

    /**
     * Create a new task with validation
     */
    async create(createTaskDto: CreateTaskDto): Promise<FactRmTask> {
        // Validate that RM exists and is active
        const rm = await this.rmRepository.findOne({
            where: { id: createTaskDto.rmId },
        });

        if (!rm) {
            throw new NotFoundException(`Relationship Manager with ID ${createTaskDto.rmId} not found`);
        }

        if (!rm.isActive) {
            throw new BadRequestException(`Relationship Manager with ID ${createTaskDto.rmId} is not active`);
        }

        // Validate that Customer exists and is active
        const customer = await this.customerRepository.findOne({
            where: { id: createTaskDto.customerId },
        });

        if (!customer) {
            throw new NotFoundException(`Customer with ID ${createTaskDto.customerId} not found`);
        }

        if (!customer.isActive) {
            throw new BadRequestException(`Customer with ID ${createTaskDto.customerId} is not active`);
        }

        // Validate that the customer is assigned to the RM
        if (customer.rmId !== createTaskDto.rmId) {
            throw new BadRequestException(
                `Customer ${createTaskDto.customerId} is not assigned to RM ${createTaskDto.rmId}. Customer is assigned to RM ${customer.rmId}`
            );
        }

        // Check if taskId already exists
        const existingTask = await this.taskRepository.findOne({
            where: { taskId: createTaskDto.taskId },
        });

        if (existingTask) {
            throw new BadRequestException(`Task with taskId ${createTaskDto.taskId} already exists`);
        }

        // Validate due date is not in the past
        const dueDate = new Date(createTaskDto.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (dueDate < today) {
            throw new BadRequestException('Due date cannot be in the past');
        }

        const task = this.taskRepository.create({
            ...createTaskDto,
            relationshipManager: rm,
            customer: customer,
        });

        return await this.taskRepository.save(task);
    }

    /**
     * Find all tasks with optional filters
     */
    async findAll(filters?: FilterTaskDto): Promise<FactRmTask[]> {
        const queryBuilder = this.taskRepository.createQueryBuilder('task')
            .leftJoinAndSelect('task.relationshipManager', 'rm')
            .leftJoinAndSelect('task.customer', 'customer');

        if (filters?.rmId) {
            queryBuilder.andWhere('task.rmId = :rmId', { rmId: filters.rmId });
        }

        if (filters?.customerId) {
            queryBuilder.andWhere('task.customerId = :customerId', { customerId: filters.customerId });
        }

        if (filters?.status) {
            queryBuilder.andWhere('task.status = :status', { status: filters.status });
        }

        if (filters?.taskType) {
            queryBuilder.andWhere('task.taskType = :taskType', { taskType: filters.taskType });
        }

        return await queryBuilder
            .orderBy('task.dueDate', 'ASC')
            .addOrderBy('task.createdAt', 'DESC')
            .getMany();
    }

    /**
     * Find a single task by ID
     */
    async findOne(id: number): Promise<FactRmTask> {
        const task = await this.taskRepository.findOne({
            where: { id },
            relations: ['relationshipManager', 'customer'],
        });

        if (!task) {
            throw new NotFoundException(`Task with ID ${id} not found`);
        }

        return task;
    }

    /**
     * Find task by taskId (business key)
     */
    async findByTaskId(taskId: string): Promise<FactRmTask> {
        const task = await this.taskRepository.findOne({
            where: { taskId },
            relations: ['relationshipManager', 'customer'],
        });

        if (!task) {
            throw new NotFoundException(`Task with taskId ${taskId} not found`);
        }

        return task;
    }

    /**
     * Update a task with validation
     */
    async update(id: number, updateTaskDto: UpdateTaskDto): Promise<FactRmTask> {
        const task = await this.findOne(id);

        // Validate RM if being updated
        if (updateTaskDto.rmId && updateTaskDto.rmId !== task.rmId) {
            const rm = await this.rmRepository.findOne({
                where: { id: updateTaskDto.rmId },
            });

            if (!rm) {
                throw new NotFoundException(`Relationship Manager with ID ${updateTaskDto.rmId} not found`);
            }

            if (!rm.isActive) {
                throw new BadRequestException(`Relationship Manager with ID ${updateTaskDto.rmId} is not active`);
            }

            task.relationshipManager = rm;
            task.rmId = updateTaskDto.rmId;
        }

        // Validate Customer if being updated
        if (updateTaskDto.customerId && updateTaskDto.customerId !== task.customerId) {
            const customer = await this.customerRepository.findOne({
                where: { id: updateTaskDto.customerId },
            });

            if (!customer) {
                throw new NotFoundException(`Customer with ID ${updateTaskDto.customerId} not found`);
            }

            if (!customer.isActive) {
                throw new BadRequestException(`Customer with ID ${updateTaskDto.customerId} is not active`);
            }

            // Validate that the customer is assigned to the RM
            const finalRmId = updateTaskDto.rmId || task.rmId;
            if (customer.rmId !== finalRmId) {
                throw new BadRequestException(
                    `Customer ${updateTaskDto.customerId} is not assigned to RM ${finalRmId}. Customer is assigned to RM ${customer.rmId}`
                );
            }

            task.customer = customer;
            task.customerId = updateTaskDto.customerId;
        }

        // Validate status transitions
        if (updateTaskDto.status && updateTaskDto.status !== task.status) {
            this.validateStatusTransition(task.status, updateTaskDto.status);
            task.status = updateTaskDto.status;
        }

        // Update other fields
        if (updateTaskDto.taskType) {
            task.taskType = updateTaskDto.taskType;
        }

        if (updateTaskDto.taskDetails) {
            task.taskDetails = updateTaskDto.taskDetails;
        }

        if (updateTaskDto.dueDate) {
            // Only validate future date for non-completed tasks
            if (task.status !== TaskStatus.COMPLETED) {
                const dueDate = new Date(updateTaskDto.dueDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                if (dueDate < today) {
                    throw new BadRequestException('Due date cannot be in the past for active tasks');
                }
            }
            task.dueDate = updateTaskDto.dueDate;
        }

        return await this.taskRepository.save(task);
    }

    /**
     * Validate status transitions
     */
    private validateStatusTransition(currentStatus: TaskStatus, newStatus: TaskStatus): void {
        const validTransitions: Record<TaskStatus, TaskStatus[]> = {
            [TaskStatus.IN_PROGRESS]: [TaskStatus.COMPLETED, TaskStatus.CANCELLED],
            [TaskStatus.COMPLETED]: [],
            [TaskStatus.CANCELLED]: [TaskStatus.IN_PROGRESS],
        };

        if (!validTransitions[currentStatus].includes(newStatus)) {
            throw new BadRequestException(
                // `Invalid status transition from ${currentStatus} to ${newStatus}`
                `You cannot change the status from ${currentStatus} to ${newStatus}`
            );
        }
    }

    /**
     * Delete a task (soft delete by changing status to COMPLETED)
     */
    async softDelete(id: number): Promise<FactRmTask> {
        const task = await this.findOne(id);

        if (task.status === TaskStatus.COMPLETED) {
            throw new BadRequestException('Task is already completed');
        }

        task.status = TaskStatus.COMPLETED;
        return await this.taskRepository.save(task);
    }

    /**
     * Hard delete a task (permanent deletion)
     */
    async remove(id: number): Promise<void> {
        const task = await this.findOne(id);
        await this.taskRepository.remove(task);
    }

    /**
     * Get tasks by RM ID
     */
    async findByRmId(rmId: number): Promise<FactRmTask[]> {
        // Verify RM exists
        const rm = await this.rmRepository.findOne({ where: { id: rmId } });
        if (!rm) {
            throw new NotFoundException(`Relationship Manager with ID ${rmId} not found`);
        }

        return await this.taskRepository.find({
            where: { rmId },
            relations: ['relationshipManager', 'customer'],
            order: { dueDate: 'ASC', createdAt: 'DESC' },
        });
    }

    /**
     * Get tasks by Customer ID
     */
    async findByCustomerId(customerId: number): Promise<FactRmTask[]> {
        // Verify customer exists
        const customer = await this.customerRepository.findOne({ where: { id: customerId } });
        if (!customer) {
            throw new NotFoundException(`Customer with ID ${customerId} not found`);
        }

        return await this.taskRepository.find({
            where: { customerId },
            relations: ['relationshipManager', 'customer'],
            order: { dueDate: 'ASC', createdAt: 'DESC' },
        });
    }

    /**
     * Get overdue tasks
     */
    async findOverdueTasks(): Promise<FactRmTask[]> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return await this.taskRepository
            .createQueryBuilder('task')
            .leftJoinAndSelect('task.relationshipManager', 'rm')
            .leftJoinAndSelect('task.customer', 'customer')
            .where('task.dueDate < :today', { today })
            .andWhere('task.status = :status', {
                status: TaskStatus.IN_PROGRESS
            })
            .orderBy('task.dueDate', 'ASC')
            .getMany();
    }

    /**
     * Get task statistics for a specific RM
     */
    async getTaskStatsByRm(rmId: number): Promise<{
        total: number;
        inProgress: number;
        completed: number;
        overdue: number;
    }> {
        const rm = await this.rmRepository.findOne({ where: { id: rmId } });
        if (!rm) {
            throw new NotFoundException(`Relationship Manager with ID ${rmId} not found`);
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [tasks, total] = await this.taskRepository.findAndCount({
            where: { rmId },
        });

        const stats = {
            total,
            inProgress: 0,
            completed: 0,
            overdue: 0,
        };

        for (const task of tasks) {
            switch (task.status) {
                case TaskStatus.IN_PROGRESS:
                    stats.inProgress++;
                    break;
                case TaskStatus.COMPLETED:
                    stats.completed++;
                    break;
            }

            if (
                task.status === TaskStatus.IN_PROGRESS &&
                new Date(task.dueDate) < today
            ) {
                stats.overdue++;
            }
        }

        return stats;
    }
}

