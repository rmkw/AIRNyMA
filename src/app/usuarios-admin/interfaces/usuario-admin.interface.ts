export interface UsuarioAdmin {
  id: number;
  nombre: string;
  aka: string;
  roles: string[];
}

export interface UsuarioAdminRequest {
  nombre: string;
  aka: string;
  contrasena?: string;
  roles: string[];
}
