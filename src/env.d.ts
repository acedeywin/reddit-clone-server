declare namespace NodeJS {
  export interface ProcessEnv {
    DB: string;
    DB_USERNAME: string;
    DB_PASSWORD: string;
    REDIS_URL: string;
    SESSION_SECRET: string;
    CORS_ORIGIN: string;
    EMAIL_HOST: string;
    EMAIL_USER: string;
    EMAIL_PASS: string;
    SEND_EMAIL: string;
  }
}
