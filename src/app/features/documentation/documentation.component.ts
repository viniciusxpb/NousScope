import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RendererConfig } from '../canvas/components/canvas-renderer/canvas-renderer';
import { EmbeddedGraphComponent } from './components/embedded-graph/embedded-graph.component';
import { Layer } from '../../core/models/layer.model';
import { PlottedFormula } from '../../core/models/formula.model';

@Component({
    selector: 'app-documentation',
    standalone: true,
    imports: [CommonModule, EmbeddedGraphComponent],
    templateUrl: './documentation.component.html',
    styleUrl: './documentation.component.scss'
})
export class DocumentationComponent {
    // Shared Config
    baseConfig: RendererConfig = {
        theme: {
            colors: {
                canvasBg: '#ffffff',
                grid: '#e0e0e0',
                axis: '#000000',
                layerInput: '#4CAF50',
                layerHidden: '#2196F3',
                layerOutput: '#F44336',
                panel: '#000000',
                background: '#ffffff'
            }
        },
        canvas: {
            lineWidth: {
                compare: 3,
                network: 2
            },
            sampleDensity: 1
        },
        textColor: '#000000'
    };

    // Figure 1: ReLU
    reluConfig = signal(this.baseConfig);
    reluFormulas = signal<PlottedFormula[]>([{
        id: 'relu',
        expression: 'max(0, x)',
        fn: (x: number) => Math.max(0, x),
        color: '#2196F3',
        enabled: true,
        locked: true,
        valid: true
    }]);

    // Figure 2: Layers (Network Visualization)
    layersConfig = signal(this.baseConfig);
    layersData = signal<Layer[]>([
        { id: 0, type: 'input', neurons: 2, activation: 'linear' },
        { id: 1, type: 'hidden', neurons: 3, activation: 'relu', weights: [[0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]], biases: [0, 0, 0] },
        { id: 2, type: 'output', neurons: 1, activation: 'linear', weights: [[1, 1, 1]], biases: [0] }
    ]);

    // Figure 3: GCU
    gcuConfig = signal(this.baseConfig);
    gcuFormulas = signal<PlottedFormula[]>([{
        id: 'gcu',
        expression: 'x * cos(x)',
        fn: (x: number) => x * Math.cos(x),
        color: '#F44336',
        enabled: true,
        locked: true,
        valid: true
    }]);

    // Figure 3c: Swish
    swishConfig = signal(this.baseConfig);
    swishFormulas = signal<PlottedFormula[]>([{
        id: 'swish',
        expression: 'x * sigmoid(x)',
        fn: (x: number) => x * (1 / (1 + Math.exp(-x))),
        color: '#9C27B0',
        enabled: true,
        locked: true,
        valid: true
    }]);

    // Figure 3b: Derivative
    derivativeConfig = signal(this.baseConfig);
    derivativeFormulas = signal<PlottedFormula[]>([{
        id: 'gcu-deriv',
        expression: 'cos(x) - x * sin(x)',
        fn: (x: number) => Math.cos(x) - x * Math.sin(x),
        color: '#FF9800',
        enabled: true,
        locked: true,
        valid: true
    }]);

    // Figure 4: Comparison
    comparisonConfig = signal(this.baseConfig);
    comparisonFormulas = signal<PlottedFormula[]>([
        {
            id: 'relu-comp',
            expression: 'max(0, x)',
            fn: (x: number) => Math.max(0, x),
            color: '#2196F3',
            enabled: true,
            locked: true,
            valid: true
        },
        {
            id: 'gcu-comp',
            expression: 'x * cos(x)',
            fn: (x: number) => x * Math.cos(x),
            color: '#F44336',
            enabled: true,
            locked: true,
            valid: true
        }
    ]);
}
