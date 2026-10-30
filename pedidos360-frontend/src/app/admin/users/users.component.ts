import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService, Usuario } from '../../services/usuario.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  private usuarioService = inject(UsuarioService);
  usuarios = signal<Usuario[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);
  ngOnInit(): void { this.cargarUsuarios(); }
  cargarUsuarios(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.usuarioService.listarUsuarios().subscribe({
      next: (usuarios) => { this.usuarios.set(usuarios); this.cargando.set(false); },
      error: (err) => { console.error('Error:', err); this.error.set('Error al cargar usuarios'); this.cargando.set(false); }
    });
  }
  cambiarRol(usuario: Usuario): void {
    const nuevoRol = usuario.rol === 'CLIENTE' ? 'OPERADOR' : 'CLIENTE';
    if (!confirm('Cambiar rol de ' + usuario.nombre + ' de ' + usuario.rol + ' a ' + nuevoRol + '?')) return;
    this.usuarioService.cambiarRol(usuario.id, nuevoRol).subscribe({
      next: () => { this.cargarUsuarios(); alert('Rol cambiado a ' + nuevoRol); },
      error: () => alert('Error al cambiar rol')
    });
  }
  suspender(usuario: Usuario): void {
    if (!confirm('Suspender a ' + usuario.nombre + '?')) return;
    this.usuarioService.suspender(usuario.id).subscribe({
      next: () => { this.cargarUsuarios(); alert('Usuario suspendido'); },
      error: () => alert('Error')
    });
  }
  activar(usuario: Usuario): void {
    if (!confirm('Activar a ' + usuario.nombre + '?')) return;
    this.usuarioService.activar(usuario.id).subscribe({
      next: () => { this.cargarUsuarios(); alert('Usuario activado'); },
      error: () => alert('Error')
    });
  }
  getRolBadgeClass(rol: string): string {
    if (rol === 'ADMIN') return 'badge-admin';
    if (rol === 'OPERADOR') return 'badge-operador';
    return 'badge-cliente';
  }
  puedeEditar(usuario: Usuario): boolean { return usuario.rol !== 'ADMIN'; }
}