export enum UserRole {
  CLIENT = 'CLIENT',
  CLINIC = 'CLINIC',
  DISTRIBUTOR = 'DISTRIBUTOR',
  ADMIN = 'ADMIN',
}

export class User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}
