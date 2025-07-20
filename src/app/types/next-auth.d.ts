// types/next-auth.d.ts
import { DefaultSession } from "next-auth";
declare module "next-auth" {
  interface User {
    id: string;
    isAdmin?: boolean;
    provider?: string;
    
  }
  
  interface Session {
    user: {
      id: string;
      isAdmin?: boolean;
      provider?: string;
      backendToken?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    isAdmin?: boolean;
    provider?: string;
    backendToken:string
  }
}