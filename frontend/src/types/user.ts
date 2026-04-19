export type Role = 'USER' | 'ADMIN';

export type User = {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  role: Role;
};
