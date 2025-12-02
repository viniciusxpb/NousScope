import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NetworkService } from '../../core/services/network.service';
import { PlotService } from '../../core/services/plot.service';
import { ConfigService } from '../../core/services/config.service';

@Component({
    selector: 'app-toolbar',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './toolbar.component.html',
    styleUrl: './toolbar.component.scss',
})
export class ToolbarComponent {
    private readonly network = inject(NetworkService);
    private readonly plot = inject(PlotService);
    private readonly config = inject(ConfigService);

    readonly showNetwork = this.network.showNetwork;
    readonly showSettings = signal(false);

    // Canvas colors
    canvasBgColor = signal(this.config.theme.colors.canvasBg);
    gridColor = signal(this.config.theme.colors.grid);

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

    toggleSettings(): void {
        this.showSettings.update(v => !v);
    }

    onCanvasBgChange(color: string): void {
        this.canvasBgColor.set(color);
        this.config.theme.colors.canvasBg = color;
        document.documentElement.style.setProperty('--color-canvasBg', color);
    }

    onGridColorChange(color: string): void {
        this.gridColor.set(color);
        this.config.theme.colors.grid = color;
        document.documentElement.style.setProperty('--color-grid', color);
    }
}
