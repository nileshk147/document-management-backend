import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as path from 'path';
import { AppModule } from '../src/app.module';
import { UserRole } from '../src/utils';

describe('DocumentsController (e2e)', () => {
  let app: INestApplication;
  let userToken: string;
  let documentId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Register & logging in as Editor
    const editorUser = {
      email: 'editor@example.com',
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
  });

  afterAll(async () => {
    await app.close();
  });

  it('/documents (POST) - should upload a document', () => {
    return request(app.getHttpServer())
      .post('/documents')
      .set('Authorization', `Bearer ${userToken}`)
      .attach('file', path.join(__dirname, 'fixtures/test-document.pdf'))
      .field('title', 'Test Document')
      .field('description', 'Test Description')
      .expect(201)
      .expect((res) => {
        documentId = res.body.data.id;
        expect(res.body.data.title).toBe('Test Document');
      });
  });

  it('/documents (GET) - should get all documents', () => {
    return request(app.getHttpServer())
      .get('/documents')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body.data)).toBeTruthy();
        expect(res.body.data.length).toBeGreaterThan(0);
      });
  });

  it('/documents/:id (GET) - should get document by id', () => {
    return request(app.getHttpServer())
      .get(`/documents/${documentId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.data.id).toBe(documentId);
      });
  });
});
