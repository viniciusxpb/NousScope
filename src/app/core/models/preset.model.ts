import { ActivationType } from './layer.model';

export interface PresetBase {
    id: string;
    title: string;
    description?: string;
    arch: number[];
    activations: ActivationType[];
}

export interface BasicPreset extends PresetBase { }

export interface ClassicPreset extends PresetBase {
    year: string;
    diagram: string;
    funFact: string;
}

export interface SaltoPreset extends PresetBase {
    formula: string;
    danger?: string;
    insight?: string;
}

export interface XcosPreset extends PresetBase { }
