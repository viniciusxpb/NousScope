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
    styles: [`
        .graph-wrapper {
            position: relative;
            width: 100%;
            height: 100%;
        }
        
        app-canvas-renderer {
            width: 100%;
            height: 100%;
            display: block;
        }

        .controls {
            position: absolute;
            bottom: 10px;
            right: 10px;
            display: flex;
            gap: 5px;
            opacity: 0;
            transition: opacity 0.2s;
        }

        .graph-wrapper:hover .controls {
            opacity: 1;
        }

        button {
            background: rgba(255, 255, 255, 0.9);
            border: 1px solid #ccc;
            border-radius: 4px;
            padding: 4px 8px;
            cursor: pointer;
            font-size: 14px;
            
            &:hover {
                background: #fff;
                border-color: #999;
            }
        }
    `]
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
