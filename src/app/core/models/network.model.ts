import { Layer } from './layer.model';

export interface Network {
    id: string;
    name: string;
    layers: Layer[];
    color: string;
    visible: boolean;
}
