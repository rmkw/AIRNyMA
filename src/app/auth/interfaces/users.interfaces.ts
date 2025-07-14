export interface UsersResponce {
  id: number;
  nombre: string;
  contrasena: string;
  roles: Role[];

}

export enum Role {
  Admin = 'ADMIN',
  Root = 'ROOT',
  User = 'USER',
}
