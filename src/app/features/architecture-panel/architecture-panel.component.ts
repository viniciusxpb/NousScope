import { Component, inject, effect } from '@angular/core';
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
    readonly isAnimating = this.networkService.isAnimating;
    
    readonly activationOptions = Object.keys(ACTIVATIONS) as ActivationType[];

    // Local state for expanded cards
    expandedNetworks = new Set<string>();

    private readonly _expandEffect = effect(() => {
        const nets = this.networks();
        if (nets.length > 0 && this.expandedNetworks.size === 0) {
            this.expandedNetworks.add(nets[0].id);
        }
    });

    toggleExpand(id: string): void {
        if (this.expandedNetworks.has(id)) {
            this.expandedNetworks.delete(id);
        } else {
            this.expandedNetworks.add(id);
        }
    }

    isExpanded(id: string): boolean {
        return this.expandedNetworks.has(id);
    }

    // Network Management
    addNetwork(): void {
        this.networkService.addNetwork();
    }

    removeNetwork(id: string): void {
        this.networkService.removeNetwork(id);
    }

    toggleVisibility(id: string): void {
        this.networkService.toggleNetworkVisibility(id);
    }

    // Layer Management
    addHiddenLayer(networkId: string): void {
        this.networkService.addHiddenLayer(networkId);
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

    randomizeWeights(networkId: string): void {
        this.networkService.randomizeWeights(networkId);
    }

    // Global Actions (Per Network)
    setGlobalActivation(activation: ActivationType, networkId: string): void {
        this.networkService.setGlobalActivation(activation, networkId);
    }

    runVisualCycle(networkId: string): void {
        this.networkService.visualizeCycle(networkId);
    }
}
