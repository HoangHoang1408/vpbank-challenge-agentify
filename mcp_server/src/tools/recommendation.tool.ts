import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";
import { Customer } from "src/customer/entities/customer.entity";
import { Card } from "src/card/entities/card.entity";
import { Repository } from "typeorm";
import { type Context, Tool } from "@rekog/mcp-nest";
import type { Request } from "express";
import z from "zod";
import OpenAI from "openai";

@Injectable()
export class RecommendationTool {
    private openai: OpenAI;

    constructor(
        @InjectRepository(Customer)
        private readonly customerRepository: Repository<Customer>,
        @InjectRepository(Card)
        private readonly cardRepository: Repository<Card>,
        private readonly configService: ConfigService,
    ) {
        // Initialize OpenAI client with API key from ConfigService
        const apiKey = this.configService.get<string>('openai.apiKey');
        if (!apiKey) {
            throw new Error("OPENAI_API_KEY environment variable is not set in .env file.");
        }
        this.openai = new OpenAI({ apiKey });
    }

    @Tool({
        name: "recommend_card_products",
        description: "Recommends a suitable card product for a specific customer. This function analyzes the customer's profile to suggest the most appropriate card product from the available portfolio.",
        parameters: z.object({
            customerId: z.number({
                "description": "The unique identifier for the customer. If other information is provided, call `find_customer` first to obtain the customerId.",
            }),
        })
    })
    async recommendCardProducts({
        customerId
    }: {
        customerId: number;
    }, context: Context, request: Request) {
        // Number of products to recommend
        const k = 3;

        try {
            // Step 1: Retrieve customer information
            const customer = await this.customerRepository
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
                .where('customer.id = :customerId', { customerId })
                .getOne();

            if (!customer) {
                return {
                    recommendation: "",
                    message: `No customer found with ID ${customerId}. Please provide a valid customer ID or ask back for customer information and use the \`find_customer\` tool to obtain it.`,
                    code: "failed"
                };
            }

            // Step 2: Get all available card products
            const cardProducts = await this.cardRepository
                .createQueryBuilder('card')
                .select([
                    'card.id',
                    'card.cardType',
                    'card.cardProductName',
                    'card.cardDescription',
                    'card.targetDescription',
                    'card.cardNetwork',
                    'card.isActive'
                ])
                .where('card.isActive = :isActive', { isActive: true })
                .getMany();

            if (!cardProducts || cardProducts.length === 0) {
                return {
                    recommendation: "",
                    message: "No active card products available in the database.",
                    code: "failed"
                };
            }

            // Adjust k if there are fewer products available
            const actualK = Math.min(k, cardProducts.length);

            // Step 3: Use OpenAI to recommend the best products
            // Prepare customer profile for LLM
            const customerProfile = `Hồ sơ khách hàng:
- Tên: ${customer.name}
- Giới tính: ${customer.gender}
- Ngày sinh: ${customer.dob}
- Nghề nghiệp: ${customer.jobTitle}
- Phân khúc: ${customer.segment}
- Địa điểm: ${customer.address}, ${customer.state}, ${customer.country}
- Mô tả hành vi: ${customer.behaviorDescription}`;

            // Prepare card products list for LLM (in Vietnamese)
            const productsList = cardProducts.map((p, i) =>
                `Sản phẩm ${i + 1}:\n- ID: ${p.id}\n- Tên: ${p.cardProductName}\n- Loại: ${p.cardType}\n- Mạng lưới: ${p.cardNetwork}\n- Mô tả: ${p.cardDescription}\n- Đối tượng khách hàng: ${p.targetDescription}`
            ).join("\n\n");

            // Create prompt for LLM (in Vietnamese)
            const prompt = `Bạn là một chuyên viên tư vấn tài chính tại VPBank, một ngân hàng hàng đầu tại Việt Nam. Nhiệm vụ của bạn là đề xuất top ${actualK} sản phẩm thẻ phù hợp nhất cho khách hàng dựa trên hồ sơ của họ.

${customerProfile}

Các sản phẩm thẻ hiện có:
${productsList}

Dựa trên hồ sơ, hành vi, phân khúc và nghề nghiệp của khách hàng, hãy đề xuất CHÍNH XÁC ${actualK} sản phẩm thẻ phù hợp nhất với nhu cầu của họ, được xếp hạng từ phù hợp nhất đến ít phù hợp nhất.

Vui lòng cung cấp đề xuất của bạn:`;

            // Call OpenAI API
            const response = await this.openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: "Bạn là một chuyên gia tư vấn tài chính chuyên về đề xuất sản phẩm thẻ tín dụng và thẻ ghi nợ." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7
            });

            // Parse LLM response
            const responseText = response.choices[0].message.content;

            if (!responseText) {
                return {
                    recommendation: "",
                    message: "Card product recommendation failed. Please try again.",
                    code: "failed"
                };
            }

            return {
                recommendation: responseText,
                message: `Successfully recommended ${actualK} products for customer ${customer.name}.`,
                code: "succeeded"
            };

        } catch (error) {
            return {
                recommendation: "",
                message: `An error occurred while recommending card products: ${error instanceof Error ? error.message : String(error)}`,
                code: "failed"
            };
        }
    }

    @Tool({
        name: "recommend_customers",
        description: "Recommends top customers who are suitable for a specific card product. This function identifies and returns a list of customers who are the best fit for a given card product. It analyzes customer data to match them with the product's target profile.",
        parameters: z.object({
            cardProductId: z.number({
                "description": "The unique identifier for the card product. If the user provides other information like the card product name instead of an ID, the `find_card_product` tool must be called first to obtain the `cardProductId`",
            }),
        })
    })
    async recommendCustomers({
        cardProductId
    }: {
        cardProductId: number;
    }, context: Context, request: Request) {
        // Number of customers to recommend
        const k = 3;

        // Extract relationship manager id from request
        const rmId = (request as any).rmId || (request.headers as any)['x-rm-id'];

        if (!rmId) {
            return {
                recommendation: "",
                message: "Relationship manager id not found in configuration. Please provide rmId in request headers as 'x-rm-id'.",
                code: "failed"
            };
        }

        try {
            // Step 1: Retrieve card product information
            const cardProduct = await this.cardRepository
                .createQueryBuilder('card')
                .select([
                    'card.id',
                    'card.cardType',
                    'card.cardProductName',
                    'card.cardDescription',
                    'card.targetDescription',
                    'card.cardNetwork',
                    'card.isActive'
                ])
                .where('card.id = :cardProductId', { cardProductId })
                .getOne();

            if (!cardProduct) {
                return {
                    recommendation: "",
                    message: `No card product found with ID ${cardProductId}. Please provide a valid card product ID or ask back for card product information and use the \`find_card_product\` tool to obtain it.`,
                    code: "failed"
                };
            }

            // Step 2: Get all active customers for the RM
            const customers = await this.customerRepository
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
                .where('customer.isActive = :isActive', { isActive: true })
                .andWhere('customer.rmId = :rmId', { rmId: parseInt(rmId) })
                .getMany();

            if (!customers || customers.length === 0) {
                return {
                    recommendation: "",
                    message: "No active customers available in the database.",
                    code: "failed"
                };
            }

            // Adjust k if there are fewer customers available
            const actualK = Math.min(k, customers.length);

            // Step 3: Use OpenAI to recommend the best customers
            // Prepare card product profile for LLM
            const cardProfile = `Thông tin sản phẩm thẻ:
- ID: ${cardProduct.id}
- Tên: ${cardProduct.cardProductName}
- Loại: ${cardProduct.cardType}
- Mạng lưới: ${cardProduct.cardNetwork}
- Mô tả: ${cardProduct.cardDescription}
- Đối tượng khách hàng mục tiêu: ${cardProduct.targetDescription}`;

            // Prepare customers list for LLM (in Vietnamese)
            const customersList = customers.map((c, i) =>
                `Khách hàng ${i + 1}:\n- ID: ${c.id}\n- Tên: ${c.name}\n- Giới tính: ${c.gender}\n- Ngày sinh: ${c.dob}\n- Nghề nghiệp: ${c.jobTitle}\n- Phân khúc: ${c.segment}\n- Địa điểm: ${c.address}, ${c.state}, ${c.country}\n- Mô tả hành vi: ${c.behaviorDescription}`
            ).join("\n\n");

            // Create prompt for LLM (in Vietnamese)
            const prompt = `Bạn là một chuyên viên tư vấn tài chính tại VPBank, một ngân hàng hàng đầu tại Việt Nam. Nhiệm vụ của bạn là đề xuất top ${actualK} khách hàng phù hợp nhất cho sản phẩm thẻ cụ thể này.

${cardProfile}

Danh sách khách hàng hiện có:
${customersList}

Dựa trên mô tả sản phẩm thẻ, đối tượng khách hàng mục tiêu, và thông tin về từng khách hàng (bao gồm phân khúc, nghề nghiệp, hành vi), hãy đề xuất CHÍNH XÁC ${actualK} khách hàng phù hợp nhất với sản phẩm thẻ này, được xếp hạng từ phù hợp nhất đến ít phù hợp nhất.

Vui lòng cung cấp đề xuất của bạn:`;

            // Call OpenAI API
            const response = await this.openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: "Bạn là một chuyên gia tư vấn tài chính chuyên về phân tích khách hàng và đề xuất sản phẩm thẻ tín dụng và thẻ ghi nợ." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7
            });

            // Parse LLM response
            const responseText = response.choices[0].message.content;

            if (!responseText) {
                return {
                    recommendation: "",
                    message: "Customer recommendation failed. Please try again.",
                    code: "failed"
                };
            }

            return {
                recommendation: responseText,
                message: `Successfully recommended ${actualK} customers for card product ${cardProduct.cardProductName}.`,
                code: "succeeded"
            };

        } catch (error) {
            return {
                recommendation: "",
                message: `An error occurred while recommending customers: ${error instanceof Error ? error.message : String(error)}`,
                code: "failed"
            };
        }
    }
}

