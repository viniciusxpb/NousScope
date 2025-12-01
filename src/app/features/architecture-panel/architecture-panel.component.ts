import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NetworkService } from '../../core/services/network.service';
import { LayerCardComponent } from './components/layer-card/layer-card.component';
import { QuickAddComponent } from './components/quick-add/quick-add.component';

@Component({
    selector: 'app-architecture-panel',
    standalone: true,
    imports: [CommonModule, LayerCardComponent, QuickAddComponent],
    templateUrl: './architecture-panel.component.html',
    styleUrl: './architecture-panel.component.scss',
})
export class ArchitecturePanelComponent {
    private readonly network = inject(NetworkService);

    readonly layers = this.network.layers;
    readonly architectureString = this.network.architectureString;
    readonly totalNeurons = this.network.totalNeurons;

    onAddLayer(): void {
        this.network.addHiddenLayer();
    }
}
