import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { IngestionType } from '../../utils';

export class CreateIngestionDto {
  @IsString()
  @IsNotEmpty()
  documentId: string;

  @IsEnum(IngestionType)
  type: IngestionType;

  @IsString()
  @IsNotEmpty()
  callbackUrl: string;
}
