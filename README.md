# **NestJS Document Management System**

A robust **document management system** built with **NestJS**, featuring:
✅ **User authentication** (JWT-based)
✅ **Role-based access control** (RBAC)
✅ **Document management** (upload, storage, retrieval)
✅ **Document ingestion** (processing and external service integration)

---

## **📌 Quick Start**  

```bash
# Clone the repository
git clone <repository-url>
cd <project-directory>

# Install dependencies
npm install

# Copy the example environment variables and configure them
cp .env.example .env

# Start the application in development mode
npm run start:dev
```

---

## **⚙️ Prerequisites**  
Ensure you have the following installed:
- **Node.js** (v14 or later)  
- **PostgreSQL** (v12 or later)  
- **npm** (v6 or later)  

---

## **📂 Project Structure**  
```
src/
├── auth/                  # Authentication module
│   ├── decorators/
│   ├── dto/
│   ├── guards/
│   ├── strategies/
│   └── tests
├── users/                 # Users module
│   ├── dto/
│   ├── entities/
│   ├── controllers/
│   ├── services/
│   └── tests
├── documents/             # Document management module
│   ├── dto/
│   ├── entities/
│   ├── controllers/
│   ├── services/
│   └── tests
├── ingestion/             # Document ingestion module
│   ├── dto/
│   ├── services/
│   ├── entities/
│   └── tests
test/                      # Unit and integration tests
```

---

## **🔑 Authentication & Authorization**  
- **JWT-based authentication**
- **Role-based access control (RBAC)**
- **Bcrypt password hashing**

### **🛠 Example: JWT Configuration in `app.module.ts`**
```typescript
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN', '1d') },
      }),
      inject: [ConfigService],
    }),
  ],
})
```

---

## **📝 API Endpoints**  

### **🔐 Authentication**  
| Method | Endpoint | Description |
|--------|---------|-------------|
| **POST** | `/auth/register` | Register a new user |
| **POST** | `/auth/login` | Login and get JWT token |
| **POST** | `/auth/logout` | Invalidate current JWT |

#### **🔹 Example: Login Request**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```
#### **🔹 Example: Login Response**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR...",
  "expiresIn": "1d"
}
```

---

### **📂 Document Management**  
| Method | Endpoint | Description |
|--------|---------|-------------|
| **POST** | `/documents` | Upload new document |
| **GET** | `/documents` | List all documents |
| **GET** | `/documents/:id` | Get document by ID |
| **PATCH** | `/documents/:id` | Update document metadata |
| **DELETE** | `/documents/:id` | Delete a document |

---

## **🔐 Security Best Practices**  

1. **Use Environment Variables**  
   - Never hardcode sensitive data in your source code.  
   - Store credentials in a **`.env` file**.  

2. **Enable CORS Protection**  
   ```typescript
   app.enableCors({
     origin: 'https://your-frontend-domain.com',
     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
     credentials: true,
   });
   ```

3. **Use Helmet for Security Headers**  
   ```typescript
   import * as helmet from 'helmet';
   app.use(helmet());
   ```

4. **Rate Limiting to Prevent Brute-Force Attacks**  
   ```typescript
   import { ThrottlerGuard } from '@nestjs/throttler';
   @UseGuards(ThrottlerGuard)
   ```

---

## **🚀 Running the Application**

### **Development Mode**
```bash
npm run start:dev
```

### **Production Mode**
```bash
npm run build
npm run start:prod
```

---

## **✅ Testing**
```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Generate test coverage report
npm run test:cov
```

---

## **🤝 Contributing**
1. **Fork the repository**  
2. **Create a feature branch**  
3. **Commit your changes**  
4. **Push to your branch**  
5. **Open a pull request**  

---

## **📄 License**
This project is licensed under the **MIT License**.

---

## **📞 Support**
For support, open an issue in the repository or contact the development team.

