import {
    HttpException,
    HttpStatus,
    Injectable,
    NotFoundException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  import { CreateUserDto } from './dto/create.user.dto';
  import { UpdateUserDto } from './dto/update.user.dto';
  import { User } from './entities/user.entity';
  import * as bcrypt from 'bcrypt';
  
  @Injectable()
  export class UsersService {
    constructor(
      @InjectRepository(User)
      private readonly usersRepository: Repository<User>,
    ) {}
  
    async create(createUserDto: CreateUserDto): Promise<User> {
      try {
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const user = this.usersRepository.create({
          ...createUserDto,
          password: hashedPassword,
        });
        return this.usersRepository.save(user);
      } catch (error) {
        throw error;
      }
    }
  
    async findAll(): Promise<User[]> {
      try {
        return this.usersRepository.find();
      } catch (error) {
        throw new HttpException(
          error.message,
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    async findOne(id: string): Promise<User> {
      try {
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user) throw new NotFoundException(`User with ID ${id} not found`);
        return user;
      } catch (error) {
        throw error;
      }
    }
  
    async findByEmail(email: string): Promise<User> {
      try {
        const user = await this.usersRepository.findOne({ where: { email } });
        if (!user)
          throw new NotFoundException(`User with Email ${email} not found`);
        return user;
      } catch (error) {
        throw error;
      }
    }
  
    async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
      try {
        const user = await this.findOne(id);
        if (!user) throw new NotFoundException(`User with ID ${id} not found`);
        if (updateUserDto.password) {
          updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
        }
  
        const updatedUser = this.usersRepository.merge(user, updateUserDto);
        return this.usersRepository.save(updatedUser);
      } catch (error) {
        throw error;
      }
    }
  
    async remove(id: string): Promise<void> {
      try {
        const user = await this.findOne(id);
        if (!user) throw new NotFoundException(`User with ID ${id} not found`);
        await this.usersRepository.remove(user);
      } catch (error) {
        throw error;
      }
    }
  }
  