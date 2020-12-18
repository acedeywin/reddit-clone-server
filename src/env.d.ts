declare namespace NodeJS {
  export interface ProcessEnv {
    DATABASE_URL: string;
    REDIS_URL: string;
    SESSION_SECRET: string;
    EMAIL_HOST: string;
    EMAIL_USER: string;
    EMAIL_PASS: string;
    SEND_EMAIL: string;
    CORS_ORIGIN: string;
  }
}
