import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NetworkService } from '../../core/services/network.service';
import { PlotService } from '../../core/services/plot.service';
import { CanvasConfigService } from '../../core/services/canvas-config.service';
import { FormulaService } from '../formula-plotter/services/formula.service';

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
    private readonly formulaService = inject(FormulaService);

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

    resetAll(): void {
        // Limpa TUDO: rede, fórmulas, visualização
        this.network.buildFromArch([1, 1]); // Rede mínima
        this.formulaService.clearAll(); // Limpa todas as fórmulas
        this.plot.resetView(); // Reseta visualização
    }

    toggleSettings(): void {
        this.showSettings.update(v => !v);
    }

    onThemePresetChange(preset: 'white' | 'black' | 'custom'): void {
        this.themePreset.set(preset);

        if (preset === 'white') {
            this.canvasConfig.setBackgroundColor('#ffffff');
            this.canvasConfig.setGridColor('#cccccc');
            // Também definir cores de texto/label escuros
            document.documentElement.style.setProperty('--color-axis', '#333333');
            document.documentElement.style.setProperty('--color-axisLabel', '#333333');
        } else if (preset === 'black') {
            this.canvasConfig.setBackgroundColor('#0f0f23');
            this.canvasConfig.setGridColor('#1a1a3e');
            // Cores claras para fundo escuro
            document.documentElement.style.setProperty('--color-axis', '#4a5568');
            document.documentElement.style.setProperty('--color-axisLabel', '#a0aec0');
        }
        // Se for 'custom', não faz nada - usuário usa os color pickers
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
        this.themePreset.set('custom'); // Auto-switch to custom
        this.canvasConfig.setBackgroundColor(color);
    }

    onGridColorChange(color: string): void {
        this.themePreset.set('custom'); // Auto-switch to custom
        this.canvasConfig.setGridColor(color);
    }
}
