import { Injectable, NotFoundException, BadRequestException, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, LessThan } from "typeorm";
import OpenAI from 'openai';
import { ConfigService } from "@nestjs/config";
import { Customer } from "../customer/entities/customer.entity";
import { RelationshipManager } from "../rm/entities/rm.entity";
import { GeneratedEmail, EmailType, EmailStatus } from "./entities/generated-email.entity";
import { CreateGeneratedEmailDto } from "./dto";
import { FactRmTaskService } from "../rm_task/rm_task.service";
import { TaskType, TaskStatus } from "../rm_task/entities/fact_rm_task.entity";

interface GeneratedEmailContent {
    subject: string;
    body: string;
    message: string;
}

@Injectable()
export class GenEmailService {
    private readonly logger = new Logger(GenEmailService.name);

    constructor(
        private readonly configService: ConfigService,
        @InjectRepository(GeneratedEmail)
        private readonly emailRepository: Repository<GeneratedEmail>,
        @InjectRepository(Customer)
        private readonly customerRepository: Repository<Customer>,
        @InjectRepository(RelationshipManager)
        private readonly rmRepository: Repository<RelationshipManager>,
        private readonly taskService: FactRmTaskService,
    ) { }

    async generateResponse(prompt: string, model: string = 'gpt-4o') {
        const openai = new OpenAI({
            apiKey: this.configService.get('openai.apiKey'),
            baseURL: this.configService.get('openai.baseUrl'),
        });
        const completion = await openai.chat.completions.create({
            model: model,
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: prompt },
            ],
        });
        return completion.choices[0].message.content;
    }

    /**
     * Process email signature template by replacing template variables with actual RM data
     * Supports {{Name}} and {{Title}} template variables
     */
    private processEmailSignature(rm: RelationshipManager): string {
        // Default template if RM doesn't have a custom signature
        const defaultTemplate = 'Best regards,\n{{Name}}\n{{Title}}\nVPBank';

        // Use RM's custom signature or default template
        const template = rm.emailSignature || defaultTemplate;

        // Replace template variables with actual RM data
        return template
            .replace(/\{\{Name\}\}/g, rm.name)
            .replace(/\{\{Title\}\}/g, rm.title);
    }

    /**
     * Generate personalized email for a customer based on email type
     */
    async generatePersonalizedEmail(
        customerId: number,
        rmId: number,
        emailType: EmailType,
        metadata: Record<string, any>,
        model: string = 'gpt-4o',
        customPrompt?: string
    ): Promise<GeneratedEmailContent> {
        // Fetch customer with relations
        const customer = await this.customerRepository.findOne({
            where: { id: customerId },
            relations: ['cards'],
        });

        if (!customer) {
            throw new NotFoundException(`Customer with ID ${customerId} not found`);
        }

        // Fetch RM
        const rm = await this.rmRepository.findOne({
            where: { id: rmId },
        });

        if (!rm) {
            throw new NotFoundException(`Relationship Manager with ID ${rmId} not found`);
        }

        // Build the base prompt based on email type
        const basePrompt = this.buildPrompt(customer, rm, emailType, metadata);

        // Combine all prompts
        let finalPrompt = basePrompt;

        // Add RM's custom prompt if exists
        if (rm.customPrompt) {
            finalPrompt += `\n\nHướng dẫn cá nhân hóa từ RM: ${rm.customPrompt}`;
        }

        // Add per-generation custom prompt if provided
        if (customPrompt) {
            finalPrompt += `\n\nYêu cầu bổ sung cho lần tạo này: ${customPrompt}`;
        }

        // Generate email using OpenAI
        const systemPrompt = `Bạn là một chuyên viên quan hệ khách hàng chuyên nghiệp tại VPBank. 
Nhiệm vụ của bạn là viết email cá nhân hóa và tin nhắn trực tiếp cho khách hàng.

- Email: Giọng văn trang trọng nhưng thân thiện, ấm áp và xây dựng mối quan hệ với khách hàng. 
  QUAN TRỌNG: Chỉ viết phần lời chào và nội dung chính, KHÔNG bao gồm phần chữ ký hay lời kết cuối email (như "Trân trọng", "Best regards", v.v.) vì phần này sẽ được tự động thêm vào sau.
- Message: Giọng văn tự nhiên, thân mật hơn, phù hợp để gửi qua tin nhắn trực tiếp hoặc SMS. 
  Hãy tự điều chỉnh mức độ trang trọng dựa trên phân khúc và mối quan hệ với khách hàng.

Trả lời theo định dạng JSON:
{
  "subject": "Tiêu đề email ngắn gọn và hấp dẫn",
  "body": "Nội dung email với lời chào và nội dung chính (KHÔNG bao gồm chữ ký)",
  "message": "Tin nhắn ngắn gọn, thân thiện để gửi trực tiếp"
}`;

        const openai = new OpenAI({
            apiKey: this.configService.get('openai.apiKey'),
            baseURL: this.configService.get('openai.baseUrl'),
        });

        const completion = await openai.chat.completions.create({
            model: model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: finalPrompt },
            ],
            response_format: { type: "json_object" },
        });

        const response = completion.choices[0].message.content;
        if (!response) {
            throw new BadRequestException('Failed to generate email content');
        }

        const emailContent = JSON.parse(response);

        // Process and append email signature to the body
        const signature = this.processEmailSignature(rm);
        const bodyWithSignature = `${emailContent.body}\n\n${signature}`;

        return {
            subject: emailContent.subject,
            body: bodyWithSignature,
            message: emailContent.message,
        };
    }

    /**
     * Build prompt based on email type and customer/RM context
     */
    private buildPrompt(
        customer: Customer,
        rm: RelationshipManager,
        emailType: EmailType,
        metadata: Record<string, any>
    ): string {
        // Determine gender salutation
        const genderSalutation = customer.gender === 'male' ? 'Anh' :
            customer.gender === 'female' ? 'Chị' : 'Quý khách';

        // Build card information
        const cardInfo = customer.cards && customer.cards.length > 0
            ? customer.cards.map(card => `${card.cardProductName} (${card.cardType} - ${card.cardNetwork}): ${card.cardDescription}`).join(', ')
            : 'chưa có thẻ';

        const baseContext = `
Thông tin khách hàng:
- Tên: ${customer.name}
- Xưng hô: ${genderSalutation}
- Nghề nghiệp: ${customer.jobTitle}
- Phân khúc: ${customer.segment}
- Mô tả hành vi: ${customer.behaviorDescription}
- Thẻ hiện tại: ${cardInfo}

Thông tin RM:
- Tên RM: ${rm.name}
- Chức danh: ${rm.title}
- Cấp bậc: ${rm.level}
`;

        switch (emailType) {
            case EmailType.BIRTHDAY:
                return `${baseContext}

Loại email: Chúc mừng sinh nhật

Thông tin sinh nhật:
- Tuổi: ${metadata.age || 'N/A'}

Hãy viết email chúc mừng sinh nhật ấm áp và cá nhân hóa. Email cần:
1. Chúc mừng sinh nhật khách hàng một cách chân thành
2. Đề cập đến vị trí phân khúc và nghề nghiệp của khách hàng một cách tự nhiên
3. Nhắc đến lợi ích của các thẻ họ đang sở hữu (nếu có)
4. Mời khách hàng khám phá các ưu đãi đặc biệt dành cho sinh nhật
5. Thể hiện sự trân trọng mối quan hệ lâu dài với VPBank`;

            case EmailType.CARD_RENEWAL:
                const renewalInfo = metadata.renewingCards && metadata.renewingCards.length > 0
                    ? metadata.renewingCards.map((card: any) =>
                        `${card.cardProductName} (gia hạn vào ${card.renewalDate}, còn ${card.daysUntilRenewal} ngày)`
                    ).join(', ')
                    : 'N/A';

                return `${baseContext}

Loại email: Nhắc nhở gia hạn thẻ

Thông tin gia hạn:
- Thẻ cần gia hạn: ${renewalInfo}
- Số lượng thẻ: ${metadata.totalCards || 0}

Hãy viết email nhắc nhở gia hạn thẻ. Email cần:
1. Nhắc nhở khách hàng về việc gia hạn thẻ sắp tới một cách nhẹ nhàng
2. Nêu bật các lợi ích và ưu đãi họ đã tận hưởng với thẻ
3. Đề xuất nâng cấp lên thẻ cao cấp hơn nếu phù hợp với phân khúc khách hàng
4. Hướng dẫn quy trình gia hạn đơn giản
5. Đề nghị liên hệ để được tư vấn thêm`;

            case EmailType.SEGMENT_MILESTONE:
                let milestoneDesc = '';
                if (metadata.milestoneType === 'account_anniversary') {
                    milestoneDesc = `Kỷ niệm ${metadata.years} năm đồng hành với VPBank (khách hàng từ ${metadata.customerSince})`;
                } else if (metadata.milestoneType === 'segment_achievement') {
                    milestoneDesc = `Đạt được phân khúc ${metadata.segment} (đạt được vào ${metadata.achievedDate})`;
                }

                return `${baseContext}

Loại email: Cột mốc quan trọng

Thông tin cột mốc:
- Loại: ${metadata.milestoneType}
- Mô tả: ${milestoneDesc}
- Phân khúc hiện tại: ${customer.segment}

Hãy viết email chúc mừng cột mốc quan trọng. Email cần:
1. Chúc mừng khách hàng về cột mốc đặc biệt này
2. Cảm ơn sự tin tưởng và gắn bó lâu dài với VPBank
3. Nhấn mạnh giá trị và đặc quyền của phân khúc hiện tại
4. Giới thiệu các lợi ích và ưu đãi đặc biệt dành riêng cho họ
5. Cam kết tiếp tục đồng hành và hỗ trợ trong tương lai`;

            default:
                throw new BadRequestException(`Unsupported email type: ${emailType}`);
        }
    }

    /**
     * Create and save a generated email
     */
    async createGeneratedEmail(dto: CreateGeneratedEmailDto): Promise<GeneratedEmail> {
        // Set expiration date to 7 days from now
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const email = this.emailRepository.create({
            ...dto,
            expiresAt,
            status: EmailStatus.DRAFT,
        });

        return await this.emailRepository.save(email);
    }

    /**
     * Get all emails for an RM with optional filters
     */
    async getEmailsByRm(rmId: number, status?: EmailStatus): Promise<GeneratedEmail[]> {
        const query: any = { rmId };
        if (status) {
            query.status = status;
        }

        return await this.emailRepository.find({
            where: query,
            relations: ['customer', 'relationshipManager'],
            order: { generatedAt: 'DESC' },
        });
    }

    /**
     * Get a specific email by ID
     */
    async getEmailById(id: number): Promise<GeneratedEmail> {
        const email = await this.emailRepository.findOne({
            where: { id },
            relations: ['customer', 'relationshipManager'],
        });

        if (!email) {
            throw new NotFoundException(`Email with ID ${id} not found`);
        }

        return email;
    }

    /**
     * Regenerate an existing email
     */
    async regenerateEmail(emailId: number, model: string = 'gpt-4o', customPrompt?: string): Promise<GeneratedEmail> {
        const existingEmail = await this.getEmailById(emailId);

        // Generate new content
        const newContent = await this.generatePersonalizedEmail(
            existingEmail.customerId,
            existingEmail.rmId,
            existingEmail.emailType,
            existingEmail.metadata,
            model,
            customPrompt
        );

        // Update the email
        existingEmail.subject = newContent.subject;
        existingEmail.body = newContent.body;
        existingEmail.message = newContent.message;
        existingEmail.status = EmailStatus.DRAFT;

        // Extend expiration by 7 days from now
        const newExpiresAt = new Date();
        newExpiresAt.setDate(newExpiresAt.getDate() + 7);
        existingEmail.expiresAt = newExpiresAt;

        return await this.emailRepository.save(existingEmail);
    }

    /**
     * Regenerate all emails for a Relationship Manager
     */
    async regenerateEmailsByRm(
        rmId: number,
        status?: EmailStatus,
        emailType?: EmailType,
        model: string = 'gpt-4o',
        customPrompt?: string
    ): Promise<{
        regenerated: number;
        failed: number;
        errors: Array<{ emailId: number; error: string }>;
        emails: GeneratedEmail[];
    }> {
        // Validate RM exists
        const rm = await this.rmRepository.findOne({
            where: { id: rmId },
        });

        if (!rm) {
            throw new NotFoundException(`Relationship Manager with ID ${rmId} not found`);
        }

        // Build query with filters
        const query: any = { rmId };
        if (status) {
            query.status = status;
        }
        if (emailType) {
            query.emailType = emailType;
        }

        // Fetch emails
        const emails = await this.emailRepository.find({
            where: query,
            relations: ['customer', 'relationshipManager'],
            order: { generatedAt: 'DESC' },
        });

        if (emails.length === 0) {
            return {
                regenerated: 0,
                failed: 0,
                errors: [],
                emails: [],
            };
        }

        // Regenerate each email
        const regeneratedEmails: GeneratedEmail[] = [];
        const errors: Array<{ emailId: number; error: string }> = [];
        let regeneratedCount = 0;
        let failedCount = 0;

        for (const email of emails) {
            try {
                const regeneratedEmail = await this.regenerateEmail(email.id, model, customPrompt);
                regeneratedEmails.push(regeneratedEmail);
                regeneratedCount++;
            } catch (error) {
                failedCount++;
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                errors.push({
                    emailId: email.id,
                    error: errorMessage,
                });
                this.logger.error(`Failed to regenerate email ${email.id} for RM ${rmId}:`, errorMessage);
            }
        }

        return {
            regenerated: regeneratedCount,
            failed: failedCount,
            errors,
            emails: regeneratedEmails,
        };
    }

    /**
     * Update email status
     */
    async updateEmailStatus(id: number, status: EmailStatus): Promise<GeneratedEmail> {
        const email = await this.getEmailById(id);
        const previousStatus = email.status;
        email.status = status;

        const updatedEmail = await this.emailRepository.save(email);

        // If email status changed to SENT, create or update the corresponding task
        if (status === EmailStatus.SENT && previousStatus !== EmailStatus.SENT) {
            await this.createOrUpdateTaskForEmail(updatedEmail);
        }

        return updatedEmail;
    }

    /**
     * Create or update a task when an email is sent
     */
    private async createOrUpdateTaskForEmail(email: GeneratedEmail): Promise<void> {
        try {
            // Generate a unique task ID based on email ID and type
            const taskId = `EMAIL-${email.emailType}-${email.id}`;

            // Determine task details based on email type
            const taskDetails = this.generateTaskDetails(email);

            // Calculate due date (7 days from now for follow-up)
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 7);

            // Check if task already exists
            try {
                const existingTask = await this.taskService.findByTaskId(taskId);

                // Update existing task
                await this.taskService.update(existingTask.id, {
                    taskDetails,
                    status: TaskStatus.COMPLETED,
                    dueDate,
                });

                this.logger.log(`Updated task ${taskId} for sent email ${email.id}`);
            } catch (error) {
                // Task doesn't exist, create new one
                await this.taskService.create({
                    taskId,
                    rmId: email.rmId,
                    customerId: email.customerId,
                    taskType: TaskType.EMAIL,
                    status: TaskStatus.COMPLETED,
                    taskDetails,
                    dueDate,
                });

                this.logger.log(`Created task ${taskId} for sent email ${email.id}`);
            }
        } catch (error) {
            this.logger.error(`Failed to create/update task for email ${email.id}:`, error);
            // Don't throw error to prevent email status update from failing
            // The email was sent successfully, task creation is secondary
        }
    }

    /**
     * Generate task details based on email type and content
     */
    private generateTaskDetails(email: GeneratedEmail): string {
        const emailTypeLabels = {
            [EmailType.BIRTHDAY]: 'Chúc mừng sinh nhật',
            [EmailType.CARD_RENEWAL]: 'Nhắc nhở gia hạn thẻ',
            [EmailType.SEGMENT_MILESTONE]: 'Chúc mừng cột mốc quan trọng',
        };

        const emailTypeLabel = emailTypeLabels[email.emailType] || email.emailType;

        return `Email ${emailTypeLabel} đã được gửi cho khách hàng. Chủ đề: "${email.subject}". Theo dõi phản hồi và tương tác của khách hàng.`;
    }

    /**
     * Manually create or update task for a sent email
     * Useful for retroactively creating tasks for emails that were sent before the integration
     */
    async createTaskForEmail(emailId: number): Promise<void> {
        const email = await this.getEmailById(emailId);

        if (email.status !== EmailStatus.SENT) {
            throw new BadRequestException('Can only create tasks for emails with SENT status');
        }

        await this.createOrUpdateTaskForEmail(email);
    }

    /**
     * Delete an email
     */
    async deleteEmail(id: number): Promise<void> {
        const email = await this.getEmailById(id);
        await this.emailRepository.remove(email);
    }

    /**
     * Clean up expired draft emails
     */
    async cleanupExpiredEmails(): Promise<number> {
        const now = new Date();
        const expiredEmails = await this.emailRepository.find({
            where: {
                status: EmailStatus.DRAFT,
                expiresAt: LessThan(now),
            },
        });

        if (expiredEmails.length > 0) {
            await this.emailRepository.remove(expiredEmails);
        }

        return expiredEmails.length;
    }

    async sendEmail(email: string, subject: string, body: string) {
        return "CAN_CALL_TOOL"
    }
}
