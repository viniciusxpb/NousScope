import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Layer, ActivationType } from '../../../../core/models/layer.model';
import { ACTIVATION_OPTIONS } from '../../../../core/constants/activations.constants';

@Component({
    selector: 'app-layer-card',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './layer-card.component.html',
    styleUrl: './layer-card.component.scss',
})
export class LayerCardComponent {
    readonly layer = input.required<Layer>();
    readonly index = input.required<number>();
    readonly isFirst = input<boolean>(false);
    readonly isLast = input<boolean>(false);

    readonly remove = output<void>();
    readonly neuronsChange = output<number>();
    readonly activationChange = output<ActivationType>();

    readonly activationOptions = ACTIVATION_OPTIONS;

    readonly isInput = computed(() => this.layer().type === 'input');
    readonly isOutput = computed(() => this.layer().type === 'output');
    readonly canRemove = computed(() => !this.isInput() && !this.isOutput());

    onNeuronsInput(event: Event): void {
        const value = +(event.target as HTMLInputElement).value;
        this.neuronsChange.emit(value);
    }

    onActivationChange(event: Event): void {
        const select = event.target as HTMLSelectElement;
        this.activationChange.emit(select.value as ActivationType);
    }

    onRemove(): void {
        this.remove.emit();
    }
}
