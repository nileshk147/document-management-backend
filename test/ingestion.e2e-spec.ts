import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { UserRole, IngestionType } from '../src/utils';
import path from 'path';

describe('IngestionController (e2e)', () => {
  let app: INestApplication;
  let userToken: string;
  let documentId: string;
  let ingestionId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Create and login as editor
    const editorUser = {
      email: 'ingestion-editor@example.com',
      password: 'Editor123!@#',
      role: UserRole.EDITOR,
    };

    await request(app.getHttpServer()).post('/auth/register').send(editorUser);

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: editorUser.email,
        password: editorUser.password,
      });

    userToken = loginResponse.body.data.access_token;

    // Upload a document first
    const documentResponse = await request(app.getHttpServer())
      .post('/documents')
      .set('Authorization', `Bearer ${userToken}`)
      .attach('file', path.join(__dirname, 'fixtures/test-document.pdf'))
      .field('title', 'Test Document for Ingestion')
      .field('description', 'Test Description');

    documentId = documentResponse.body.data.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ingestion (POST) - should create an ingestion job', () => {
    return request(app.getHttpServer())
      .post('/ingestion')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        documentId: documentId,
        type: IngestionType.PDF,
        callbackUrl: 'http://callback.example.com',
      })
      .expect(201)
      .expect((res) => {
        ingestionId = res.body.data.id;
        expect(res.body.data.document.id).toBe(documentId);
      });
  });

  it('/ingestion (GET) - should get all ingestion jobs', () => {
    return request(app.getHttpServer())
      .get('/ingestion')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body.data)).toBeTruthy();
        expect(res.body.data.length).toBeGreaterThan(0);
      });
  });

  it('/ingestion/:id (GET) - should get ingestion job by id', () => {
    return request(app.getHttpServer())
      .get(`/ingestion/${ingestionId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.data.id).toBe(ingestionId);
      });
  });
});
