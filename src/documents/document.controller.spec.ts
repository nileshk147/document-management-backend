import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '../utils';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create.document.dto';

describe('DocumentsController', () => {
  let controller: DocumentController;
  let service: DocumentService;

  const mockDocumentsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentController],
      providers: [
        {
          provide: DocumentService,
          useValue: mockDocumentsService,
        },
      ],
    }).compile();

    controller = module.get<DocumentController>(DocumentController);
    service = module.get<DocumentService>(DocumentService);
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
        role: UserRole.ADMIN,
      } as any;

      const expectedResult = {
        id: '1',
        ...createDocumentDto,
        filePath: 'test.pdf',
        uploadedBy: mockUser,
      };

      mockDocumentsService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(
        createDocumentDto,
        mockFile,
        mockUser,
      );
      expect(result).toEqual(expectedResult);
      expect(service.create).toHaveBeenCalledWith(
        createDocumentDto,
        mockFile,
        mockUser,
      );
    });
  });
});
