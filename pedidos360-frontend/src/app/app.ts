import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { UserStore } from './core/stores/user.store';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
    templateUrl: './app.html',
    styleUrls: ['./app.css']
})
export class App implements OnInit {
    private authService = inject(AuthService);
    private userStore = inject(UserStore);

    readonly user = this.userStore.currentUser;
    readonly isAuthenticated = this.userStore.isAuthenticated;

    ngOnInit(): void {
        this.userStore.loadUser();
    }

    login(): void { this.authService.login(); }

    logout(): void {
        this.authService.logout();
        this.userStore.clearUser();
    }

    getRoleClass(role: string): string {
        const r = (role || '').toUpperCase();
        if (r.includes('ADMIN')) return 'role-admin';
        if (r.includes('OPERADOR') || r.includes('OPERATOR')) return 'role-oper';
        return 'role-client';
    }

    getInitials(name: string): string {
        return (name || '').split(' ').map(w => w[0] || '').slice(0,2).join('').toUpperCase();
    }
}
