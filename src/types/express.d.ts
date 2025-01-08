import "express-session"; // Import express-session to extend its types
import { SessionData } from "express-session";

declare module "express-serve-static-core" {
  interface Request {
    session: SessionData & {
      userId?: string; // Add custom session properties here
      role?: string;
    };
  }
}
