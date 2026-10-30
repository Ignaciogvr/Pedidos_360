import { Component, Input, inject, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PermissionService } from '../../../core/services/permission.service';

@Component({
  selector: 'app-permission-guard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <ng-container *ngIf="hasPermission()">
      <ng-content></ng-content>
    </ng-container>
  `,
  styles: []
})
export class PermissionGuardComponent {
  private permissionService = inject(PermissionService);
  
  @Input() requiredRole?: string;
  @Input() requiredRoles?: string[];
  @Input() requireAll = false;
  
  readonly hasPermission = computed(() => {
    // Check single role
    if (this.requiredRole) {
      return this.permissionService.hasRole(this.requiredRole);
    }
    
    // Check multiple roles
    if (this.requiredRoles && this.requiredRoles.length > 0) {
      if (this.requireAll) {
        return this.permissionService.hasAllRoles(this.requiredRoles);
      } else {
        return this.permissionService.hasAnyRole(this.requiredRoles);
      }
    }
    
    // No permissions specified, show by default
    return true;
  });
}
