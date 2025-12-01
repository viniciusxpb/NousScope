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

    private ctx!: CanvasRenderingContext2D;
    private animationFrameId?: number;

    // Viewport state
    private readonly scale = signal(50);
    private readonly offsetX = signal(0);
    private readonly offsetY = signal(0);

    // Derived state for rendering
    private readonly layers = this.network.layers;
    private readonly showNetwork = this.network.showNetwork;

    // Re-render when network or view changes
    private readonly renderEffect = effect(() => {
        this.layers();
        this.showNetwork();
        this.scale();
        this.offsetX();
        this.offsetY();
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
    }

    private drawGrid(width: number, height: number): void {
        // TODO: Implement grid drawing
    }

    private drawAxis(width: number, height: number): void {
        // TODO: Implement axis drawing
    }

    private drawNetwork(width: number, height: number): void {
        // TODO: Implement network visualization
        // This requires calculating node positions
    }
}
