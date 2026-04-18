export type Role = 'USER' | 'ADMIN';

export type User = {
  id: number;
  username: string;
  role: Role;
};
