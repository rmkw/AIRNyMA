import { UsersResponce } from "@/products/interfaces/user-responce.interface";

export interface AuthResponse {

  authenticated: boolean; // Nuevo campo
  user?: UsersResponce; // Puede estar ausente si no está autenticado
  message?: string;
}
