declare namespace NodeJS {
  export interface ProcessEnv {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
    CLERK_SECRET_KEY: string;
    MONGODB_URI: string;
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: string;
  }
}
