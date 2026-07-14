import {
    Entity, PrimaryGeneratedColumn, Column,
    CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable
} from 'typeorm';
import { Users } from '../users/users_entity';

@Entity()
export class Projects {
    @PrimaryGeneratedColumn('uuid')
    project_id: string;

    @Column({ length: 30, nullable: false, unique: true })
    name: string;

    @Column({ length: 500, nullable: true }) // Set to nullable if description is optional
    description: string;

    // Fixed: Replaced the raw string array with a relational Many-to-Many association
    @ManyToMany(() => Users)
    @JoinTable({
        name: 'project_users', // Custom join table name
        joinColumn: { name: 'project_id', referencedColumnName: 'project_id' },
        inverseJoinColumn: { name: 'user_id', referencedColumnName: 'user_id' }
    })
    users: Users[];

    // Fixed: Explicitly typed the Date columns
    @Column({ type: 'timestamptz', nullable: true })
    start_time: Date;

    @Column({ type: 'timestamptz', nullable: true })
    end_time: Date;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}