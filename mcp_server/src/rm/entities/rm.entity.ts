import { Column, CreateDateColumn, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Entity } from "typeorm/decorator/entity/Entity";
import { Customer } from "../../customer/entities/customer.entity";

export enum RmLevel {
    LEVEL_4 = "Level 4",
    LEVEL_5 = "Level 5",
    LEVEL_6 = "Level 6",
    LEVEL_7 = "Level 7",
}

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

    @Column({ type: 'enum', enum: RmLevel })
    level: RmLevel;

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