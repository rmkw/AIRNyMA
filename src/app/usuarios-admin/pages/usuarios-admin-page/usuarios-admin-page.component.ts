import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsuarioAdmin } from '../../interfaces/usuario-admin.interface';
import { UsuariosAdminService } from '../../services/usuarios-admin.service';

@Component({
  selector: 'app-usuarios-admin-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios-admin-page.component.html',
})
export class UsuariosAdminPageComponent implements OnInit {
  private service = inject(UsuariosAdminService);

  readonly rolesDisponibles = ['USER', 'ARMO', 'ADMIN', 'ROOT'];
  comprobando = true;
  desbloqueado = false;
  procesando = false;
  claveAcceso = '';
  error = '';
  mensaje = '';
  usuarios: UsuarioAdmin[] = [];

  usuarioEditando: UsuarioAdmin | null = null;
  nombre = '';
  aka = '';
  contrasena = '';
  rolesSeleccionados = new Set<string>(['USER']);

  usuarioContrasena: UsuarioAdmin | null = null;
  nuevaContrasena = '';
  confirmarContrasena = '';
  usuarioEliminar: UsuarioAdmin | null = null;

  @ViewChild('modalContrasena') modalContrasena?: ElementRef<HTMLDialogElement>;
  @ViewChild('modalEliminar') modalEliminar?: ElementRef<HTMLDialogElement>;

  ngOnInit(): void {
    this.service.estado().subscribe({
      next: (respuesta) => {
        this.desbloqueado = respuesta.desbloqueado;
        this.comprobando = false;
        if (this.desbloqueado) this.cargarUsuarios();
      },
      error: () => {
        this.comprobando = false;
        this.error = 'No fue posible consultar el estado del módulo.';
      },
    });
  }

  desbloquear() {
    if (!this.claveAcceso.trim() || this.procesando) return;
    this.procesando = true;
    this.error = '';
    this.service.desbloquear(this.claveAcceso).subscribe({
      next: () => {
        this.desbloqueado = true;
        this.claveAcceso = '';
        this.procesando = false;
        this.cargarUsuarios();
      },
      error: (err) => {
        this.procesando = false;
        this.error = this.obtenerError(err, 'No fue posible desbloquear el módulo.');
      },
    });
  }

  bloquear() {
    this.service.bloquear().subscribe({
      next: () => {
        this.desbloqueado = false;
        this.usuarios = [];
        this.limpiarFormulario();
      },
      error: (err) => this.mostrarError(err, 'No fue posible bloquear el módulo.'),
    });
  }

  cargarUsuarios() {
    this.procesando = true;
    this.service.listar().subscribe({
      next: (usuarios) => {
        this.usuarios = [...usuarios].sort((a, b) => a.nombre.localeCompare(b.nombre));
        this.procesando = false;
      },
      error: (err) => {
        this.procesando = false;
        this.mostrarError(err, 'No fue posible cargar los usuarios.');
      },
    });
  }

  guardarUsuario() {
    if (!this.nombre.trim() || !this.aka.trim() || (!this.usuarioEditando && !this.contrasena)) {
      this.error = 'Completa el nombre, alias y contraseña.';
      return;
    }

    this.procesando = true;
    this.error = '';
    const payload = {
      nombre: this.nombre.trim(),
      aka: this.aka.trim(),
      contrasena: this.usuarioEditando ? undefined : this.contrasena,
      roles: Array.from(this.rolesSeleccionados),
    };
    const solicitud = this.usuarioEditando
      ? this.service.actualizar(this.usuarioEditando.id, payload)
      : this.service.crear(payload);

    solicitud.subscribe({
      next: () => {
        this.mensaje = this.usuarioEditando
          ? 'Usuario actualizado correctamente.'
          : 'Usuario registrado correctamente.';
        this.procesando = false;
        this.limpiarFormulario();
        this.cargarUsuarios();
      },
      error: (err) => {
        this.procesando = false;
        this.mostrarError(err, 'No fue posible guardar el usuario.');
      },
    });
  }

  editar(usuario: UsuarioAdmin) {
    this.usuarioEditando = usuario;
    this.nombre = usuario.nombre;
    this.aka = usuario.aka;
    this.contrasena = '';
    this.rolesSeleccionados = new Set(usuario.roles);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  alternarRol(rol: string, seleccionado: boolean) {
    if (seleccionado) this.rolesSeleccionados.add(rol);
    else this.rolesSeleccionados.delete(rol);
  }

  limpiarFormulario() {
    this.usuarioEditando = null;
    this.nombre = '';
    this.aka = '';
    this.contrasena = '';
    this.rolesSeleccionados = new Set<string>(['USER']);
  }

  abrirCambioContrasena(usuario: UsuarioAdmin) {
    this.usuarioContrasena = usuario;
    this.nuevaContrasena = '';
    this.confirmarContrasena = '';
    this.modalContrasena?.nativeElement.showModal();
  }

  cerrarCambioContrasena() {
    if (this.procesando) return;
    this.modalContrasena?.nativeElement.close();
    this.usuarioContrasena = null;
    this.nuevaContrasena = '';
    this.confirmarContrasena = '';
  }

  confirmarCambioContrasena() {
    if (!this.usuarioContrasena || !this.nuevaContrasena ||
        this.nuevaContrasena !== this.confirmarContrasena) return;
    this.procesando = true;
    this.service.cambiarContrasena(this.usuarioContrasena.id, this.nuevaContrasena).subscribe({
      next: (respuesta) => {
        this.procesando = false;
        this.mensaje = respuesta.message;
        this.modalContrasena?.nativeElement.close();
        this.usuarioContrasena = null;
        this.nuevaContrasena = '';
        this.confirmarContrasena = '';
      },
      error: (err) => {
        this.procesando = false;
        this.mostrarError(err, 'No fue posible actualizar la contraseña.');
      },
    });
  }

  abrirEliminar(usuario: UsuarioAdmin) {
    this.usuarioEliminar = usuario;
    this.modalEliminar?.nativeElement.showModal();
  }

  cerrarEliminar() {
    if (this.procesando) return;
    this.modalEliminar?.nativeElement.close();
    this.usuarioEliminar = null;
  }

  confirmarEliminar() {
    if (!this.usuarioEliminar) return;
    this.procesando = true;
    this.service.eliminar(this.usuarioEliminar.id).subscribe({
      next: (respuesta) => {
        this.procesando = false;
        this.mensaje = respuesta.message;
        this.modalEliminar?.nativeElement.close();
        this.usuarioEliminar = null;
        this.cargarUsuarios();
      },
      error: (err) => {
        this.procesando = false;
        this.mostrarError(err, 'No fue posible eliminar el usuario.');
      },
    });
  }

  cerrarMensaje() {
    this.mensaje = '';
    this.error = '';
  }

  private mostrarError(err: any, respaldo: string) {
    if (err?.status === 401) {
      this.desbloqueado = false;
      this.usuarios = [];
    }
    this.error = this.obtenerError(err, respaldo);
  }

  private obtenerError(err: any, respaldo: string): string {
    if (err?.status === 404) {
      return 'El módulo aún no está disponible en el backend. Reinicia o vuelve a desplegar el backend.';
    }
    if (err?.status === 401 || err?.status === 403) {
      return 'La sesión no está autorizada. Vuelve a iniciar sesión e inténtalo nuevamente.';
    }
    return typeof err?.error === 'object' && !err.error?.text && err.error?.message
      ? err.error.message
      : respaldo;
  }
}
