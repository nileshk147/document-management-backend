import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create.document.dto';
import { FileUploadService } from './file.upload.service';
import { Document } from './entities/document.entity';

describe('DocumentsService', () => {
  let service: DocumentService;
  let repository: Repository<Document>;
  let fileUploadService: FileUploadService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockFileUploadService = {
    uploadFile: jest.fn(),
    deleteFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentService,
        {
          provide: getRepositoryToken(Document),
          useValue: mockRepository,
        },
        {
          provide: FileUploadService,
          useValue: mockFileUploadService,
        },
      ],
    }).compile();

    service = module.get<DocumentService>(DocumentService);
    repository = module.get<Repository<Document>>(getRepositoryToken(Document));
    fileUploadService = module.get<FileUploadService>(FileUploadService);
  });

  describe('create', () => {
    it('should create a document', async () => {
      const createDocumentDto: CreateDocumentDto = {
        title: 'Test Document',
        description: 'Test Description',
        fileType: 'pdf',
      };

      const mockFile = {
        originalname: 'test.pdf',
        buffer: Buffer.from('test'),
        size: 1024,
      } as any;

      const mockUser = {
        id: '1',
        email: 'test@example.com',
      } as any;

      mockFileUploadService.uploadFile.mockResolvedValue('uploaded-file.pdf');
      mockRepository.create.mockReturnValue({ ...createDocumentDto });
      mockRepository.save.mockResolvedValue({
        id: '1',
        ...createDocumentDto,
        filePath: 'uploaded-file.pdf',
      });

      const result = await service.create(
        createDocumentDto,
        mockFile,
        mockUser,
      );

      expect(result).toBeDefined();
      expect(fileUploadService.uploadFile).toHaveBeenCalledWith(mockFile);
      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
    });
  });
});
