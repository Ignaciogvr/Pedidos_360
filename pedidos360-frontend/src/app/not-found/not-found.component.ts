import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="error-page">
      <div class="error-content">
        <div class="error-code">404</div>
        <div class="error-glow"></div>
        <h1 class="error-title">Página no encontrada</h1>
        <p class="error-msg">La ruta que buscas no existe o fue eliminada.</p>
        <a routerLink="/dashboard" class="btn-primary">← Volver al Dashboard</a>
      </div>
    </div>
  `,
  styles: [`
    .error-page { min-height: 80vh; display: flex; align-items: center; justify-content: center; text-align: center; }
    .error-content { position: relative; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
    .error-code { font-size: 9rem; font-weight: 900; line-height: 1; background: linear-gradient(135deg, #6366f1, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: -0.05em; position: relative; z-index: 1; }
    .error-glow { position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 300px; height: 150px; background: radial-gradient(ellipse, rgba(99,102,241,0.25), transparent 70%); filter: blur(20px); }
    .error-title { font-size: 1.8rem; font-weight: 800; color: #f1f5f9; margin: 0; }
    .error-msg { color: #64748b; font-size: 1rem; margin: 0; }
    .btn-primary { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border: none; padding: 0.7rem 1.8rem; border-radius: 10px; font-weight: 600; font-size: 0.95rem; cursor: pointer; text-decoration: none; transition: all 0.2s; box-shadow: 0 0 20px rgba(99,102,241,0.3); margin-top: 0.5rem; display: inline-block; }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 0 30px rgba(99,102,241,0.5); }
  `]
})
export class NotFoundComponent {}
