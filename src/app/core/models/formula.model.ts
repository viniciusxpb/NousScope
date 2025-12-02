import { ActivationType } from './layer.model';

export interface Formula {
    readonly id: string;
    expression: string;
    color: string;
    enabled: boolean;
    locked: boolean;
    valid: boolean;
    errorMessage?: string;
}

export interface FormulaParseResult {
    success: boolean;
    fn?: (x: number) => number;
    error?: string;
}

export interface PlottedFormula extends Formula {
    fn: (x: number) => number;
}
