import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { CreateIngestionDto } from './dto/create.ingestion.dto';
import { UpdateIngestionDto } from './dto/update.ingestion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../utils';
import { CurrentUser } from '../auth/decorators/current-user.decorators';
import { Roles } from '../auth/decorators/roles.decorators';

@Controller('ingestion')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  create(
    @Body() createIngestionDto: CreateIngestionDto,
    @CurrentUser() user: User,
  ) {
    return this.ingestionService.create(createIngestionDto, user);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER)
  findAll() {
    return this.ingestionService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER)
  findOne(@Param('id') id: string) {
    return this.ingestionService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateIngestionDto: UpdateIngestionDto,
  ) {
    return this.ingestionService.update(id, updateIngestionDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.ingestionService.remove(id);
  }
}
