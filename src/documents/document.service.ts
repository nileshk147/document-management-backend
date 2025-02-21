import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDocumentDto } from './dto/create.document.dto';
import { User } from 'src/users/entities/user.entity';
import { FileUploadService } from './file.upload.service';
import { Document } from './entities/document.entity';
@Injectable()
export class DocumentService {
    constructor(
        @InjectRepository(Document)
        private documentsRepository: Repository<Document>,
        private fileUploadService: FileUploadService,
      ) {}

    async create(
        createDocumentDto: CreateDocumentDto,
        file: any,
        user: User,
      ): Promise<Document> {
        try {
          const fileName = await this.fileUploadService.uploadFile(file);
    
          const document = this.documentsRepository.create({
            ...createDocumentDto,
            filePath: fileName,
            fileSize: file.size,
            uploadedBy: user,
          });
    
          return this.documentsRepository.save(document);
        } catch (error) {
          throw error;
        }
      }
}
