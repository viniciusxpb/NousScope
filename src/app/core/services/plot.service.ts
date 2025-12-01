import { Injectable, signal, inject } from '@angular/core';
import { ConfigService } from './config.service';

@Injectable({ providedIn: 'root' })
export class PlotService {
    private readonly config = inject(ConfigService);

    // Viewport state
    readonly scale = signal(50);
    readonly offsetX = signal(0);
    readonly offsetY = signal(0);

    resetView(): void {
        this.scale.set(this.config.canvas.defaultScale);
        this.offsetX.set(0);
        this.offsetY.set(0);
    }

    zoomIn(): void {
        this.zoom(this.config.canvas.zoomFactor);
    }

    zoomOut(): void {
        this.zoom(1 / this.config.canvas.zoomFactor);
    }

    private zoom(factor: number): void {
        const { minScale, maxScale } = this.config.canvas;
        this.scale.update(s => Math.max(minScale, Math.min(maxScale, s * factor)));
    }
}
