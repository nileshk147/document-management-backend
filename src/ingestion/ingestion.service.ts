import {
  Injectable,
  NotFoundException,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { IngestionJob } from './entities/ingestion.job.entity';
import { CreateIngestionDto } from './dto/create.ingestion.dto';
import { UpdateIngestionDto } from './dto/update.ingestion.dto';
import { User } from '../users/entities/user.entity';
import { IngestionStatus } from '../utils';
import { firstValueFrom } from 'rxjs';
import { Document } from '../documents/entities/document.entity';

@Injectable()
export class IngestionService {
  constructor(
    @InjectRepository(IngestionJob)
    private ingestionRepository: Repository<IngestionJob>,
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    private httpService: HttpService,
  ) {}

  async create(
    createIngestionDto: CreateIngestionDto,
    user: User,
  ): Promise<IngestionJob> {
    try {
      const document = await this.documentRepository.findOne({
        where: { id: createIngestionDto?.documentId } as any,
      });

      if (!document) {
        throw new NotFoundException(
          `Document with ID ${createIngestionDto?.documentId} not found`,
        );
      }

      const job = this.ingestionRepository.create({
        ...createIngestionDto,
        document,
        createdBy: user,
      });

      const savedJob = await this.ingestionRepository.save(job);
      this.processJob(savedJob);
      return savedJob;
    } catch (error) {
      throw error;
    }
  }

  async findAll(): Promise<IngestionJob[]> {
    try {
      return this.ingestionRepository.find();
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: string): Promise<IngestionJob> {
    try {
      const job = await this.ingestionRepository.findOne({ where: { id } });
      if (!job)
        throw new NotFoundException(`Ingestion job with ID ${id} not found`);

      return job;
    } catch (error) {
      throw error;
    }
  }

  async update(
    id: string,
    updateIngestionDto: UpdateIngestionDto,
  ): Promise<IngestionJob> {
    try {
      const job = await this.findOne(id);
      if (!job)
        throw new NotFoundException(`Ingestion job with ID ${id} not found`);

      if (job?.status === IngestionStatus.COMPLETED)
        throw new BadRequestException('Cannot update completed ingestion job');

      Object.assign(job, updateIngestionDto);
      return this.ingestionRepository.save(job);
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const job = await this.findOne(id);
      if (!job)
        throw new NotFoundException(`Ingestion job with ID ${id} not found`);
      await this.ingestionRepository.remove(job);
    } catch (error) {
      throw error;
    }
  }

  private async processJob(job: IngestionJob): Promise<void> {
    try {
      job.status = IngestionStatus?.PROCESSING;
      await this.ingestionRepository.save(job);

      // Call Python backend for processing
      const response: any = await firstValueFrom(
        this.httpService.post('http://python-backend/process', {
          // python backend url to process that file
          jobId: job?.id,
          documentId: job?.document.id,
          type: job?.type,
        }),
      );

      job.status = IngestionStatus?.COMPLETED;
      await this.ingestionRepository.save(job);

      // Notify callback URL about completion
      await firstValueFrom(
        this.httpService.post(job.callbackUrl, {
          jobId: job.id,
          status: IngestionStatus.COMPLETED,
          result: response.data,
        }),
      );
    } catch (error) {
      job.status = IngestionStatus.FAILED;
      job.error = error.message;
      await this.ingestionRepository.save(job);

      // Notify callback URL about the failure
      await firstValueFrom(
        this.httpService.post(job.callbackUrl, {
          jobId: job.id,
          status: IngestionStatus.FAILED,
          error: error.message,
        }),
      ).catch(console.error);
    }
  }
}
