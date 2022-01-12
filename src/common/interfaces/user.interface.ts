import { UserRole } from '../enums';

export interface IUser {
  id: string;
  username: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}
