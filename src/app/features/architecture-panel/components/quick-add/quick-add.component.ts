import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-quick-add',
    standalone: true,
    imports: [CommonModule],
    template: `
    <button class="add-btn" (click)="add.emit()">
      <span class="icon">+</span>
      <span>Add Hidden Layer</span>
    </button>
  `,
    styles: [`
    .add-btn {
      width: 100%;
      padding: var(--space-sm);
      background: transparent;
      border: 1px dashed var(--color-grid);
      border-radius: var(--radius-md);
      color: var(--color-text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-sm);
      transition: all 0.2s;
      
      &:hover {
        border-color: var(--color-primary);
        color: var(--color-primary);
        background: rgba(0, 217, 255, 0.05);
      }
      
      .icon {
        font-size: 1.2rem;
        font-weight: bold;
      }
    }
  `]
})
export class QuickAddComponent {
    readonly add = output<void>();
}
