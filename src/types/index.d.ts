import "express-session"; // Import express-session to extend its types

// Extend the SessionData interface
declare module "express-session" {
  interface SessionData {
    user?: {
      id: string;
      role: string;
    };
  }
}

// Export the extended Session and SessionData types
export interface CustomSession extends Express.Session {
  user?: {
    id: string;
    role: string;
  };
}

export type CustomSessionData = Express.SessionData & {
  user?: {
    id: string;
    role: string;
  };
};

export type PartialSessionData = Partial<CustomSessionData>;

export interface CustomSession extends Express.Session {
  userId?: string;
  role?: string;
}
