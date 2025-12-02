import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NetworkService } from '../../core/services/network.service';
import { PlotService } from '../../core/services/plot.service';
import { CanvasConfigService } from '../../core/services/canvas-config.service';
import { FormulaService } from '../formula-plotter/services/formula.service';

@Component({
    selector: 'app-toolbar',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
    templateUrl: './toolbar.component.html',
    styleUrl: './toolbar.component.scss',
})
export class ToolbarComponent {
    private readonly network = inject(NetworkService);
    private readonly plot = inject(PlotService);
    private readonly canvasConfig = inject(CanvasConfigService);
    private readonly formulaService = inject(FormulaService);

    readonly showNetwork = this.network.showNetwork;
    readonly showSettings = signal(false);

    // Theme presets
    readonly themePreset = this.canvasConfig.themePreset;

    // Canvas colors from service
    readonly canvasBgColor = this.canvasConfig.backgroundColor;
    readonly gridColor = this.canvasConfig.gridColor;

    randomize(): void {
        this.network.randomizeWeights();
    }

    toggleNetwork(): void {
        this.network.toggleNetworkVisibility();
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

    resetAll(): void {
        // Limpa TUDO: rede, fórmulas, visualização E CONFIGURAÇÕES
        this.network.buildFromArch([1, 1]); // Rede mínima
        this.formulaService.clearAll(); // Limpa todas as fórmulas
        this.plot.resetView(); // Reseta visualização
        this.canvasConfig.resetConfig(); // Reseta configurações do canvas (tema)
    }

    toggleSettings(): void {
        this.showSettings.update(v => !v);
    }

    onThemePresetChange(preset: 'white' | 'black' | 'custom'): void {
        this.canvasConfig.setThemePreset(preset);
    }

    onThemeSelectChange(event: Event): void {
        const value = (event.target as HTMLSelectElement).value as 'white' | 'black' | 'custom';
        this.onThemePresetChange(value);
    }

    onBgColorInput(event: Event): void {
        const color = (event.target as HTMLInputElement).value;
        this.onCanvasBgChange(color);
    }

    onGridColorInput(event: Event): void {
        const color = (event.target as HTMLInputElement).value;
        this.onGridColorChange(color);
    }

    onCanvasBgChange(color: string): void {
        this.canvasConfig.setBackgroundColor(color);
    }

    onGridColorChange(color: string): void {
        this.canvasConfig.setGridColor(color);
    }
}
