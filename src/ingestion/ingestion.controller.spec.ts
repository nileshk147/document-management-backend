import { Test, TestingModule } from '@nestjs/testing';
import { UserRole, IngestionType } from '../utils';
import { CreateIngestionDto } from './dto/create.ingestion.dto';
import { IngestionController } from './ingestion.controller';
import { IngestionService } from './ingestion.service';

describe('IngestionController', () => {
  let controller: IngestionController;
  let service: IngestionService;

  const mockIngestionService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IngestionController],
      providers: [
        {
          provide: IngestionService,
          useValue: mockIngestionService,
        },
      ],
    }).compile();

    controller = module.get<IngestionController>(IngestionController);
    service = module.get<IngestionService>(IngestionService);
  });

  describe('create', () => {
    it('should create an ingestion job', async () => {
      const createIngestionDto: CreateIngestionDto = {
        documentId: '1',
        type: IngestionType.PDF,
        callbackUrl: 'http://callback.com',
      };

      const mockUser = {
        id: '1',
        email: 'test@example.com',
        role: UserRole.ADMIN,
      } as any;

      const expectedResult = {
        id: '1',
        ...createIngestionDto,
        createdBy: mockUser,
      };

      mockIngestionService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createIngestionDto, mockUser);
      expect(result).toEqual(expectedResult);
      expect(service.create).toHaveBeenCalledWith(createIngestionDto, mockUser);
    });
  });
});
