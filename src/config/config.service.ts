import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

dotenv.config(); // Load environment variables automatically

@Injectable()
export class ConfigService {
  private readonly envConfig: NodeJS.ProcessEnv;

  constructor() {
    this.envConfig = process.env; // Use loaded environment variables
  }

  async createTypeOrmOptions(): Promise<TypeOrmModuleOptions> {
    return {
      type: 'postgres',
      host: this.getEnvValue('DATABASE_HOST'),
      port: this.getEnvNumber('DATABASE_PORT'),
      username: this.getEnvValue('DATABASE_USERNAME'),
      password: this.getEnvValue('DATABASE_PASSWORD'),
      database: this.getEnvValue('DATABASE_NAME'),
      schema: 'public',
      synchronize: this.getEnvBoolean('DB_SYNC', true),
      // ssl: this.getEnvBoolean('USE_SSL', false) ? { rejectUnauthorized: false } : undefined,
      logging: this.getEnvBoolean('DB_LOGGING', false),
      entities: ['dist/**/*.entity{.ts,.js}'],
      migrationsTableName: 'migration',
      migrations: ['dist/migrations/*.js'],
      ssl: {
        rejectUnauthorized: false, // Ensures SSL encryption
      },
    };
  }

  public getEnvValue(key: string): string {
    return this.envConfig[key] || '';
  }

  private getEnvNumber(key: string, defaultValue: number = 0): number {
    return this.envConfig[key] ? parseInt(this.envConfig[key], 10) : defaultValue;
  }

  private getEnvBoolean(key: string, defaultValue: boolean = false): boolean {
    return this.envConfig[key] ? this.envConfig[key] === 'true' : defaultValue;
  }

}
