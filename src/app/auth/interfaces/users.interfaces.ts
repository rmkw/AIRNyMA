export interface UsersResponce {
  id: number;
  nombre: string;
  aka: string;
  contrasena: string;
  roles: Role[];

}

export enum Role {
  Admin = 'ADMIN',
  Root = 'ROOT',
  User = 'USER',
}
