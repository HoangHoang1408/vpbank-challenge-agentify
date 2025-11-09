import { Column, CreateDateColumn, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Entity } from "typeorm/decorator/entity/Entity";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Customer } from "../../customer/entities/customer.entity";

export enum RmLevel {
    LEVEL_4 = "Level 4",
    LEVEL_5 = "Level 5",
    LEVEL_6 = "Level 6",
    LEVEL_7 = "Level 7",
}

@Entity()
export class RelationshipManager {
    @ApiProperty({
        description: 'Unique identifier for the Relationship Manager',
        example: 1,
    })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({
        description: 'Employee ID',
        example: 12345,
    })
    @Column()
    employeeId: number;

    @ApiProperty({
        description: 'Full name of the Relationship Manager',
        example: 'Nguyen Van A',
    })
    @Column()
    name: string;

    @ApiProperty({
        description: 'Date of birth',
        example: '1985-05-15',
    })
    @Column({ type: 'date' })
    dob: Date;

    @ApiProperty({
        description: 'RM level',
        enum: RmLevel,
        example: RmLevel.LEVEL_5,
    })
    @Column({ type: 'enum', enum: RmLevel })
    level: RmLevel;

    @ApiProperty({
        description: 'Job title',
        example: 'Senior Relationship Manager',
    })
    @Column()
    title: string;

    @ApiProperty({
        description: 'Hire date',
        example: '2015-03-20',
    })
    @Column({ type: 'date' })
    hireDate: Date;

    @ApiProperty({
        description: 'Whether the RM is active',
        example: true,
    })
    @Column()
    isActive: boolean;

    @ApiPropertyOptional({
        description: 'Custom prompt that will be applied to all auto-generated emails for this RM. This allows the RM to personalize their communication style across all generated content.',
        example: 'Tôi muốn tất cả email đều có giọng điệu vui vẻ và nhiệt tình hơn, nhấn mạnh vào lợi ích cụ thể cho khách hàng.',
        type: String,
        nullable: true,
    })
    @Column({ type: 'text', nullable: true })
    customPrompt: string | null;

    @ApiPropertyOptional({
        description: 'Email signature template that will be appended to all generated emails. Supports template variables: {{Name}} for RM name, {{Title}} for RM title. If not set, uses default template: "Best regards,\\n{{Name}}\\n{{Title}}\\nVPBank"',
        example: 'Best regards,\n{{Name}}\n{{Title}}\nVPBank',
        type: String,
        nullable: true,
    })
    @Column({ type: 'text', nullable: true })
    emailSignature: string | null;

    @OneToMany(() => Customer, customer => customer.relationshipManager)
    customers: Customer[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

}