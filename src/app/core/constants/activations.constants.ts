import { ActivationType } from '../models/layer.model';

/**
 * Funções de ativação disponíveis.
 * Todas são funções puras sem side effects.
 */
export const ACTIVATIONS: Readonly<Record<ActivationType, (x: number) => number>> = {
    linear: (x) => x,
    relu: (x) => Math.max(0, x),
    leaky_relu: (x) => x > 0 ? x : 0.01 * x,
    sigmoid: (x) => 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x)))),
    tanh: (x) => Math.tanh(x),
    swish: (x) => x / (1 + Math.exp(-x)),
    gelu: (x) => 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * x ** 3))),
    gcu: (x) => x * Math.cos(x),
};

export const ACTIVATION_LABELS: Readonly<Record<ActivationType, string>> = {
    linear: 'Linear',
    relu: 'ReLU',
    leaky_relu: 'Leaky ReLU',
    sigmoid: 'Sigmoid',
    tanh: 'Tanh',
    swish: 'Swish',
    gelu: 'GELU',
    gcu: 'GCU (x·cos(x))',
};

export const ACTIVATION_OPTIONS: readonly { value: ActivationType; label: string }[] =
    Object.entries(ACTIVATION_LABELS).map(([value, label]) => ({
        value: value as ActivationType,
        label,
    }));
