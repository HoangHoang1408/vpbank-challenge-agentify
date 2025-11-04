import { Column, CreateDateColumn, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Entity } from "typeorm/decorator/entity/Entity";
import { Customer } from "../customer/entities/customer.entity";

@Entity()
export class RelationshipManager {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    employeeId: number;

    @Column()
    name: string;

    @Column({ type: 'date' })
    dob: Date;

    @Column()
    level: string;

    @Column()
    title: string;

    @Column({ type: 'date' })
    hireDate: Date;

    @Column()
    isActive: boolean;

    @OneToMany(() => Customer, customer => customer.relationshipManager)
    customers: Customer[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

}