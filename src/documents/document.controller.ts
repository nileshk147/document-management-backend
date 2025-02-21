import { Body, Controller, Delete, Get, Param, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { DocumentService } from './document.service';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { UserRole } from 'src/utils';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from 'src/auth/decorators/current-user.decorators';
import { User } from 'src/users/entities/user.entity';
import { CreateDocumentDto } from './dto/create.document.dto';
import { UpdateDocumentDto } from './dto/update.document.dto';

@Controller('document')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentController {

    constructor(private readonly documentService: DocumentService){}

    @Post()
    @Roles(UserRole.ADMIN, UserRole.EDITOR)
    @UseInterceptors(FileInterceptor('file'))
    create(
        @Body()createDocumentDto: CreateDocumentDto,
        @UploadedFile() file: any,
        @CurrentUser() user: User
    ){
        return this.documentService.create(createDocumentDto, file, user)
    }


    @Get()
    findAll() {
      return this.documentService.findAll();
    }
  
    @Get(':id')
    findOne(@Param('id') id: string) {
      return this.documentService.findOne(id);
    }
  
    @Patch(':id')
    @Roles(UserRole.ADMIN, UserRole.EDITOR)
    @UseInterceptors(FileInterceptor('file'))
    update(
      @Param('id') id: string,
      @Body() updateDocumentDto: UpdateDocumentDto,
      @UploadedFile() file: any,
    ) {
      return this.documentService.update(id, updateDocumentDto, file);
    }
  
    @Delete(':id')
    @Roles(UserRole.ADMIN)
    remove(@Param('id') id: string) {
      return this.documentService.remove(id);
    }

}
