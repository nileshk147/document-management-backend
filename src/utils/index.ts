export enum UserRole {
    ADMIN = 'admin',
    EDITOR = 'editor',
    VIEWER = 'viewer',
  }
  
  export enum IngestionStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    FAILED = 'failed',
  }
  
  export enum IngestionType {
    PDF = 'pdf',
    DOCX = 'docx',
    TXT = 'txt',
  }
  