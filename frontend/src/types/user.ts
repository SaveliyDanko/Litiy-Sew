export type Role = 'USER' | 'ADMIN';

export type User = {
  id: number;
  email: string;
  role: Role;
};
