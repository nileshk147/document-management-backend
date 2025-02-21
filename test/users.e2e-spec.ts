import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { UserRole } from '../src/utils';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Register & logging in as Admin
    const adminUser = {
      email: 'admin@example.com',
      password: 'Admin123!@#',
      role: UserRole.ADMIN,
    };

    await request(app.getHttpServer()).post('/auth/register').send(adminUser);

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: adminUser.email,
        password: adminUser.password,
      });

    adminToken = loginResponse.body.data.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/users (POST) - should create a new user', () => {
    return request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        email: 'user@example.com',
        password: 'User123!@#',
        role: UserRole.VIEWER,
      })
      .expect(201)
      .expect((res) => {
        userId = res.body.data.id;
        expect(res.body.data.email).toBe('user@example.com');
      });
  });

  it('/users (GET) - should get all users', () => {
    return request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body.data)).toBeTruthy();
        expect(res.body.data.length).toBeGreaterThan(0);
      });
  });

  it('/users/:id (GET) - should get user by id', () => {
    return request(app.getHttpServer())
      .get(`/users/${userId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.data.id).toBe(userId);
      });
  });
});
