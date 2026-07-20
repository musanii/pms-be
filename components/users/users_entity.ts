import {
    Entity, PrimaryGeneratedColumn, Column,
    CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn
} from 'typeorm';
import { Roles } from '../roles/roles_entity';

@Entity()
export class Users {
    @PrimaryGeneratedColumn('uuid')
    user_id: string;

    @Column({ length: 50, nullable: true })
    fullname: string;

    @Column({ length: 30, nullable: false, unique: true })
    username: string;

    @Column({ length: 60, nullable: false, unique: true })
    email: string;

    @Column({ nullable: false })
    password: string;

    // 1. Add the explicit column for the foreign key string
    @Column({ name: 'role_id', nullable: false })
    role_id: string;

    // 2. Link the relation to that same column
    @ManyToOne(() => Roles, { nullable: false })
    @JoinColumn({ name: 'role_id' })
    role: Roles; 

    @CreateDateColumn()
    created_at: Date;
    
    @UpdateDateColumn()
    updated_at: Date;
}