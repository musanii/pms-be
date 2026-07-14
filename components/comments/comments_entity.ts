import {
    Entity, PrimaryGeneratedColumn, Column,
    CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn
} from 'typeorm';
import { Users } from '../users/users_entity';
import { Tasks } from '../tasks/tasks_entity';

@Entity()
export class Comments {
    @PrimaryGeneratedColumn('uuid')
    comment_id: string;

    @Column({ type: 'text' })
    comment: string;
    
    // Changed to ManyToOne and updated the TypeScript type to 'Users'
    @ManyToOne(() => Users, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: Users; // Renamed to 'user' to match the object type

    // Changed to ManyToOne and updated the TypeScript type to 'Tasks'
    @ManyToOne(() => Tasks, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'task_id' })
    task: Tasks; // Renamed to 'task' to match the object type

    @Column('text', { array: true, default: '{}' }) // PostgreSQL syntax for default empty array
    supported_files: string[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}