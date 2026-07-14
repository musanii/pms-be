import { 
    Entity, PrimaryGeneratedColumn, Column, 
    CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn 
} from 'typeorm';
import { Users } from '../users/users_entity';
import { Projects } from '../projects/projects_entity';

export enum Status {
    NotStarted = 'Not-Started',
    InProgress = 'In-Progress',
    Completed = 'Completed',
}

export enum Priority {
    Low = 'Low',
    Medium = 'Medium',
    High = 'High',
}

@Entity()
export class Tasks {
    @PrimaryGeneratedColumn('uuid')
    task_id: string;

    @Column({ length: 30, nullable: false, unique: true })
    name: string;

    @Column({ length: 500, nullable: true }) // Set to nullable if description is optional
    description: string;

    // Fixed: Removed duplicate @Column(), changed type to 'Projects'
    @ManyToOne(() => Projects, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'project_id' })
    project: Projects;

    // Fixed: Removed duplicate @Column(), changed type to 'Users'
    @ManyToOne(() => Users, { nullable: false, onDelete: 'SET NULL' }) // Keeps task if user is deleted
    @JoinColumn({ name: 'user_id' })
    user: Users;

    // Fixed: Added explicit date types for better database compatibility
    @Column({ type: 'timestamptz', nullable: true })
    estimated_start_time: Date;

    @Column({ type: 'timestamptz', nullable: true })
    estimated_end_time: Date;

    @Column({ type: 'timestamptz', nullable: true })
    actual_start_time: Date;

    @Column({ type: 'timestamptz', nullable: true })
    actual_end_time: Date;

    @Column({
        type: 'enum',
        enum: Priority,
        default: Priority.Low,
    })
    priority: Priority;

    @Column({
        type: 'enum',
        enum: Status,
        default: Status.NotStarted,
    })
    status: Status;

    @Column('text', { array: true, default: '{}' }) // Correct Postgres syntax for default empty array
    supported_files: string[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}