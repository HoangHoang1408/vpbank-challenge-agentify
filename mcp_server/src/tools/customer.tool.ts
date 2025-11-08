import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Customer, Gender, JobTitle, Segment } from "src/customer/entities/customer.entity";
import { Repository } from "typeorm";
import { type Context, Tool } from "@rekog/mcp-nest";
import type { Request } from "express";
import z from "zod";

@Injectable()
export class CustomerTool {
    constructor(
        @InjectRepository(Customer)
        private readonly customerRepository: Repository<Customer>,
    ) { }

    @Tool({
        name: "find_customer",
        description: "Tool to search for a customer by various criteria. Returns customer information if found, or a message asking for more specific information if multiple customers match.",
        parameters: z.object({
            customerName: z.optional(z.string({
                "description": "The customer's full name or partial name to search for",
            })),
            customerGender: z.optional(z.nativeEnum(Gender, {
                "description": "The customer's gender",
            })),
            customerEmail: z.optional(z.string({
                "description": "The customer's email address",
            })),
            customerPhone: z.optional(z.string({
                "description": "The customer's phone number in Vietnam (starts with +84)",
            })),
            customerAddress: z.optional(z.string({
                "description": "The customer's address including building number, street name, ward, and district.",
            })),
            customerJobTitle: z.optional(z.nativeEnum(JobTitle, {
                "description": "The customer's job title or profession (in Vietnamese)",
            })),
            customerSegment: z.optional(z.nativeEnum(Segment, {
                "description": "The customer's segment classification",
            })),
            customerState: z.optional(z.string({
                "description": "The customer's state or province in Vietnam.",
            })),
        })
    })
    async findCustomer({
        customerName,
        customerGender,
        customerEmail,
        customerPhone,
        customerAddress,
        customerJobTitle,
        customerSegment,
        customerState
    }: {
        customerName?: string;
        customerGender?: Gender;
        customerEmail?: string;
        customerPhone?: string;
        customerAddress?: string;
        customerJobTitle?: JobTitle;
        customerSegment?: Segment;
        customerState?: string;
    }, context: Context, request: Request) {
        // Extract relationship manager id from request headers or context
        // For now, we'll assume rmId is passed in the request
        const rmId = (request as any).rmId || (request.headers as any)['x-rm-id'];

        if (!rmId) {
            return {
                customer_info: {},
                message: "Relationship manager id not found in configuration. Please provide rmId in request headers as 'x-rm-id'."
            };
        }

        // Build query builder with optimized select
        const queryBuilder = this.customerRepository
            .createQueryBuilder('customer')
            .select([
                'customer.id',
                'customer.name',
                'customer.email',
                'customer.phone',
                'customer.address',
                'customer.country',
                'customer.dob',
                'customer.gender',
                'customer.jobTitle',
                'customer.segment',
                'customer.state',
                'customer.zip',
                'customer.isActive',
                'customer.behaviorDescription'
            ])
            .where('customer.rmId = :rmId', { rmId });

        // Track which fields were used in search for later analysis
        const usedFields = new Set<string>();

        // Build WHERE conditions using parameterized queries for better performance and security
        if (customerName) {
            queryBuilder.andWhere('customer.name ILIKE :customerName', {
                customerName: `%${customerName}%`
            });
            usedFields.add('name');
        }
        if (customerGender) {
            queryBuilder.andWhere('customer.gender = :customerGender', {
                customerGender
            });
            usedFields.add('gender');
        }
        if (customerEmail) {
            queryBuilder.andWhere('customer.email ILIKE :customerEmail', {
                customerEmail: `%${customerEmail}%`
            });
            usedFields.add('email');
        }
        if (customerPhone) {
            queryBuilder.andWhere('customer.phone ILIKE :customerPhone', {
                customerPhone: `%${customerPhone}%`
            });
            usedFields.add('phone');
        }
        if (customerAddress) {
            queryBuilder.andWhere('customer.address ILIKE :customerAddress', {
                customerAddress: `%${customerAddress}%`
            });
            usedFields.add('address');
        }
        if (customerJobTitle) {
            queryBuilder.andWhere('customer.jobTitle = :customerJobTitle', {
                customerJobTitle
            });
            usedFields.add('jobTitle');
        }
        if (customerSegment) {
            queryBuilder.andWhere('customer.segment = :customerSegment', {
                customerSegment
            });
            usedFields.add('segment');
        }
        if (customerState) {
            queryBuilder.andWhere('customer.state ILIKE :customerState', {
                customerState: `%${customerState}%`
            });
            usedFields.add('state');
        }

        // If no conditions provided, return empty result
        if (usedFields.size === 0) {
            return {
                customer_info: {},
                message: "No search criteria provided. Please provide at least one information (name, email, phone, address, job title, segment, state) to search for a customer."
            };
        }

        try {
            // Execute the optimized query
            const customers = await queryBuilder.getMany();

            // Check the number of results
            if (!customers || customers.length === 0) {
                return {
                    customer_info: {},
                    message: "No customer found matching the provided criteria. Please ask back for different information."
                };
            }

            if (customers.length > 1) {
                // Find the column with the most unique values using efficient Set operations
                const cols = ["name", "email", "phone", "address", "country", "dob", "gender", "jobTitle", "segment", "state", "zip", "isActive", "behaviorDescription"];
                let maxValueCount: [string, number] = ["name", 0];

                for (const col of cols) {
                    const uniqueValues = new Set(
                        customers.map(c => {
                            const val = (c as any)[col];
                            // Handle null/undefined and dates
                            return val instanceof Date ? val.toISOString() : (val ?? null);
                        })
                    );
                    const count = uniqueValues.size;
                    if (count > maxValueCount[1]) {
                        maxValueCount = [col, count];
                    }
                }

                // Check if this field was already used in the search
                const fieldName = maxValueCount[0];
                const wasUsedInSearch = usedFields.has(fieldName);

                return {
                    customer_info: {},
                    message: wasUsedInSearch
                        ? `Multiple customers (${customers.length}) found matching the criteria. Please ask back for customer's full ${fieldName}.`
                        : `Multiple customers (${customers.length}) found matching the criteria. Please ask back for customer's ${fieldName}.`
                };
            }

            // Exactly one customer found
            const customer = customers[0];
            const customerInfo = {
                id: customer.id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                address: customer.address,
                country: customer.country,
                dob: customer.dob,
                gender: customer.gender,
                jobTitle: customer.jobTitle,
                segment: customer.segment,
                state: customer.state,
                zip: customer.zip,
                isActive: customer.isActive,
                behaviorDescription: customer.behaviorDescription,
            };

            return {
                customer_info: customerInfo,
                message: customer.isActive
                    ? "Customer found successfully."
                    : "Warning: Customer is not active."
            };

        } catch (error) {
            return {
                customer_info: {},
                message: `An error occurred while searching for customer: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
}