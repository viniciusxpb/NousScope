import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompareService } from '../../core/services/compare.service';

@Component({
    selector: 'app-compare-panel',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './compare-panel.component.html',
    styleUrl: './compare-panel.component.scss',
})
export class ComparePanelComponent {
    private readonly compareService = inject(CompareService);

    // Bind to service signals
    readonly compareFunc = this.compareService.compareFunc;
    readonly compareColor = this.compareService.compareColor;
    readonly showCompare = this.compareService.showCompare;

    // Predefined functions
    readonly functions = [
        { label: 'x * cos(x)', value: 'x*cos(x)' },
        { label: 'sin(x)', value: 'sin(x)' },
        { label: 'tanh(x)', value: 'tanh(x)' },
        { label: 'x^2', value: 'x^2' },
        { label: 'step(x)', value: 'x > 0 ? 1 : 0' },
    ];

    updateFunc(value: string): void {
        this.compareService.updateFunc(value);
    }

    updateColor(value: string): void {
        this.compareService.updateColor(value);
    }

    toggleCompare(): void {
        this.compareService.toggleCompare();
    }
}
