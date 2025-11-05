import { Customer } from "../../customer/entities/customer.entity";
import { Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";


export enum CardType {
    DEBIT = "DEBIT",
    CREDIT = "CREDIT",
}
export enum CardNetwork {
    VISA = "VISA",
    MASTERCARD = "MASTERCARD",
}

@Entity()
export class Card {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToMany(() => Customer, customer => customer.cards)
    customers: Customer[];

    @Column({ type: 'enum', enum: CardType })
    cardType: CardType;

    @Column({ unique: true })
    cardProductName: string;

    @Column()
    cardDescription: string;

    @Column()
    targetDescription: string;

    @Column({ type: 'enum', enum: CardNetwork })
    cardNetwork: CardNetwork;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ default: true })
    isActive: boolean;
}