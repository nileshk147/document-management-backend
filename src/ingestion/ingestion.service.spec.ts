import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { CreateIngestionDto } from './dto/create.ingestion.dto';
import { UpdateIngestionDto } from './dto/update.ingestion.dto';
import { IngestionJob } from './entities/ingestion.job.entity';
import { IngestionStatus, IngestionType } from '../utils';
import { IngestionService } from './ingestion.service';
import { Document } from '../documents/entities/document.entity';

describe('IngestionService', () => {
  let service: IngestionService;
  let ingestionRepository: Repository<IngestionJob>;
  let documentRepository: Repository<Document>;
  let httpService: HttpService;

  const mockIngestionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockDocumentRepository = {
    findOne: jest.fn(),
  };

  const mockHttpService = {
    post: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IngestionService,
        {
          provide: getRepositoryToken(IngestionJob),
          useValue: mockIngestionRepository,
        },
        {
          provide: getRepositoryToken(Document),
          useValue: mockDocumentRepository,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<IngestionService>(IngestionService);
    ingestionRepository = module.get<Repository<IngestionJob>>(
      getRepositoryToken(IngestionJob),
    );
    documentRepository = module.get<Repository<Document>>(
      getRepositoryToken(Document),
    );
    httpService = module.get<HttpService>(HttpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createIngestionDto: CreateIngestionDto = {
      documentId: '1',
      type: IngestionType.PDF,
      callbackUrl: 'http://callback.example.com',
    };

    const mockUser: any = {
      id: '1',
      email: 'test@example.com',
      role: 'ADMIN',
    };

    const mockDocument = {
      id: '1',
      title: 'Test Document',
      filePath: '/path/to/file',
    };

    it('should successfully create an ingestion job', async () => {
      const mockJob = {
        id: '1',
        document: mockDocument,
        type: IngestionType.PDF,
        status: IngestionStatus.PENDING,
        createdBy: mockUser,
        callbackUrl: createIngestionDto.callbackUrl,
      };

      mockDocumentRepository.findOne.mockResolvedValue(mockDocument);
      mockIngestionRepository.create.mockReturnValue(mockJob);
      mockIngestionRepository.save.mockResolvedValue(mockJob);
      mockHttpService.post.mockReturnValue(of({ data: {} }));

      const result = await service.create(createIngestionDto, mockUser);

      expect(result).toBeDefined();
      expect(result.status).toBe(IngestionStatus.PROCESSING);
      expect(documentRepository.findOne).toHaveBeenCalledWith({
        where: { id: createIngestionDto.documentId },
      });
      expect(ingestionRepository.create).toHaveBeenCalled();
      expect(ingestionRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when document is not found', async () => {
      mockDocumentRepository.findOne.mockResolvedValue(null);

      await expect(
        service.create(createIngestionDto, mockUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle processing errors correctly', async () => {
      const mockJob = {
        id: '1',
        document: mockDocument,
        type: IngestionType.PDF,
        status: IngestionStatus.PENDING,
        createdBy: mockUser,
        callbackUrl: createIngestionDto.callbackUrl,
      };

      mockDocumentRepository.findOne.mockResolvedValue(mockDocument);
      mockIngestionRepository.create.mockReturnValue(mockJob);
      mockIngestionRepository.save.mockResolvedValue(mockJob);

      mockHttpService.post
        .mockImplementationOnce(() =>
          throwError(() => new Error('Processing failed')),
        )
        .mockImplementationOnce(() => of({ data: {} }));

      const result = await service.create(createIngestionDto, mockUser);
      expect(result.status).toBe(IngestionStatus.PROCESSING);
    });
  });

  describe('findAll', () => {
    it('should return an array of ingestion jobs', async () => {
      const mockJobs = [
        { id: '1', status: IngestionStatus.COMPLETED },
        { id: '2', status: IngestionStatus.PENDING },
      ];

      mockIngestionRepository.find.mockResolvedValue(mockJobs);

      const result = await service.findAll();
      expect(result).toEqual(mockJobs);
      expect(ingestionRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single ingestion job', async () => {
      const mockJob = { id: '1', status: IngestionStatus.COMPLETED };
      mockIngestionRepository.findOne.mockResolvedValue(mockJob);

      const result = await service.findOne('1');
      expect(result).toEqual(mockJob);
      expect(ingestionRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException when job is not found', async () => {
      mockIngestionRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateIngestionDto: UpdateIngestionDto = {
      callbackUrl: 'http://new-callback.example.com',
    };

    it('should update an ingestion job', async () => {
      const mockJob = {
        id: '1',
        status: IngestionStatus.PENDING,
        callbackUrl: 'http://old-callback.example.com',
      };

      const updatedJob = {
        ...mockJob,
        callbackUrl: updateIngestionDto.callbackUrl,
      };

      mockIngestionRepository.findOne.mockResolvedValue(mockJob);
      mockIngestionRepository.save.mockResolvedValue(updatedJob);

      const result = await service.update('1', updateIngestionDto);
      expect(result).toEqual(updatedJob);
      expect(ingestionRepository.save).toHaveBeenCalledWith(updatedJob);
    });

    it('should throw BadRequestException when updating completed job', async () => {
      const mockJob = {
        id: '1',
        status: IngestionStatus.COMPLETED,
      };

      mockIngestionRepository.findOne.mockResolvedValue(mockJob);

      await expect(service.update('1', updateIngestionDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('remove', () => {
    it('should remove an ingestion job', async () => {
      const mockJob = { id: '1', status: IngestionStatus.COMPLETED };
      mockIngestionRepository.findOne.mockResolvedValue(mockJob);
      mockIngestionRepository.remove.mockResolvedValue(mockJob);

      await service.remove('1');
      expect(ingestionRepository.remove).toHaveBeenCalledWith(mockJob);
    });

    it('should throw NotFoundException when job to remove is not found', async () => {
      mockIngestionRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('processJob', () => {
    it('should handle successful processing', async () => {
      const mockJob: any = {
        id: '1',
        status: IngestionStatus.PENDING,
        document: { id: '1' },
        type: IngestionType.PDF,
        callbackUrl: 'http://callback.example.com',
      };

      mockHttpService.post
        .mockImplementationOnce(() => of({ data: { success: true } }))
        .mockImplementationOnce(() => of({ data: {} }));

      mockIngestionRepository.save.mockImplementation((job) =>
        Promise.resolve(job),
      );

      await service['processJob'](mockJob);

      expect(mockJob.status).toBe(IngestionStatus.COMPLETED);
      expect(ingestionRepository.save).toHaveBeenCalled();
      expect(httpService.post).toHaveBeenCalledTimes(2);
    });

    it('should handle processing failures', async () => {
      const mockJob: any = {
        id: '1',
        status: IngestionStatus.PENDING,
        document: { id: '1' },
        type: IngestionType.PDF,
        callbackUrl: 'http://callback.example.com',
      };

      mockHttpService.post
        .mockImplementationOnce(() =>
          throwError(() => new Error('Processing failed')),
        )
        .mockImplementationOnce(() => of({ data: {} }));

      mockIngestionRepository.save.mockImplementation((job) =>
        Promise.resolve(job),
      );

      await service['processJob'](mockJob);

      expect(mockJob?.status).toBe(IngestionStatus.FAILED);
      expect(mockJob?.error).toBeDefined();
      expect(ingestionRepository.save).toHaveBeenCalled();
    });
  });
});
