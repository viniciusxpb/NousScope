import {
    Component,
    ElementRef,
    ViewChild,
    AfterViewInit,
    effect,
    inject,
    signal,
    computed,
    OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigService } from '../../core/services/config.service';
import { NetworkService } from '../../core/services/network.service';
import { FormulaService } from '../formula-plotter/services/formula.service';
import { CanvasConfigService } from '../../core/services/canvas-config.service';
import { PrintService } from '../../core/services/print.service';
import { CompareService } from '../../core/services/compare.service';
import { CanvasInteractionDirective } from './directives/canvas-interaction.directive';

@Component({
    selector: 'app-canvas',
    standalone: true,
    imports: [CommonModule, CanvasInteractionDirective],
    templateUrl: './canvas.component.html',
    styleUrl: './canvas.component.scss',
})
export class CanvasComponent implements AfterViewInit, OnDestroy {
    @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

    private readonly config = inject(ConfigService);
    private readonly network = inject(NetworkService);
    private readonly formulaService = inject(FormulaService);
    private readonly canvasConfig = inject(CanvasConfigService);
    private readonly printService = inject(PrintService);
    private readonly compareService = inject(CompareService);

    private ctx!: CanvasRenderingContext2D;
    private animationFrameId?: number;

    // Viewport state (public for display in template)
    readonly scale = signal(50);
    readonly offsetX = signal(0);
    readonly offsetY = signal(0);

    // Crop box for export (from PrintService)
    readonly showCropBox = this.printService.showCropBox;
    readonly cropBox = this.printService.cropBox;

    // Derived state for rendering
    private readonly layers = this.network.layers;
    private readonly showNetwork = this.network.showNetwork;
    private readonly plottedFormulas = this.formulaService.plottedFormulas;
    private readonly plottedCompareFormulas = this.compareService.plottedFormulas;

    // Re-render when network or view changes
    private readonly renderEffect = effect(() => {
        // Dependencies that trigger re-render
        this.layers();
        this.showNetwork();
        this.plottedFormulas();
        this.plottedCompareFormulas();
        this.scale();
        this.offsetX();
        this.offsetY();
        this.canvasConfig.themePreset();
        this.canvasConfig.backgroundColor();
        this.canvasConfig.gridColor();
        this.canvasConfig.textColor();
        this.requestRender();
    });

    ngAfterViewInit(): void {
        const canvas = this.canvasRef.nativeElement;
        this.ctx = canvas.getContext('2d')!;
        this.resizeCanvas();
        window.addEventListener('resize', this.resizeCanvas.bind(this));
        this.requestRender();
    }

    ngOnDestroy(): void {
        window.removeEventListener('resize', this.resizeCanvas.bind(this));
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }

    onPan(event: { dx: number; dy: number }): void {
        this.offsetX.update(x => x + event.dx);
        this.offsetY.update(y => y + event.dy);
    }

    onZoom(event: { factor: number; x: number; y: number }): void {
        const { minScale, maxScale } = this.config.canvas;

        this.scale.update(s => {
            const newScale = Math.max(minScale, Math.min(maxScale, s * event.factor));
            // Adjust offset to zoom towards mouse pointer
            // This is a simplified zoom, can be improved
            return newScale;
        });
    }

    onCropBoxMouseDown(event: MouseEvent): void {
        // Implementação básica - apenas drag do box inteiro por enquanto
        event.stopPropagation();
        const startX = event.clientX;
        const startY = event.clientY;
        const box = this.cropBox();
        const startBoxX = box.x;
        const startBoxY = box.y;

        const onMouseMove = (e: MouseEvent) => {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            this.printService.updateCropBox({
                x: startBoxX + dx,
                y: startBoxY + dy
            });
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    private resizeCanvas(): void {
        const canvas = this.canvasRef.nativeElement;
        const parent = canvas.parentElement!;
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        this.requestRender();
    }

    private requestRender(): void {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        this.animationFrameId = requestAnimationFrame(this.render.bind(this));
    }

    private render(): void {
        if (!this.ctx) return;

        try {
            const width = this.ctx.canvas.width;
            const height = this.ctx.canvas.height;

            // Clear
            this.ctx.fillStyle = this.config.theme.colors.canvasBg;
            this.ctx.fillRect(0, 0, width, height);

            // Draw Grid
            this.drawGrid(width, height);

            // Draw Network if enabled
            if (this.showNetwork()) {
                this.drawNetwork(width, height);
            }

            // Draw Axis
            this.drawAxis(width, height);

            // Draw Formulas
            this.drawFormulas(width, height);

            // Draw Compare Function
            this.drawCompare(width, height);
        } catch (error) {
            console.error('Error rendering canvas:', error);
        }
    }

    private drawGrid(width: number, height: number): void {
        const ctx = this.ctx;
        const scale = this.scale();
        const offsetX = this.offsetX();
        const offsetY = this.offsetY();

        ctx.strokeStyle = this.config.theme.colors.grid;
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 4]);

        const step = 50; // Grid step in pixels
        const startX = Math.floor(-offsetX / step) * step;
        const startY = Math.floor(-offsetY / step) * step;

        // Vertical lines
        for (let x = startX; x < width; x += step) {
            const screenX = x + offsetX;
            if (screenX >= 0 && screenX <= width) {
                ctx.beginPath();
                ctx.moveTo(screenX, 0);
                ctx.lineTo(screenX, height);
                ctx.stroke();
            }
        }

        // Horizontal lines
        for (let y = startY; y < height; y += step) {
            const screenY = y + offsetY;
            if (screenY >= 0 && screenY <= height) {
                ctx.beginPath();
                ctx.moveTo(0, screenY);
                ctx.lineTo(width, screenY);
                ctx.stroke();
            }
        }

        ctx.setLineDash([]);
    }

    private drawAxis(width: number, height: number): void {
        const ctx = this.ctx;
        const offsetX = this.offsetX();
        const offsetY = this.offsetY();

        const centerX = width / 2 + offsetX;
        const centerY = height / 2 + offsetY;

        ctx.strokeStyle = this.config.theme.colors.axis;
        ctx.lineWidth = 2;

        // X axis
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
        ctx.stroke();

        // Y axis
        ctx.beginPath();
        ctx.moveTo(centerX, 0);
        ctx.lineTo(centerX, height);
        ctx.stroke();

        // Draw arrow heads
        const arrowSize = 10;

        // X axis arrow
        ctx.beginPath();
        ctx.moveTo(width - arrowSize, centerY - arrowSize / 2);
        ctx.lineTo(width, centerY);
        ctx.lineTo(width - arrowSize, centerY + arrowSize / 2);
        ctx.stroke();

        // Y axis arrow
        ctx.beginPath();
        ctx.moveTo(centerX - arrowSize / 2, arrowSize);
        ctx.lineTo(centerX, 0);
        ctx.lineTo(centerX + arrowSize / 2, arrowSize);
        ctx.stroke();
    }

    private drawNetwork(width: number, height: number): void {
        const ctx = this.ctx;
        const layers = this.layers();

        if (layers.length === 0) return;

        const centerX = width / 2;
        const centerY = height / 2;

        // Calculate layout
        const layerSpacing = 150;
        const totalWidth = (layers.length - 1) * layerSpacing;
        const startX = centerX - totalWidth / 2;

        // Draw connections first (behind nodes)
        for (let i = 0; i < layers.length - 1; i++) {
            const currentLayer = layers[i];
            const nextLayer = layers[i + 1];

            const x1 = startX + i * layerSpacing + this.offsetX();
            const x2 = startX + (i + 1) * layerSpacing + this.offsetX();

            for (let n1 = 0; n1 < currentLayer.neurons; n1++) {
                const y1 = this.getNodeY(n1, currentLayer.neurons, centerY) + this.offsetY();

                for (let n2 = 0; n2 < nextLayer.neurons; n2++) {
                    const y2 = this.getNodeY(n2, nextLayer.neurons, centerY) + this.offsetY();

                    // Get weight value (skip if weights undefined)
                    if (!nextLayer.weights) continue;
                    const weight = nextLayer.weights[n2][n1];
                    const alpha = Math.min(Math.abs(weight), 1);
                    const color = weight > 0
                        ? `rgba(0, 217, 255, ${alpha * 0.6})`
                        : `rgba(255, 107, 107, ${alpha * 0.6})`;

                    ctx.strokeStyle = color;
                    ctx.lineWidth = Math.abs(weight) * 2 + 0.5;
                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.stroke();
                }
            }
        }

        // Draw nodes
        for (let i = 0; i < layers.length; i++) {
            const layer = layers[i];
            const x = startX + i * layerSpacing + this.offsetX();

            // Determine layer color
            const color = i === 0
                ? this.config.theme.colors.layerInput
                : i === layers.length - 1
                    ? this.config.theme.colors.layerOutput
                    : this.config.theme.colors.layerHidden;

            for (let n = 0; n < layer.neurons; n++) {
                const y = this.getNodeY(n, layer.neurons, centerY) + this.offsetY();

                // Draw node circle
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(x, y, 12, 0, Math.PI * 2);
                ctx.fill();

                // Draw border
                ctx.strokeStyle = this.config.theme.colors.panel;
                ctx.lineWidth = 2;
                ctx.stroke();

                // Draw bias value inside if not input layer
                if (i > 0 && layer.biases) {
                    ctx.fillStyle = this.config.theme.colors.background;
                    ctx.font = '10px monospace';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    const biasText = layer.biases[n].toFixed(1);
                    ctx.fillText(biasText, x, y);
                }
            }

            // Draw layer label
            const y = this.getNodeY(layer.neurons - 1, layer.neurons, centerY) + this.offsetY() + 30;
            ctx.fillStyle = this.canvasConfig.textColor();
            ctx.font = '12px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(
                i === 0 ? 'Input' : i === layers.length - 1 ? 'Output' : `Hidden ${i}`,
                x,
                y
            );
            ctx.fillText(`(${layer.neurons})`, x, y + 15);
        }
    }

    private getNodeY(nodeIndex: number, totalNodes: number, centerY: number): number {
        const nodeSpacing = 60;
        const totalHeight = (totalNodes - 1) * nodeSpacing;
        const startY = centerY - totalHeight / 2;
        return startY + nodeIndex * nodeSpacing;
    }

    private drawFormulas(width: number, height: number): void {
        const formulas = this.plottedFormulas();

        for (const formula of formulas) {
            this.drawFunction(
                formula.fn,
                formula.color,
                this.config.canvas.lineWidth.compare
            );
        }
    }

    private drawCompare(width: number, height: number): void {
        const formulas = this.plottedCompareFormulas();
        
        const ctx = this.ctx;
        const density = this.config.canvas.sampleDensity;

        ctx.setLineDash([5, 5]); // Dashed line for comparison
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 2;

        for (const formula of formulas) {
            ctx.strokeStyle = formula.color;
            ctx.beginPath();

            let started = false;

            for (let sx = 0; sx <= width; sx += density) {
                const x = this.screenToMathX(sx);
                const y = formula.fn(x);

                if (!isFinite(y)) {
                    started = false;
                    continue;
                }

                const sy = this.mathToScreenY(y);

                // Pular pontos muito fora da tela
                if (sy < -1000 || sy > height + 1000) {
                    started = false;
                    continue;
                }

                if (!started) {
                    ctx.moveTo(sx, sy);
                    started = true;
                } else {
                    ctx.lineTo(sx, sy);
                }
            }
            ctx.stroke();
        }

        ctx.setLineDash([]); // Reset dash
    }

    private drawFunction(
        fn: (x: number) => number,
        color: string,
        lineWidth: number
    ): void {
        const ctx = this.ctx;
        const { width, height } = ctx.canvas;
        const density = this.config.canvas.sampleDensity;

        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();

        let started = false;

        for (let sx = 0; sx <= width; sx += density) {
            const x = this.screenToMathX(sx);
            const y = fn(x);

            if (!isFinite(y)) {
                started = false;
                continue;
            }

            const sy = this.mathToScreenY(y);

            // Pular pontos muito fora da tela
            if (sy < -1000 || sy > height + 1000) {
                started = false;
                continue;
            }

            if (!started) {
                ctx.moveTo(sx, sy);
                started = true;
            } else {
                ctx.lineTo(sx, sy);
            }
        }

        ctx.stroke();
    }

    private screenToMathX(sx: number): number {
        const centerX = this.ctx.canvas.width / 2;
        return (sx - centerX - this.offsetX()) / this.scale();
    }

    private mathToScreenY(y: number): number {
        const centerY = this.ctx.canvas.height / 2;
        return centerY - y * this.scale() + this.offsetY();
    }
}
