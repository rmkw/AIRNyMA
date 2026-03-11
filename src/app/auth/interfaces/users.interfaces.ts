export interface UsersResponce {
  id: number;
  nombre: string;
  aka: string;
  contrasena: string;
  roles: Role[];

}

export enum Role {
  Root = 'ROOT',
  Admin = 'ADMIN',
  Armo = 'ARMO',
  User = 'USER',
}
