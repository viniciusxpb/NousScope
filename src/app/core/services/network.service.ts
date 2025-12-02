import { Injectable, inject, signal, computed, linkedSignal, effect } from '@angular/core';
import { ConfigService } from './config.service';
import { Layer, ActivationType, LayerType } from '../models/layer.model';
import { Network } from '../models/network.model';
import { ACTIVATIONS } from '../constants/activations.constants';

/**
 * Gerencia o estado das redes neurais.
 * Suporta múltiplas redes e seleção de função de ativação.
 */
@Injectable({ providedIn: 'root' })
export class NetworkService {
    private readonly config = inject(ConfigService);
    private readonly STORAGE_KEY = 'NOUSSCOPE_NETWORKS';

    // State
    private readonly _networks = signal<Network[]>([]);
    private readonly _activeNetworkId = signal<string>('');
    private nextNetworkId = 1;
    private nextLayerId = 100; // Start higher to avoid conflicts

    // Animation State
    private readonly _isAnimating = signal(false);
    private readonly _animationStep = signal(0); // 0: input, 1: hidden1, etc.

    // Exposição pública
    public readonly networks = this._networks.asReadonly();
    public readonly activeNetworkId = this._activeNetworkId.asReadonly();
    public readonly isAnimating = this._isAnimating.asReadonly();
    public readonly animationStep = this._animationStep.asReadonly();

    // Computed: Rede Ativa
    public readonly activeNetwork = computed(() => 
        this._networks().find(n => n.id === this._activeNetworkId())
    );

    // Computed: Layers da Rede Ativa (para compatibilidade e facilidade)
    public readonly layers = computed(() => 
        this.activeNetwork()?.layers || []
    );

    public readonly showNetwork = computed(() => 
        this.activeNetwork()?.visible ?? true
    );

    // Computed: Estatísticas
    public readonly layerCount = computed(() => this.layers().length);
    public readonly architectureString = computed(() =>
        this.layers().map(l => l.neurons).join(' → ')
    );
    public readonly hiddenLayers = computed(() =>
        this.layers().filter(l => l.type === 'hidden')
    );
    public readonly totalNeurons = computed(() =>
        this.layers().reduce((sum, l) => sum + l.neurons, 0)
    );

    // LinkedSignal para layer selecionada
    public readonly selectedLayerId = linkedSignal({
        source: this.layers,
        computation: (layers) => layers.length > 1 ? layers[1].id : null
    });

    // Initialization
    private readonly _init = this.initializeService();

    // Auto-save
    private readonly _saveEffect = effect(() => {
        this.saveToStorage();
    });

    private initializeService(): void {
        this.loadFromStorage();

        // Se não houver redes, criar padrão
        if (this._networks().length === 0) {
            this.addNetwork('Default Network');
        }
    }

    // --- Network Management ---

    addNetwork(name?: string): void {
        const id = `net-${this.nextNetworkId++}`;
        const finalName = name || `Network ${this.nextNetworkId - 1}`;
        
        const defaultLayers = this.createDefaultLayers();

        const newNetwork: Network = {
            id,
            name: finalName,
            layers: defaultLayers,
            color: this.getRandomColor(),
            visible: true
        };

        this._networks.update(nets => [...nets, newNetwork]);
        this.setActiveNetwork(id);
    }

    removeNetwork(id: string): void {
        if (this._networks().length <= 1) return; // Não remover a última

        this._networks.update(nets => nets.filter(n => n.id !== id));
        
        if (this._activeNetworkId() === id) {
            this.setActiveNetwork(this._networks()[0].id);
        }
    }

    setActiveNetwork(id: string): void {
        if (this._networks().some(n => n.id === id)) {
            this._activeNetworkId.set(id);
        }
    }

    toggleNetworkVisibility(): void {
        const id = this._activeNetworkId();
        this._networks.update(nets => 
            nets.map(n => n.id === id ? { ...n, visible: !n.visible } : n)
        );
    }

    // --- Layer Management (Operates on Active Network) ---

    addHiddenLayer(): void {
        const netId = this._activeNetworkId();
        const network = this.activeNetwork();
        if (!network) return;

        const { defaultHiddenNeurons, defaultActivation, maxLayers } = this.config.network;
        if (network.layers.length >= maxLayers) return;

        this.updateActiveNetworkLayers(layers => {
            const outputIndex = layers.length - 1;
            const prevNeurons = layers[outputIndex - 1].neurons;

            const newLayer: Layer = {
                id: this.nextLayerId++,
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

    removeLayer(layerId: number): void {
        this.updateActiveNetworkLayers(layers => {
            const index = layers.findIndex(l => l.id === layerId);
            if (index <= 0 || index >= layers.length - 1) return layers;

            const newLayers = layers.filter(l => l.id !== layerId);

            // Reinicializar pesos da próxima camada
            const prevNeurons = newLayers[index - 1].neurons;
            newLayers[index] = {
                ...newLayers[index],
                weights: this.initWeights(newLayers[index].neurons, prevNeurons),
            };

            return newLayers;
        });
    }

    updateNeurons(layerId: number, count: number): void {
        const { minNeurons, maxNeurons } = this.config.network;
        const clamped = Math.max(minNeurons, Math.min(maxNeurons, count));

        this.updateActiveNetworkLayers(layers => {
            const index = layers.findIndex(l => l.id === layerId);
            if (index < 0) return layers;

            const newLayers = [...layers];
            const prevNeurons = index > 0 ? newLayers[index - 1].neurons : 1;

            newLayers[index] = {
                ...newLayers[index],
                neurons: clamped,
                weights: this.initWeights(clamped, prevNeurons),
                biases: this.initBiases(clamped),
            };

            if (index < newLayers.length - 1) {
                newLayers[index + 1] = {
                    ...newLayers[index + 1],
                    weights: this.initWeights(newLayers[index + 1].neurons, clamped),
                };
            }

            return newLayers;
        });
    }

    public buildFromArch(sizes: number[], activations?: ActivationType[]): void {
        const { defaultActivation, outputActivation, maxNeurons } = this.config.network;

        const layers: Layer[] = sizes.map((neurons, i) => {
            const clamped = Math.min(neurons, maxNeurons);
            const type: LayerType = i === 0 ? 'input' : i === sizes.length - 1 ? 'output' : 'hidden';
            const prevNeurons = i > 0 ? Math.min(sizes[i - 1], maxNeurons) : 1;

            const activation = i === 0
                ? undefined
                : activations?.[i - 1] ?? (type === 'output' ? outputActivation : defaultActivation);

            return {
                id: this.nextLayerId++,
                type,
                neurons: clamped,
                activation,
                weights: i > 0 ? this.initWeights(clamped, prevNeurons) : undefined,
                biases: i > 0 ? this.initBiases(clamped) : undefined,
            };
        });

        this.updateActiveNetworkLayers(() => layers);
    }

    updateActivation(layerId: number, activation: ActivationType): void {
        this.updateActiveNetworkLayers(layers =>
            layers.map(l => l.id === layerId ? { ...l, activation } : l)
        );
    }

    setGlobalActivation(activation: ActivationType): void {
        this.updateActiveNetworkLayers(layers =>
            layers.map(l => l.type === 'hidden' ? { ...l, activation } : l)
        );
    }

    updateWeight(layerId: number, neuronIdx: number, weightIdx: number, value: number): void {
        this.updateActiveNetworkLayers(layers =>
            layers.map(l => {
                if (l.id !== layerId || !l.weights) return l;
                const newWeights = l.weights.map((row, n) =>
                    n === neuronIdx ? row.map((w, i) => i === weightIdx ? value : w) : [...row]
                );
                return { ...l, weights: newWeights };
            })
        );
    }

    updateBias(layerId: number, neuronIdx: number, value: number): void {
        this.updateActiveNetworkLayers(layers =>
            layers.map(l => {
                if (l.id !== layerId || !l.biases) return l;
                const newBiases = l.biases.map((b, i) => i === neuronIdx ? value : b);
                return { ...l, biases: newBiases };
            })
        );
    }

    randomizeWeights(): void {
        this.updateActiveNetworkLayers(layers =>
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

    // --- Visual Cycle ---

    async visualizeCycle(): Promise<void> {
        if (this._isAnimating()) return;

        this._isAnimating.set(true);
        const layers = this.layers();
        
        // Reset
        this._animationStep.set(0);

        // Animate through layers
        for (let i = 0; i < layers.length; i++) {
            this._animationStep.set(i);
            await new Promise(resolve => setTimeout(resolve, 500)); // 500ms per layer
        }

        // Finish
        await new Promise(resolve => setTimeout(resolve, 500));
        this._isAnimating.set(false);
        this._animationStep.set(0);
    }

    // --- Forward Pass ---

    forward(x: number): number {
        const layers = this.layers();
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
                const activation = layer.activation ? ACTIVATIONS[layer.activation] : (v: number) => v;
                newValues.push(activation(sum));
            }
            values = newValues;
        }
        return values[0] ?? 0;
    }

    // --- Helpers ---

    private updateActiveNetworkLayers(updater: (layers: Layer[]) => Layer[]): void {
        const id = this._activeNetworkId();
        this._networks.update(nets => 
            nets.map(n => n.id === id ? { ...n, layers: updater(n.layers) } : n)
        );
    }

    private createDefaultLayers(): Layer[] {
        return [
            { id: this.nextLayerId++, type: 'input', neurons: 1 },
            { id: this.nextLayerId++, type: 'output', neurons: 1, activation: 'linear' },
        ];
    }

    private initWeights(neurons: number, prevNeurons: number): number[][] {
        const { weightScale } = this.config.network.initialization;
        const scale = Math.sqrt(weightScale / prevNeurons);
        return Array.from({ length: neurons }, () =>
            Array.from({ length: prevNeurons }, () => (Math.random() * 2 - 1) * scale)
        );
    }

    private initBiases(neurons: number): number[] {
        const { biasMin, biasMax } = this.config.network.initialization;
        const range = biasMax - biasMin;
        return Array.from({ length: neurons }, () => Math.random() * range + biasMin);
    }

    private getRandomColor(): string {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9B59B6'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // --- Persistence ---

    private loadFromStorage(): void {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
            try {
                const networks = JSON.parse(saved);
                this._networks.set(networks);
                if (networks.length > 0) {
                    this._activeNetworkId.set(networks[0].id);
                    // Update ID counters to avoid collisions
                    this.nextNetworkId = networks.reduce((max: number, n: Network) => {
                        const idNum = parseInt(n.id.split('-')[1] || '0');
                        return Math.max(max, idNum);
                    }, 0) + 1;
                    // Simplified layer ID recovery (could be better)
                    this.nextLayerId = 1000; 
                }
            } catch (e) {
                console.error('Error loading networks', e);
            }
        }
    }

    private saveToStorage(): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this._networks()));
    }
}
