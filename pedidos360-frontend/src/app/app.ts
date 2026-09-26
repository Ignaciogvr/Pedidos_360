import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { AuthenticationResult, EventMessage, EventType, InteractionStatus } from '@azure/msal-browser';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, RouterLink, CommonModule],
    templateUrl: './app.html',
    styleUrls: ['./app.css']
})
export class App implements OnInit {
    private msalService: MsalService = inject(MsalService);
    private msalBroadcastService: MsalBroadcastService = inject(MsalBroadcastService);

    isLoggedIn = false;
    userName = '';
    userEmail = '';
    userRoles: string[] = [];

    ngOnInit(): void {
        // Procesa el token que devuelve Microsoft al redirigir de vuelta
        this.msalService.handleRedirectObservable().subscribe({
            next: (result) => {
                if (result) {
                    this.msalService.instance.setActiveAccount(result.account);
                }
                this.checkLoginStatus();
            },
            error: (err) => {
                console.error('MSAL redirect error:', err);
            }
        });

        this.msalBroadcastService.msalSubject$
            .pipe(filter((msg: EventMessage) =>
                msg.eventType === EventType.INITIALIZE_END ||
                msg.eventType === EventType.LOGIN_SUCCESS
            ))
            .subscribe((result: EventMessage) => {
                if (result.eventType === EventType.LOGIN_SUCCESS) {
                    const payload = result.payload as AuthenticationResult;
                    this.msalService.instance.setActiveAccount(payload.account);
                }
                this.checkLoginStatus();
            });

        this.checkLoginStatus();
    }

    checkLoginStatus(): void {
        try {
            let activeAccount = this.msalService.instance.getActiveAccount();
            if (!activeAccount && this.msalService.instance.getAllAccounts().length > 0) {
                activeAccount = this.msalService.instance.getAllAccounts()[0];
                this.msalService.instance.setActiveAccount(activeAccount);
            }
            this.isLoggedIn = !!activeAccount;
            if (activeAccount) {
                this.userName = activeAccount.name || '';
                this.userEmail = activeAccount.username || '';
                this.userRoles = (activeAccount.idTokenClaims?.['roles'] as string[]) || [];
            }
        } catch {
            this.isLoggedIn = false;
        }
    }

    login(): void { this.msalService.loginRedirect(); }
    logout(): void { this.msalService.logoutRedirect(); }
}
