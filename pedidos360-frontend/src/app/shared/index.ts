/**
 * Shared Module Barrel Exports
 * 
 * Exports shared components and models for clean imports.
 * Usage: import { StatCardComponent, UserData } from '@app/shared';
 */

// Models
export * from './models/user.model';
export * from './models/pedido.model';
export * from './models/api.model';

// Components
export * from './components/stat-card/stat-card.component';
export * from './components/user-avatar/user-avatar.component';
export * from './components/role-badge/role-badge.component';
export * from './components/token-display/token-display.component';
export * from './components/error-message/error-message.component';
export * from './components/empty-state/empty-state.component';
export * from './components/permission-guard/permission-guard.component';
export * from './components/modal/modal.component';
export * from './components/loading-spinner/loading-spinner.component';
