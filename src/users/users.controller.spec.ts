import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto } from './dto/create.user.dto';
import { UserRole } from '../utils';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        role: UserRole?.VIEWER,
      };

      const expectedResult = {
        id: '1',
        ...createUserDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.create.mockResolvedValue(expectedResult);

      expect(await controller.create(createUserDto)).toBe(expectedResult);
      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const expectedResult = [
        {
          id: '1',
          email: 'test@example.com',
          role: UserRole.VIEWER,
        },
      ];

      mockUsersService.findAll.mockResolvedValue(expectedResult);

      expect(await controller.findAll()).toBe(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      const expectedResult = {
        id: '1',
        email: 'test@example.com',
        role: UserRole.VIEWER,
      };

      mockUsersService.findOne.mockResolvedValue(expectedResult);

      expect(await controller.findOne('1')).toBe(expectedResult);
      expect(mockUsersService.findOne).toHaveBeenCalledWith('1');
    });
  });
});
