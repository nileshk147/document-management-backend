import { Entity, Column, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { IngestionStatus, IngestionType } from '../../utils';
import { Document } from '../../documents/entities/document.entity';
import { BaseEntity } from '../../base.entity/base.entity';

@Entity('ingestion_jobs')
export class IngestionJob extends BaseEntity {
  @ManyToOne(() => Document, { eager: true })
  document: Document;

  @Column({
    type: 'enum',
    enum: IngestionType,
  })
  type: IngestionType;

  @Column({
    type: 'enum',
    enum: IngestionStatus,
    default: IngestionStatus?.PENDING,
  })
  status: IngestionStatus;

  @Column({ nullable: true })
  error?: string;

  @Column()
  callbackUrl: string;

  @ManyToOne(() => User, { eager: true })
  createdBy: User;
}
