export type ActivationType =
    | 'linear'
    | 'relu'
    | 'leaky_relu'
    | 'sigmoid'
    | 'tanh'
    | 'swish'
    | 'gelu'
    | 'gcu';

export type LayerType = 'input' | 'hidden' | 'output';

export interface Layer {
    readonly id: number;
    readonly type: LayerType;
    neurons: number;
    activation?: ActivationType;
    weights?: number[][];
    biases?: number[];
}

export interface LayerUpdateEvent {
    layerId: number;
    field: 'neurons' | 'activation' | 'weight' | 'bias';
    value: number | ActivationType;
    indices?: { neuron: number; weight?: number };
}
