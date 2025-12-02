import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CanvasRendererComponent, RendererConfig } from '../../../canvas/components/canvas-renderer/canvas-renderer';
import { Layer } from '../../../../core/models/layer.model';
import { PlottedFormula } from '../../../../core/models/formula.model';

@Component({
    selector: 'app-embedded-graph',
    standalone: true,
    imports: [CommonModule, CanvasRendererComponent],
    template: `
        <div class="graph-wrapper">
            <app-canvas-renderer
                [config]="config"
                [layers]="layers"
                [showNetwork]="showNetwork"
                [plottedFormulas]="plottedFormulas"
                [scale]="scale()"
                [offsetX]="offsetX()"
                [offsetY]="offsetY()"
                (zoom)="onZoom($event)"
                (pan)="onPan($event)">
            </app-canvas-renderer>
            
            <div class="controls">
                <button (click)="resetView()" title="Resetar Visualização">⟲</button>
            </div>
        </div>
    `,
    styleUrl: './embedded-graph.component.scss'
})
export class EmbeddedGraphComponent {
    @Input() config!: RendererConfig;
    @Input() layers: Layer[] = [];
    @Input() showNetwork = false;
    @Input() plottedFormulas: PlottedFormula[] = [];
    @Input() initialScale = 50;

    scale = signal(50);
    offsetX = signal(0);
    offsetY = signal(0);

    ngOnInit() {
        this.scale.set(this.initialScale);
    }

    onZoom(event: { factor: number; x: number; y: number }): void {
        const minScale = 10;
        const maxScale = 200;
        const currentScale = this.scale();
        const newScale = Math.max(minScale, Math.min(maxScale, currentScale * event.factor));

        if (newScale === currentScale) return;

        this.scale.set(newScale);
    }

    onPan(event: { dx: number; dy: number }): void {
        this.offsetX.update(x => x + event.dx);
        this.offsetY.update(y => y + event.dy);
    }

    resetView(): void {
        this.scale.set(this.initialScale);
        this.offsetX.set(0);
        this.offsetY.set(0);
    }
}
