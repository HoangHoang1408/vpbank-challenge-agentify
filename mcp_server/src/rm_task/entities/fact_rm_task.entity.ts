import { Column, CreateDateColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Entity } from "typeorm/decorator/entity/Entity";
import { Customer } from "../../customer/entities/customer.entity";
import { RelationshipManager } from "../../rm/entities/rm.entity";

export enum TaskType {
    CALL = "CALL",
    EMAIL = "EMAIL",
    MEETING = "MEETING",
    FOLLOW_UP = "FOLLOW_UP",
    SEND_INFOR_PACKAGE = "SEND_INFO_PACKAGE"
}

export enum TaskStatus {
    COMPLETED = "COMPLETED",
    IN_PROGRESS = "IN_PROGRESS"
}

@Entity()
export class FactRmTask {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    taskId: string;

    @ManyToOne(() => RelationshipManager, rm => rm.id)
    relationshipManager: RelationshipManager;

    @Column()
    rmId: number;

    @ManyToOne(() => Customer, customer => customer.id)
    customer: Customer;

    @Column()
    customerId: number;

    @Column({ type: 'enum', enum: TaskType })
    taskType: TaskType;

    @Column({ type: 'enum', enum: TaskStatus })
    status: TaskStatus;

    @Column()
    taskDetails: string;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ type: 'date' })
    dueDate: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
