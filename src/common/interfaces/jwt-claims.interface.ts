import { UserRole } from '../enums';

export interface JwtClaims {
  id: string;
  username: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}
