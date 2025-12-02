import {
    Component,
    inject,
    effect,
    signal,
    computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NetworkService } from '../../core/services/network.service';
import { CanvasConfigService } from '../../core/services/canvas-config.service';
import { ConfigService } from '../../core/services/config.service';
import { FormulaService } from '../formula-plotter/services/formula.service';
import { CompareService } from '../../core/services/compare.service';
import { CanvasRendererComponent, RendererConfig } from './components/canvas-renderer/canvas-renderer';

@Component({
    selector: 'app-canvas',
    standalone: true,
    imports: [CommonModule, CanvasRendererComponent],
    templateUrl: './canvas.component.html',
    styleUrl: './canvas.component.scss'
})
export class CanvasComponent {
    public network = inject(NetworkService);
    public configService = inject(ConfigService);
    public canvasConfig = inject(CanvasConfigService);
    public formula = inject(FormulaService);
    public compare = inject(CompareService);

    // Viewport state
    public scale = signal(50); // Pixels per unit
    public offsetX = signal(0);
    public offsetY = signal(0);

    // Crop box state
    public showCropBox = signal(false);
    public cropBox = signal({ x: 0, y: 0, width: 0, height: 0 });
    public isDraggingCrop = signal(false);
    public dragStart = signal({ x: 0, y: 0 });

    public rendererConfig = computed<RendererConfig>(() => ({
        theme: {
            colors: {
                canvasBg: this.canvasConfig.backgroundColor(),
                grid: this.canvasConfig.gridColor(),
                axis: this.configService.theme.colors.axis,
                layerInput: this.configService.theme.colors.layerInput,
                layerHidden: this.configService.theme.colors.layerHidden,
                layerOutput: this.configService.theme.colors.layerOutput,
                panel: this.configService.theme.colors.panel,
                background: this.configService.theme.colors.background
            }
        },
        canvas: {
            lineWidth: {
                compare: this.configService.canvas.lineWidth.compare,
                network: this.configService.canvas.lineWidth.network
            },
            sampleDensity: this.configService.canvas.sampleDensity
        },
        textColor: this.canvasConfig.textColor()
    }));

    public networkOutputs = computed(() => {
        const networks = this.network.networks();
        const outputs: { fn: (x: number) => number, color: string }[] = [];
        
        for (const net of networks) {
            if (!net.visible) continue;
            outputs.push({
                fn: (x: number) => this.network.forward(x, net.layers),
                color: net.color
            });
        }
        return outputs;
    });



    onPan(event: { dx: number; dy: number }): void {
        this.offsetX.update(x => x + event.dx);
        this.offsetY.update(y => y + event.dy);
    }

    onZoom(event: { factor: number; x: number; y: number }): void {
        const { minScale, maxScale } = this.configService.canvas;
        const currentScale = this.scale();
        const newScale = Math.max(minScale, Math.min(maxScale, currentScale * event.factor));

        if (newScale === currentScale) return;

        // Simplified zoom to center for now, as we don't have element ref here easily
        // To do proper mouse-centered zoom, we'd need the renderer to pass more info
        // or handle it here. For now, let's keep it simple or use the event.x/y if possible.
        
        // The event.x/y are relative to the canvas element (from the renderer)
        // We need to know the canvas dimensions to find the center offset.
        // Since we don't have that, we'll just zoom to center (0,0) of the viewport for now
        // OR we can just update the scale and let the user pan.
        
        // Better approach:
        // We can assume the event.x/y are correct relative to the element.
        // But we don't know the element size here.
        
        // Let's just update scale for now.
        this.scale.set(newScale);
    }

    resetView(): void {
        this.scale.set(50);
        this.offsetX.set(0);
        this.offsetY.set(0);
    }

    // Crop box methods (placeholders)
    onCropBoxMouseDown(event: MouseEvent): void {}
    startCrop(event: MouseEvent): void {}
    updateCrop(event: MouseEvent): void {}
    endCrop(): void {}
    cancelCrop(): void {}
    applyCrop(): void {}
}
