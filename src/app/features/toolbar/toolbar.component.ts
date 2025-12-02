import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NetworkService } from '../../core/services/network.service';
import { PlotService } from '../../core/services/plot.service';
import { CanvasConfigService } from '../../core/services/canvas-config.service';

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
    private readonly canvasConfig = inject(CanvasConfigService);

    readonly showNetwork = this.network.showNetwork;
    readonly showSettings = signal(false);

    // Theme presets
    readonly themePreset = signal<'white' | 'black' | 'custom'>('black');

    // Canvas colors from service
    readonly canvasBgColor = this.canvasConfig.backgroundColor;
    readonly gridColor = this.canvasConfig.gridColor;

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

    onThemePresetChange(preset: 'white' | 'black' | 'custom'): void {
        this.themePreset.set(preset);

        if (preset === 'white') {
            this.canvasConfig.setBackgroundColor('#ffffff');
            this.canvasConfig.setGridColor('#e0e0e0');
        } else if (preset === 'black') {
            this.canvasConfig.setBackgroundColor('#0f0f23');
            this.canvasConfig.setGridColor('#1a1a3e');
        }
        // Se for 'custom', não faz nada - usuário usa os color pickers
    }

    onCanvasBgChange(color: string): void {
        this.themePreset.set('custom'); // Auto-switch to custom
        this.canvasConfig.setBackgroundColor(color);
    }

    onGridColorChange(color: string): void {
        this.themePreset.set('custom'); // Auto-switch to custom
        this.canvasConfig.setGridColor(color);
    }
}
