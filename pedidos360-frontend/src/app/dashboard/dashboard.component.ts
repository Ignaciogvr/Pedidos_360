import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserStore } from '../core/stores/user.store';
import { OrdersStore } from '../core/stores/orders.store';
import { TokenService } from '../core/services/token.service';
import { StatCardComponent } from '../shared/components/stat-card/stat-card.component';
import { TokenDisplayComponent } from '../shared/components/token-display/token-display.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, StatCardComponent, TokenDisplayComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  private userStore = inject(UserStore);
  private ordersStore = inject(OrdersStore);
  private tokenService = inject(TokenService);

  readonly user = this.userStore.currentUser;
  readonly stats = this.ordersStore.stats;
  readonly loading = this.ordersStore.loading;
  readonly tokenInfo = this.tokenService.getImportantClaims();

  ngOnInit() {
    this.ordersStore.loadOrders();
  }
}
