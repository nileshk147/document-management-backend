import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import { UserRole } from '../../utils';
  import { BaseEntity } from '../../base.entity/base.entity';
  
  @Entity('users')
  export class User extends BaseEntity {
    @Column({ unique: true })
    email: string;
  
    @Column()
    password: string;
  
    @Column({
      type: 'enum',
      enum: UserRole,
      default: UserRole.VIEWER,
    })
    role: UserRole;
  }
  