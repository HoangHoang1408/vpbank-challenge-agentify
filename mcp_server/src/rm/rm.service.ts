import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { RelationshipManager } from './entities/rm.entity';
import { CreateRmDto, UpdateRmDto, FilterRmDto } from './dto';

@Injectable()
export class RmService {
    constructor(
        @InjectRepository(RelationshipManager)
        private readonly rmRepository: Repository<RelationshipManager>,
    ) { }

    /**
     * Create a new Relationship Manager
     */
    async create(createRmDto: CreateRmDto): Promise<RelationshipManager> {
        // Check if RM with same employeeId already exists
        const existingRm = await this.rmRepository.findOne({
            where: { employeeId: createRmDto.employeeId },
        });

        if (existingRm) {
            throw new ConflictException(
                `Relationship Manager with Employee ID ${createRmDto.employeeId} already exists`,
            );
        }

        const rm = this.rmRepository.create(createRmDto);
        return await this.rmRepository.save(rm);
    }

    /**
     * Find all RMs with optional filters and pagination
     */
    async findAll(filterDto: FilterRmDto): Promise<{
        data: RelationshipManager[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        const { page = 1, limit = 10, name, ...filters } = filterDto;
        const skip = (page - 1) * limit;

        const where: any = {};

        // Add filters
        if (filters.employeeId) where.employeeId = filters.employeeId;
        if (filters.level) where.level = filters.level;
        if (filters.title) where.title = filters.title;
        if (filters.isActive !== undefined) where.isActive = filters.isActive;

        // Handle name search with LIKE operator
        if (name) {
            where.name = Like(`%${name}%`);
        }

        const [data, total] = await this.rmRepository.findAndCount({
            where,
            relations: ['customers'],
            skip,
            take: limit,
            order: {
                createdAt: 'DESC',
            },
        });

        const totalPages = Math.ceil(total / limit);

        return {
            data,
            total,
            page,
            limit,
            totalPages,
        };
    }

    /**
     * Find an RM by ID
     */
    async findOne(id: number): Promise<RelationshipManager> {
        const rm = await this.rmRepository.findOne({
            where: { id },
            relations: ['customers'],
        });

        if (!rm) {
            throw new NotFoundException(`Relationship Manager with ID ${id} not found`);
        }

        return rm;
    }

    /**
     * Find an RM by employee ID
     */
    async findByEmployeeId(employeeId: number): Promise<RelationshipManager> {
        const rm = await this.rmRepository.findOne({
            where: { employeeId },
            relations: ['customers'],
        });

        if (!rm) {
            throw new NotFoundException(`Relationship Manager with Employee ID ${employeeId} not found`);
        }

        return rm;
    }

    /**
     * Update an RM
     */
    async update(id: number, updateRmDto: UpdateRmDto): Promise<RelationshipManager> {
        const rm = await this.findOne(id);

        // Check if employeeId is being changed and if new one already exists
        if (updateRmDto.employeeId && updateRmDto.employeeId !== rm.employeeId) {
            const existingRm = await this.rmRepository.findOne({
                where: { employeeId: updateRmDto.employeeId },
            });

            if (existingRm) {
                throw new ConflictException(
                    `Relationship Manager with Employee ID ${updateRmDto.employeeId} already exists`,
                );
            }
        }

        Object.assign(rm, updateRmDto);
        return await this.rmRepository.save(rm);
    }

    /**
     * Delete an RM (soft delete by setting isActive to false)
     */
    async softDelete(id: number): Promise<RelationshipManager> {
        const rm = await this.findOne(id);
        rm.isActive = false;
        return await this.rmRepository.save(rm);
    }

    /**
     * Delete an RM permanently
     */
    async remove(id: number): Promise<void> {
        const rm = await this.findOne(id);
        await this.rmRepository.remove(rm);
    }

    /**
     * Get RM statistics
     */
    async getStatistics(): Promise<{
        total: number;
        active: number;
        inactive: number;
        byLevel: Record<string, number>;
        byTitle: Record<string, number>;
    }> {
        const [total, active, inactive] = await Promise.all([
            this.rmRepository.count(),
            this.rmRepository.count({ where: { isActive: true } }),
            this.rmRepository.count({ where: { isActive: false } }),
        ]);

        const rms = await this.rmRepository.find();

        const byLevel = rms.reduce((acc, rm) => {
            acc[rm.level] = (acc[rm.level] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const byTitle = rms.reduce((acc, rm) => {
            acc[rm.title] = (acc[rm.title] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            total,
            active,
            inactive,
            byLevel,
            byTitle,
        };
    }

    /**
     * Get RM with customer count
     */
    async getRmWithCustomerCount(id: number): Promise<{
        rm: RelationshipManager;
        customerCount: number;
    }> {
        const rm = await this.findOne(id);
        const customerCount = rm.customers ? rm.customers.length : 0;

        return {
            rm,
            customerCount,
        };
    }
}

