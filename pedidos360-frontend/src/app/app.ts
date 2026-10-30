import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { UserStore } from './core/stores/user.store';
import { UserAvatarComponent } from './shared/components/user-avatar/user-avatar.component';
import { RoleBadgeComponent } from './shared/components/role-badge/role-badge.component';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
      RouterOutlet, 
      RouterLink, 
      CommonModule,
      UserAvatarComponent,
      RoleBadgeComponent
    ],
    templateUrl: './app.html',
    styleUrls: ['./app.css']
})
export class App implements OnInit {
    private authService = inject(AuthService);
    private userStore = inject(UserStore);

    // Expose signals for template
    readonly user = this.userStore.currentUser;
    readonly isAuthenticated = this.userStore.isAuthenticated;

    ngOnInit(): void {
        // UserStore already initializes user data in constructor
        // We just need to refresh it here to ensure latest state
        this.userStore.loadUser();
    }

    login(): void { 
        this.authService.login(); 
    }
    
    logout(): void { 
        this.authService.logout();
        this.userStore.clearUser();
    }
}
