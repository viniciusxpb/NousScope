import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NetworkService } from '../../core/services/network.service';
import { PlotService } from '../../core/services/plot.service';

@Component({
    selector: 'app-toolbar',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './toolbar.component.html',
    styleUrl: './toolbar.component.scss',
})
export class ToolbarComponent {
    private readonly network = inject(NetworkService);
    private readonly plot = inject(PlotService);

    readonly showNetwork = this.network.showNetwork;

    randomize(): void {
        this.network.randomizeWeights();
    }

    toggleNetwork(): void {
        this.network.toggleNetwork();
    }

    resetView(): void {
        this.plot.resetView();
    }

    zoomIn(): void {
        this.plot.zoomIn();
    }

    zoomOut(): void {
        this.plot.zoomOut();
    }
}
