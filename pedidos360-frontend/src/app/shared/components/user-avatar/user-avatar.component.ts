import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-avatar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div 
      class="user-avatar" 
      [class.clickable]="clickable"
      [style.width.px]="sizeMap[size]"
      [style.height.px]="sizeMap[size]"
      [style.font-size.rem]="fontSizeMap[size]">
      {{ initials }}
    </div>
  `,
  styles: [`
    .user-avatar {
      border-radius: var(--radius-full);
      background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      color: white;
      flex-shrink: 0;
      transition: all var(--transition-base);
      border: 2px solid transparent;
    }
    
    .user-avatar.clickable {
      cursor: pointer;
    }
    
    .user-avatar.clickable:hover {
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.4);
      transform: scale(1.05);
    }
  `]
})
export class UserAvatarComponent {
  @Input() name = '';
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() clickable = false;
  
  readonly sizeMap = { sm: 32, md: 40, lg: 48, xl: 64 };
  readonly fontSizeMap = { sm: 0.75, md: 0.9, lg: 1.1, xl: 1.4 };
  
  get initials(): string {
    if (!this.name) return '??';
    
    const parts = this.name.trim().split(' ').filter(p => p.length > 0);
    
    if (parts.length === 0) return '??';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    
    // First + Last
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
}
