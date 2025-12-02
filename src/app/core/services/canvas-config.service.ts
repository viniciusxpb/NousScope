import { Injectable, signal } from '@angular/core';
import { inject } from '@angular/core';
import { ConfigService } from './config.service';

/**
 * Serviço para gerenciar configurações visuais do canvas.
 * Usa Signals para reatividade.
 */
@Injectable({ providedIn: 'root' })
export class CanvasConfigService {
    private readonly config = inject(ConfigService);

    // Canvas colors as signals
    public readonly backgroundColor = signal(this.config.theme.colors.canvasBg);
    public readonly gridColor = signal(this.config.theme.colors.grid);

    /**
     * Atualiza a cor de fundo do canvas.
     */
    setBackgroundColor(color: string): void {
        this.backgroundColor.set(color);
        this.config.theme.colors.canvasBg = color;
        document.documentElement.style.setProperty('--color-canvasBg', color);
    }

    /**
     * Atualiza a cor das grades.
     */
    setGridColor(color: string): void {
        this.gridColor.set(color);
        this.config.theme.colors.grid = color;
        document.documentElement.style.setProperty('--color-grid', color);
    }
}
