import { Component, OnInit, inject, signal, computed } from '@angular/core';
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
  searchQuery = signal('');

  filteredUsuarios = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.usuarios();
    return this.usuarios().filter(u =>
      u.nombre.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  });

  stats = computed(() => {
    const all = this.usuarios();
    return {
      total: all.length,
      admins: all.filter(u => u.rol === 'ADMIN').length,
      operadores: all.filter(u => u.rol === 'OPERADOR').length,
      clientes: all.filter(u => u.rol === 'CLIENTE').length,
      suspendidos: all.filter(u => !u.activo).length
    };
  });

  getInitials(nombre: string): string {
    return nombre.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  }
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