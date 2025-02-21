import { Module } from '@nestjs/common';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { FileUploadService } from './file.upload.service';

@Module({
  controllers: [DocumentController],
  providers: [DocumentService, FileUploadService]
})
export class DocumentsModule {}
