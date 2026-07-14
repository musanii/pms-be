import { 
    Entity, PrimaryGeneratedColumn, Column, 
    CreateDateColumn, UpdateDateColumn 
} from 'typeorm';

@Entity()
export class Roles {
    @PrimaryGeneratedColumn('uuid')
    role_id: string;

    @Column({ length: 60, nullable: false, unique: true })
    name: string;

    // Added nullable: true so you can optionally omit a description
    @Column({ length: 200, nullable: true })
    description: string;

    // OPTION A: If rights are just a list of permissions (e.g. ['read', 'write'])
    @Column('simple-array', { default: '' })
    rights: string[];

    /* // OPTION B: If you prefer to keep it as a raw text block/description of rights:
    @Column({ type: 'text', nullable: true })
    rights: string;
    */

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}