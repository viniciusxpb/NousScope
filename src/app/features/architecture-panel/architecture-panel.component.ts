import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NetworkService } from '../../core/services/network.service';
import { LayerCardComponent } from './components/layer-card/layer-card.component';
import { ACTIVATIONS } from '../../core/constants/activations.constants';
import { ActivationType } from '../../core/models/layer.model';

@Component({
    selector: 'app-architecture-panel',
    standalone: true,
    imports: [CommonModule, FormsModule, LayerCardComponent],
    templateUrl: './architecture-panel.component.html',
    styleUrl: './architecture-panel.component.scss',
})
export class ArchitecturePanelComponent {
    private readonly networkService = inject(NetworkService);

    readonly networks = this.networkService.networks;
    readonly activeNetworkId = this.networkService.activeNetworkId;
    readonly activeNetwork = this.networkService.activeNetwork;
    readonly layers = this.networkService.layers;
    readonly showNetwork = this.networkService.showNetwork;
    readonly isAnimating = this.networkService.isAnimating;

    readonly activationOptions = Object.keys(ACTIVATIONS) as ActivationType[];

    // Network Management
    addNetwork(): void {
        this.networkService.addNetwork();
    }

    removeNetwork(id: string): void {
        this.networkService.removeNetwork(id);
    }

    setActiveNetwork(id: string): void {
        this.networkService.setActiveNetwork(id);
    }

    toggleVisibility(): void {
        this.networkService.toggleNetworkVisibility();
    }

    // Layer Management
    addHiddenLayer(): void {
        this.networkService.addHiddenLayer();
    }

    removeLayer(id: number): void {
        this.networkService.removeLayer(id);
    }

    updateNeurons(id: number, count: number): void {
        this.networkService.updateNeurons(id, count);
    }

    updateActivation(id: number, activation: ActivationType): void {
        this.networkService.updateActivation(id, activation);
    }

    randomizeWeights(): void {
        this.networkService.randomizeWeights();
    }

    // Global Actions
    setGlobalActivation(activation: ActivationType): void {
        this.networkService.setGlobalActivation(activation);
    }

    runVisualCycle(): void {
        this.networkService.visualizeCycle();
    }
}
