import { IsEnum } from "class-validator";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { RelationshipManager } from "../../entities/rm.entity";
export enum Gender {
    MALE = 'male',
    FEMALE = 'female',
    OTHER = 'other',
}

export enum JobTitle {
    ENGINEER = 'Kỹ sư',
    SCIENTIST = 'Nhà khoa học',
    TEACHER = 'Giáo viên',
    DOCTOR = 'Bác sĩ',
    LAWYER = 'Luật sư',
    ACCOUNTANT = 'Kế toán',
    ARTIST = 'Nghệ sĩ',
    MUSICIAN = 'Nhạc sĩ',
    WRITER = 'Viết sử',
    PROGRAMMER = 'Lập trình viên',
    DESIGNER = 'Thiết kế',
    MARKETER = 'Marketing',
}
export enum Segment {
    DIAMOND_ELITE = 'Diamond Elite',
    DIAMOND = 'Diamond',
    PRE_DIAMOND = 'Pre-Diamond',
    CHAMPION_PRIME = 'Champion Prime',
    RISING_PRIME = 'Rising Prime',
    UPPERMEGA_PRIME = 'Uppermega Prime',
    MEGA_PRIME = 'Mega Prime',
}

@Entity()
export class Customer {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    customerId: string;

    @Column()
    name: string;

    @Column()
    email: string;

    @Column()
    phone: string;

    @Column()
    address: string;

    @Column()
    country: string;

    @Column({ type: 'date' })
    dob: Date;

    @Column({ type: 'enum', enum: Gender })
    @IsEnum(Gender)
    gender: Gender;

    @Column({ type: 'enum', enum: JobTitle })
    @IsEnum(JobTitle)
    jobTitle: JobTitle;

    @Column({ type: 'enum', enum: Segment })
    @IsEnum(Segment)
    segment: Segment;

    @Column()
    state: string;

    @Column()
    zip: string;

    @Column()
    isActive: boolean;

    @ManyToOne(() => RelationshipManager, rm => rm.customers)
    relationshipManager: RelationshipManager;

    @Column()
    rmId: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}