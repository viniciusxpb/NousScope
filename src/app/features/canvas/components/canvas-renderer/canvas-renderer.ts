import {
    Component,
    ElementRef,
    ViewChild,
    AfterViewInit,
    Input,
    OnChanges,
    SimpleChanges,
    OnDestroy,
    output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Layer } from '../../../../core/models/layer.model';
import { PlottedFormula } from '../../../../core/models/formula.model';
import { CanvasInteractionDirective } from '../../directives/canvas-interaction.directive';

export interface RendererConfig {
    theme: {
        colors: {
            canvasBg: string;
            grid: string;
            axis: string;
            layerInput: string;
            layerHidden: string;
            layerOutput: string;
            panel: string;
            background: string;
        }
    };
    canvas: {
        lineWidth: {
            compare: number;
            network: number;
        };
        sampleDensity: number;
    };
    textColor: string;
}

@Component({
    selector: 'app-canvas-renderer',
    standalone: true,
    imports: [CommonModule, CanvasInteractionDirective],
    templateUrl: './canvas-renderer.html',
    styleUrl: './canvas-renderer.scss',
})
export class CanvasRendererComponent implements AfterViewInit, OnChanges, OnDestroy {
    @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

    @Input() layers: Layer[] = [];
    @Input() showNetwork = true;
    @Input() plottedFormulas: PlottedFormula[] = [];
    @Input() plottedCompareFormulas: PlottedFormula[] = [];
    @Input() networkOutputs: { fn: (x: number) => number, color: string }[] = [];
    @Input() config!: RendererConfig;
    
    // Viewport state
    @Input() scale = 50;
    @Input() offsetX = 0;
    @Input() offsetY = 0;

    // Events
    public readonly pan = output<{ dx: number; dy: number }>();
    public readonly zoom = output<{ factor: number; x: number; y: number }>();

    private ctx!: CanvasRenderingContext2D;
    private animationFrameId?: number;

    ngAfterViewInit(): void {
        const canvas = this.canvasRef.nativeElement;
        this.ctx = canvas.getContext('2d')!;
        this.resizeCanvas();
        window.addEventListener('resize', this.resizeCanvas.bind(this));
        this.requestRender();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.ctx) {
            this.requestRender();
        }
    }

    ngOnDestroy(): void {
        window.removeEventListener('resize', this.resizeCanvas.bind(this));
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }

    onPan(event: { dx: number; dy: number }): void {
        this.pan.emit(event);
    }

    onZoom(event: { factor: number; x: number; y: number }): void {
        this.zoom.emit(event);
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
        if (!this.ctx || !this.config) return;

        try {
            const width = this.ctx.canvas.width;
            const height = this.ctx.canvas.height;

            // Clear
            this.ctx.fillStyle = this.config.theme.colors.canvasBg;
            this.ctx.fillRect(0, 0, width, height);

            // Draw Grid
            this.drawGrid(width, height);

            // Draw Network if enabled
            if (this.showNetwork) {
                this.drawNetwork(width, height);
            }

            // Draw Axis
            this.drawAxis(width, height);

            // Draw Formulas
            this.drawFormulas(width, height);

            // Draw Network Outputs
            this.drawNetworkOutputs(width, height);

            // Draw Compare Function
            this.drawCompare(width, height);
        } catch (error) {
            console.error('Error rendering canvas:', error);
        }
    }

    private drawGrid(width: number, height: number): void {
        const ctx = this.ctx;
        const scale = this.scale;
        const offsetX = this.offsetX;
        const offsetY = this.offsetY;
        const centerX = width / 2 + offsetX;
        const centerY = height / 2 + offsetY;

        ctx.strokeStyle = this.config.theme.colors.grid;
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 4]);

        // Calculate visible range in math coordinates
        const minX = this.screenToMathX(0);
        const maxX = this.screenToMathX(width);
        const minY = this.screenToMathY(height); // Y is inverted
        const maxY = this.screenToMathY(0);

        // Determine step size based on scale
        const step = this.getStepSize(scale);

        // Snap start to step
        const startX = Math.floor(minX / step) * step;
        const startY = Math.floor(minY / step) * step;

        // Vertical lines
        for (let x = startX; x <= maxX; x += step) {
            const screenX = x * scale + centerX;
            ctx.beginPath();
            ctx.moveTo(screenX, 0);
            ctx.lineTo(screenX, height);
            ctx.stroke();
        }

        // Horizontal lines
        for (let y = startY; y <= maxY; y += step) {
            const screenY = centerY - y * scale;
            ctx.beginPath();
            ctx.moveTo(0, screenY);
            ctx.lineTo(width, screenY);
            ctx.stroke();
        }

        ctx.setLineDash([]);
    }

    private drawAxis(width: number, height: number): void {
        const ctx = this.ctx;
        const offsetX = this.offsetX;
        const offsetY = this.offsetY;

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
        
        // Draw labels
        this.drawAxisLabels(width, height, centerX, centerY);
    }

    private drawAxisLabels(width: number, height: number, centerX: number, centerY: number): void {
        const ctx = this.ctx;
        const scale = this.scale;
        
        ctx.fillStyle = this.config.theme.colors.axis;
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        // Calculate visible range
        const minX = this.screenToMathX(0);
        const maxX = this.screenToMathX(width);
        const minY = this.screenToMathY(height);
        const maxY = this.screenToMathY(0);

        const step = this.getStepSize(scale);

        // X Axis Labels
        const startX = Math.floor(minX / step) * step;
        for (let x = startX; x <= maxX; x += step) {
            if (Math.abs(x) < step / 10) continue; // Skip 0 (origin)
            
            const screenX = x * scale + centerX;
            // Draw tick
            ctx.beginPath();
            ctx.moveTo(screenX, centerY - 5);
            ctx.lineTo(screenX, centerY + 5);
            ctx.stroke();

            // Draw label
            ctx.fillText(x.toString(), screenX, centerY + 8);
        }

        // Y Axis Labels
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        const startY = Math.floor(minY / step) * step;
        for (let y = startY; y <= maxY; y += step) {
            if (Math.abs(y) < step / 10) continue; // Skip 0
            
            const screenY = centerY - y * scale;
            
            // Draw tick
            ctx.beginPath();
            ctx.moveTo(centerX - 5, screenY);
            ctx.lineTo(centerX + 5, screenY);
            ctx.stroke();

            // Draw label
            ctx.fillText(y.toString(), centerX - 8, screenY);
        }
        
        // Draw Origin (0,0)
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText('0', centerX - 5, centerY + 5);
    }

    private getStepSize(scale: number): number {
        // Target about 50-100 pixels per step
        const targetPixels = 50;
        const rawStep = targetPixels / scale;
        
        // Find nearest nice step (1, 2, 5, 10, etc.)
        const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
        const normalizedStep = rawStep / magnitude;
        
        let step;
        if (normalizedStep < 1.5) step = 1;
        else if (normalizedStep < 3.5) step = 2;
        else if (normalizedStep < 7.5) step = 5;
        else step = 10;
        
        return step * magnitude;
    }

    private screenToMathY(sy: number): number {
        const centerY = this.ctx.canvas.height / 2 + this.offsetY;
        return (centerY - sy) / this.scale;
    }

    private drawNetwork(width: number, height: number): void {
        const ctx = this.ctx;
        const layers = this.layers;

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

            const x1 = startX + i * layerSpacing + this.offsetX;
            const x2 = startX + (i + 1) * layerSpacing + this.offsetX;

            for (let n1 = 0; n1 < currentLayer.neurons; n1++) {
                const y1 = this.getNodeY(n1, currentLayer.neurons, centerY) + this.offsetY;

                for (let n2 = 0; n2 < nextLayer.neurons; n2++) {
                    const y2 = this.getNodeY(n2, nextLayer.neurons, centerY) + this.offsetY;

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
            const x = startX + i * layerSpacing + this.offsetX;

            // Determine layer color
            const color = i === 0
                ? this.config.theme.colors.layerInput
                : i === layers.length - 1
                    ? this.config.theme.colors.layerOutput
                    : this.config.theme.colors.layerHidden;

            for (let n = 0; n < layer.neurons; n++) {
                const y = this.getNodeY(n, layer.neurons, centerY) + this.offsetY;

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
            const y = this.getNodeY(layer.neurons - 1, layer.neurons, centerY) + this.offsetY + 30;
            ctx.fillStyle = this.config.textColor;
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
        for (const formula of this.plottedFormulas) {
            this.drawFunction(
                formula.fn,
                formula.color,
                this.config.canvas.lineWidth.compare
            );
        }
    }

    private drawNetworkOutputs(width: number, height: number): void {
        for (const output of this.networkOutputs) {
            this.drawFunction(
                output.fn,
                output.color,
                this.config.canvas.lineWidth.network
            );
        }
    }

    private drawCompare(width: number, height: number): void {
        const ctx = this.ctx;
        const density = this.config.canvas.sampleDensity;

        ctx.setLineDash([5, 5]); // Dashed line for comparison
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 2;

        for (const formula of this.plottedCompareFormulas) {
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
        return (sx - centerX - this.offsetX) / this.scale;
    }

    private mathToScreenY(y: number): number {
        const centerY = this.ctx.canvas.height / 2;
        return centerY - y * this.scale + this.offsetY;
    }
}
