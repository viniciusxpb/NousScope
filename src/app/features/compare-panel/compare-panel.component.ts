import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfigService } from '../../core/services/config.service';

@Component({
    selector: 'app-compare-panel',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './compare-panel.component.html',
    styleUrl: './compare-panel.component.scss',
})
export class ComparePanelComponent {
    private readonly config = inject(ConfigService);

    // Local state for comparison
    readonly compareFunc = signal(this.config.ui.defaultCompareFunc);
    readonly compareColor = signal(this.config.ui.defaultCompareColor);
    readonly showCompare = signal(true);

    // Predefined functions
    readonly functions = [
        { label: 'x * cos(x)', value: 'x*cos(x)' },
        { label: 'sin(x)', value: 'sin(x)' },
        { label: 'tanh(x)', value: 'tanh(x)' },
        { label: 'x^2', value: 'x^2' },
        { label: 'step(x)', value: 'x > 0 ? 1 : 0' },
    ];

    updateFunc(value: string): void {
        this.compareFunc.set(value);
    }

    toggleCompare(): void {
        this.showCompare.update(v => !v);
    }
}
