import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto, UpdateCustomerDto, FilterCustomerDto } from './dto';

@Injectable()
export class CustomerService {
    constructor(
        @InjectRepository(Customer)
        private readonly customerRepository: Repository<Customer>,
    ) { }

    /**
     * Create a new customer
     */
    async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
        // Check if customer with same customerId already exists
        const existingCustomer = await this.customerRepository.findOne({
            where: { customerId: createCustomerDto.customerId },
        });

        if (existingCustomer) {
            throw new ConflictException(
                `Customer with ID ${createCustomerDto.customerId} already exists`,
            );
        }

        // Check if email already exists
        const existingEmail = await this.customerRepository.findOne({
            where: { email: createCustomerDto.email },
        });

        if (existingEmail) {
            throw new ConflictException(
                `Customer with email ${createCustomerDto.email} already exists`,
            );
        }

        const customer = this.customerRepository.create({
            ...createCustomerDto,
            isActive: createCustomerDto.isActive ?? true,
        });

        return await this.customerRepository.save(customer);
    }

    /**
     * Find all customers with optional filters and pagination
     */
    async findAll(filterDto: FilterCustomerDto): Promise<{
        data: Customer[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        const { page = 1, limit = 10, name, ...filters } = filterDto;
        const skip = (page - 1) * limit;

        const where: any = {};

        // Add filters
        if (filters.customerId) where.customerId = filters.customerId;
        if (filters.email) where.email = filters.email;
        if (filters.phone) where.phone = filters.phone;
        if (filters.gender) where.gender = filters.gender;
        if (filters.jobTitle) where.jobTitle = filters.jobTitle;
        if (filters.segment) where.segment = filters.segment;
        if (filters.state) where.state = filters.state;
        if (filters.isActive !== undefined) where.isActive = filters.isActive;
        if (filters.rmId) where.rmId = filters.rmId;

        // Handle name search with LIKE operator
        if (name) {
            where.name = Like(`%${name}%`);
        }

        const [data, total] = await this.customerRepository.findAndCount({
            where,
            relations: ['relationshipManager'],
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
     * Find a customer by ID
     */
    async findOne(id: number): Promise<Customer> {
        const customer = await this.customerRepository.findOne({
            where: { id },
            relations: ['relationshipManager'],
        });

        if (!customer) {
            throw new NotFoundException(`Customer with ID ${id} not found`);
        }

        return customer;
    }

    /**
     * Find a customer by customerId
     */
    async findByCustomerId(customerId: string): Promise<Customer> {
        const customer = await this.customerRepository.findOne({
            where: { customerId },
            relations: ['relationshipManager'],
        });

        if (!customer) {
            throw new NotFoundException(`Customer with ID ${customerId} not found`);
        }

        return customer;
    }

    /**
     * Update a customer
     */
    async update(id: number, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
        const customer = await this.findOne(id);

        // Check if customerId is being changed and if new one already exists
        if (updateCustomerDto.customerId && updateCustomerDto.customerId !== customer.customerId) {
            const existingCustomer = await this.customerRepository.findOne({
                where: { customerId: updateCustomerDto.customerId },
            });

            if (existingCustomer) {
                throw new ConflictException(
                    `Customer with ID ${updateCustomerDto.customerId} already exists`,
                );
            }
        }

        // Check if email is being changed and if new one already exists
        if (updateCustomerDto.email && updateCustomerDto.email !== customer.email) {
            const existingEmail = await this.customerRepository.findOne({
                where: { email: updateCustomerDto.email },
            });

            if (existingEmail) {
                throw new ConflictException(
                    `Customer with email ${updateCustomerDto.email} already exists`,
                );
            }
        }

        Object.assign(customer, updateCustomerDto);
        return await this.customerRepository.save(customer);
    }

    /**
     * Delete a customer (soft delete by setting isActive to false)
     */
    async softDelete(id: number): Promise<Customer> {
        const customer = await this.findOne(id);
        customer.isActive = false;
        return await this.customerRepository.save(customer);
    }

    /**
     * Delete a customer permanently
     */
    async remove(id: number): Promise<void> {
        const customer = await this.findOne(id);
        await this.customerRepository.remove(customer);
    }

    /**
     * Get customer statistics
     */
    async getStatistics(): Promise<{
        total: number;
        active: number;
        inactive: number;
        bySegment: Record<string, number>;
        byGender: Record<string, number>;
    }> {
        const [total, active, inactive] = await Promise.all([
            this.customerRepository.count(),
            this.customerRepository.count({ where: { isActive: true } }),
            this.customerRepository.count({ where: { isActive: false } }),
        ]);

        const customers = await this.customerRepository.find();

        const bySegment = customers.reduce((acc, customer) => {
            acc[customer.segment] = (acc[customer.segment] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const byGender = customers.reduce((acc, customer) => {
            acc[customer.gender] = (acc[customer.gender] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            total,
            active,
            inactive,
            bySegment,
            byGender,
        };
    }
}

