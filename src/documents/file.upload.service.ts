import { ConfigService } from '../config/config.service';
import {
  Injectable,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileUploadService {
  constructor(private configService: ConfigService) {
    this.ensureUploadDirectoryExists();
  }
  private readonly uploadDir = this.configService?.getEnvValue('UPLOAD_DIR');

  private async ensureUploadDirectoryExists() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(file: any): Promise<string> {
    try {
      if (!file) throw new BadRequestException('No file uploaded');

      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${uuidv4()}.${fileExtension}`;
      const filePath = join(this.uploadDir, fileName);

      await fs.writeFile(filePath, file.buffer);

      return fileName;
    } catch (error) {
      throw error;
    }
  }

  async deleteFile(fileName: string): Promise<void> {
    try {
      await fs.unlink(join(this.uploadDir, fileName));
    } catch (error) {
      // file might have been already deleted
      console.error(`Error deleting file ${fileName}:`, error);
    }
  }
}
