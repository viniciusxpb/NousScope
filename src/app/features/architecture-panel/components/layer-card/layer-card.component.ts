import { Component, input, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NetworkService } from '../../../../core/services/network.service';
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

    private readonly network = inject(NetworkService);

    readonly activationOptions = ACTIVATION_OPTIONS;

    readonly isInput = computed(() => this.layer().type === 'input');
    readonly isOutput = computed(() => this.layer().type === 'output');
    readonly canRemove = computed(() => !this.isInput() && !this.isOutput());

    updateNeurons(count: number): void {
        this.network.updateNeurons(this.layer().id, count);
    }

    updateActivation(event: Event): void {
        const select = event.target as HTMLSelectElement;
        // Cast to ActivationType because we know it's a valid activation type from the options
        this.network.updateActivation(this.layer().id, select.value as ActivationType);
    }

    onNeuronsInput(event: Event): void {
        const value = +(event.target as HTMLInputElement).value;
        this.updateNeurons(value);
    }

    remove(): void {
        this.network.removeLayer(this.layer().id);
    }
}
