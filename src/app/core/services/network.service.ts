import { Injectable, inject, signal, computed, linkedSignal } from '@angular/core';
import { ConfigService } from './config.service';
import { Layer, ActivationType, LayerType } from '../models/layer.model';
import { ACTIVATIONS } from '../constants/activations.constants';

/**
 * Gerencia o estado da rede neural.
 * Usa signals para reatividade completa.
 */
@Injectable({ providedIn: 'root' })
export class NetworkService {
    private readonly config = inject(ConfigService);

    private readonly _layers = signal<Layer[]>([
        { id: 0, type: 'input', neurons: 1 },
        { id: 1, type: 'output', neurons: 1, activation: 'linear' },
    ]);

    private readonly _showNetwork = signal(true);
    private nextId = 2;

    // Exposição pública readonly
    public readonly layers = this._layers.asReadonly();
    public readonly showNetwork = this._showNetwork.asReadonly();

    // LinkedSignal para layer selecionada (reseta quando layers mudam)
    public readonly selectedLayerId = linkedSignal({
        source: this._layers,
        computation: (layers) => layers.length > 1 ? layers[1].id : null
    });

    // Computed signals
    public readonly layerCount = computed(() => this._layers().length);

    public readonly architectureString = computed(() =>
        this._layers().map(l => l.neurons).join(' → ')
    );

    public readonly hiddenLayers = computed(() =>
        this._layers().filter(l => l.type === 'hidden')
    );

    public readonly totalNeurons = computed(() =>
        this._layers().reduce((sum, l) => sum + l.neurons, 0)
    );

    /**
     * Executa forward pass na rede neural.
     */
    forward(x: number): number {
        const layers = this._layers();
        let values = [x];

        for (let i = 1; i < layers.length; i++) {
            const layer = layers[i];
            const prevValues = values;
            const newValues: number[] = [];

            for (let n = 0; n < layer.neurons; n++) {
                let sum = layer.biases?.[n] ?? 0;

                for (let p = 0; p < prevValues.length; p++) {
                    sum += prevValues[p] * (layer.weights?.[n]?.[p] ?? 0);
                }

                const activation = layer.activation
                    ? ACTIVATIONS[layer.activation]
                    : (v: number) => v;

                newValues.push(activation(sum));
            }

            values = newValues;
        }

        return values[0] ?? 0;
    }

    /**
     * Adiciona camada oculta antes do output.
     */
    addHiddenLayer(): void {
        const { defaultHiddenNeurons, defaultActivation, maxLayers } = this.config.network;

        if (this._layers().length >= maxLayers) return;

        this._layers.update(layers => {
            const outputIndex = layers.length - 1;
            const prevNeurons = layers[outputIndex - 1].neurons;

            const newLayer: Layer = {
                id: this.nextId++,
                type: 'hidden',
                neurons: defaultHiddenNeurons,
                activation: defaultActivation,
                weights: this.initWeights(defaultHiddenNeurons, prevNeurons),
                biases: this.initBiases(defaultHiddenNeurons),
            };

            const newLayers = [...layers];
            newLayers.splice(outputIndex, 0, newLayer);

            // Reinicializar pesos do output
            newLayers[outputIndex + 1] = {
                ...newLayers[outputIndex + 1],
                weights: this.initWeights(
                    newLayers[outputIndex + 1].neurons,
                    defaultHiddenNeurons
                ),
            };

            return newLayers;
        });
    }

    /**
     * Remove camada por ID.
     */
    removeLayer(id: number): void {
        this._layers.update(layers => {
            const index = layers.findIndex(l => l.id === id);
            if (index <= 0 || index >= layers.length - 1) return layers;

            const newLayers = layers.filter(l => l.id !== id);

            // Reinicializar pesos da próxima camada
            const prevNeurons = newLayers[index - 1].neurons;
            newLayers[index] = {
                ...newLayers[index],
                weights: this.initWeights(newLayers[index].neurons, prevNeurons),
            };

            return newLayers;
        });
    }

    /**
     * Atualiza número de neurônios em uma camada.
     */
    updateNeurons(id: number, count: number): void {
        const { minNeurons, maxNeurons } = this.config.network;
        const clamped = Math.max(minNeurons, Math.min(maxNeurons, count));

        this._layers.update(layers => {
            const index = layers.findIndex(l => l.id === id);
            if (index < 0) return layers;

            const newLayers = [...layers];
            const prevNeurons = index > 0 ? newLayers[index - 1].neurons : 1;

            newLayers[index] = {
                ...newLayers[index],
                neurons: clamped,
                weights: this.initWeights(clamped, prevNeurons),
                biases: this.initBiases(clamped),
            };

            // Atualizar próxima camada se existir
            if (index < newLayers.length - 1) {
                newLayers[index + 1] = {
                    ...newLayers[index + 1],
                    weights: this.initWeights(newLayers[index + 1].neurons, clamped),
                };
            }

            return newLayers;
        });
    }

    /**
     * Atualiza função de ativação de uma camada.
     */
    updateActivation(id: number, activation: ActivationType): void {
        this._layers.update(layers =>
            layers.map(l => l.id === id ? { ...l, activation } : l)
        );
    }

    /**
     * Atualiza um peso específico.
     */
    updateWeight(layerId: number, neuronIdx: number, weightIdx: number, value: number): void {
        this._layers.update(layers =>
            layers.map(l => {
                if (l.id !== layerId || !l.weights) return l;

                const newWeights = l.weights.map((row, n) =>
                    n === neuronIdx
                        ? row.map((w, i) => i === weightIdx ? value : w)
                        : [...row]
                );

                return { ...l, weights: newWeights };
            })
        );
    }

    /**
     * Atualiza um bias específico.
     */
    updateBias(layerId: number, neuronIdx: number, value: number): void {
        this._layers.update(layers =>
            layers.map(l => {
                if (l.id !== layerId || !l.biases) return l;

                const newBiases = l.biases.map((b, i) =>
                    i === neuronIdx ? value : b
                );

                return { ...l, biases: newBiases };
            })
        );
    }

    /**
     * Randomiza todos os pesos e biases.
     */
    randomizeWeights(): void {
        this._layers.update(layers =>
            layers.map((l, i) => {
                if (i === 0) return l;

                const prevNeurons = layers[i - 1].neurons;
                return {
                    ...l,
                    weights: this.initWeights(l.neurons, prevNeurons),
                    biases: this.initBiases(l.neurons),
                };
            })
        );
    }

    /**
     * Constrói rede a partir de string de arquitetura (ex: "1-8-8-1").
     */
    buildFromArchString(archString: string): boolean {
        const parts = archString
            .split(/[-\s→]+/)
            .map(s => parseInt(s.trim(), 10))
            .filter(n => !isNaN(n) && n > 0);

        if (parts.length < 2) return false;

        this.buildFromArch(parts);
        return true;
    }

    /**
     * Constrói rede a partir de array de tamanhos.
     */
    buildFromArch(sizes: number[], activations?: ActivationType[]): void {
        const { defaultActivation, outputActivation, maxNeurons } = this.config.network;

        const layers: Layer[] = sizes.map((neurons, i) => {
            const clamped = Math.min(neurons, maxNeurons);
            const type: LayerType = i === 0 ? 'input' : i === sizes.length - 1 ? 'output' : 'hidden';
            const prevNeurons = i > 0 ? Math.min(sizes[i - 1], maxNeurons) : 1;

            const activation = i === 0
                ? undefined
                : activations?.[i - 1] ?? (type === 'output' ? outputActivation : defaultActivation);

            return {
                id: this.nextId++,
                type,
                neurons: clamped,
                activation,
                weights: i > 0 ? this.initWeights(clamped, prevNeurons) : undefined,
                biases: i > 0 ? this.initBiases(clamped) : undefined,
            };
        });

        this._layers.set(layers);
    }

    /**
     * Toggle visibilidade da rede.
     */
    toggleNetwork(): void {
        this._showNetwork.update(v => !v);
    }

    /**
     * Inicializa pesos usando He initialization.
     */
    private initWeights(neurons: number, prevNeurons: number): number[][] {
        const { weightScale } = this.config.network.initialization;
        const scale = Math.sqrt(weightScale / prevNeurons);

        return Array.from({ length: neurons }, () =>
            Array.from({ length: prevNeurons }, () => (Math.random() * 2 - 1) * scale)
        );
    }

    /**
     * Inicializa biases com valores pequenos.
     */
    private initBiases(neurons: number): number[] {
        const { biasMin, biasMax } = this.config.network.initialization;
        const range = biasMax - biasMin;

        return Array.from({ length: neurons }, () =>
            Math.random() * range + biasMin
        );
    }
}
