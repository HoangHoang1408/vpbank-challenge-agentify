import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    HttpCode,
    HttpStatus,
    ParseIntPipe,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiQuery,
} from '@nestjs/swagger';
import { CustomerService } from './customer.service';
import { CreateCustomerDto, UpdateCustomerDto, FilterCustomerDto } from './dto';
import { Customer } from './entities/customer.entity';

@ApiTags('customers')
@Controller('customers')
export class CustomerController {
    constructor(private readonly customerService: CustomerService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new customer' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Customer has been successfully created.',
        type: Customer,
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'Customer with the same ID or email already exists.',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid input data.',
    })
    async create(@Body() createCustomerDto: CreateCustomerDto): Promise<Customer> {
        return await this.customerService.create(createCustomerDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all customers with filters and pagination' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Returns a paginated list of customers.',
        schema: {
            properties: {
                data: {
                    type: 'array',
                    items: { type: 'object' },
                },
                total: { type: 'number', example: 100 },
                page: { type: 'number', example: 1 },
                limit: { type: 'number', example: 10 },
                totalPages: { type: 'number', example: 10 },
            },
        },
    })
    async findAll(@Query() filterDto: FilterCustomerDto) {
        return await this.customerService.findAll(filterDto);
    }

    @Get('statistics')
    @ApiOperation({ summary: 'Get customer statistics' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Returns customer statistics.',
        schema: {
            properties: {
                total: { type: 'number' },
                active: { type: 'number' },
                inactive: { type: 'number' },
                bySegment: { type: 'object' },
                byGender: { type: 'object' },
            },
        },
    })
    async getStatistics() {
        return await this.customerService.getStatistics();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a customer by ID' })
    @ApiParam({ name: 'id', type: 'number', description: 'Customer ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Returns the customer.',
        type: Customer,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Customer not found.',
    })
    async findOne(@Param('id', ParseIntPipe) id: number): Promise<Customer> {
        return await this.customerService.findOne(id);
    }

    @Get('by-customer-id/:customerId')
    @ApiOperation({ summary: 'Get a customer by customer ID' })
    @ApiParam({ name: 'customerId', type: 'string', description: 'Customer unique ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Returns the customer.',
        type: Customer,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Customer not found.',
    })
    async findByCustomerId(@Param('customerId') customerId: string): Promise<Customer> {
        return await this.customerService.findByCustomerId(customerId);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a customer' })
    @ApiParam({ name: 'id', type: 'number', description: 'Customer ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Customer has been successfully updated.',
        type: Customer,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Customer not found.',
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'Customer with the same ID or email already exists.',
    })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateCustomerDto: UpdateCustomerDto,
    ): Promise<Customer> {
        return await this.customerService.update(id, updateCustomerDto);
    }

    @Delete(':id/soft')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Soft delete a customer (set isActive to false)' })
    @ApiParam({ name: 'id', type: 'number', description: 'Customer ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Customer has been successfully deactivated.',
        type: Customer,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Customer not found.',
    })
    async softDelete(@Param('id', ParseIntPipe) id: number): Promise<Customer> {
        return await this.customerService.softDelete(id);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Permanently delete a customer' })
    @ApiParam({ name: 'id', type: 'number', description: 'Customer ID' })
    @ApiResponse({
        status: HttpStatus.NO_CONTENT,
        description: 'Customer has been successfully deleted.',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Customer not found.',
    })
    async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return await this.customerService.remove(id);
    }
}

