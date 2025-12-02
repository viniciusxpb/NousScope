import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { Formula, PlottedFormula } from '../../core/models/formula.model';
import { MathParserService } from './math-parser.service';

@Injectable({ providedIn: 'root' })
export class CompareService {
    private readonly parser = inject(MathParserService);
    private readonly STORAGE_KEY = 'NOUSSCOPE_COMPARE';

    private readonly _formulas = signal<Formula[]>(this.loadFromStorage());
    private nextId = 1;

    // Cores padrão para funções de comparação (tons mais frios/distintos)
    private readonly defaultColors = [
        '#a8d8ea',  // Azul claro
        '#aa96da',  // Roxo
        '#fcbad3',  // Rosa claro
        '#ffffd2',  // Creme
        '#95e1d3',  // Verde água
    ];

    public readonly formulas = this._formulas.asReadonly();

    constructor() {
        // Inicializar nextId
        const maxId = this._formulas().reduce((max, f) => {
            const match = f.id.match(/compare-(\d+)/);
            return match ? Math.max(max, parseInt(match[1], 10)) : max;
        }, 0);
        this.nextId = maxId + 1;

        // Persistência automática
        effect(() => {
            this.saveToStorage(this._formulas());
        });
    }

    private loadFromStorage(): Formula[] {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Erro ao carregar comparações', e);
            }
        }
        // Default se vazio
        return [];
    }

    private saveToStorage(formulas: Formula[]): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(formulas));
    }

    public readonly plottedFormulas = computed<PlottedFormula[]>(() => {
        return this._formulas()
            .filter(f => f.enabled && f.valid)
            .map(f => {
                const result = this.parser.parse(f.expression);
                return {
                    ...f,
                    fn: result.fn!,
                };
            })
            .filter(f => f.fn !== undefined);
    });

    addFormula(expression: string = ''): void {
        const id = `compare-${this.nextId++}`;
        const colorIndex = this._formulas().length % this.defaultColors.length;
        const parseResult = this.parser.parse(expression);

        const formula: Formula = {
            id,
            expression,
            color: this.defaultColors[colorIndex],
            enabled: true,
            locked: false,
            valid: parseResult.success,
            errorMessage: parseResult.error,
        };

        this._formulas.update(formulas => [...formulas, formula]);
    }

    removeFormula(id: string): void {
        const formula = this._formulas().find(f => f.id === id);
        if (formula?.locked) return;
        this._formulas.update(formulas => formulas.filter(f => f.id !== id));
    }

    updateExpression(id: string, expression: string): void {
        const formula = this._formulas().find(f => f.id === id);
        if (formula?.locked) return;

        const parseResult = this.parser.parse(expression);
        this._formulas.update(formulas =>
            formulas.map(f => f.id === id ? {
                ...f,
                expression,
                valid: parseResult.success,
                errorMessage: parseResult.error,
            } : f)
        );
    }

    updateColor(id: string, color: string): void {
        this._formulas.update(formulas =>
            formulas.map(f => f.id === id ? { ...f, color } : f)
        );
    }

    toggleEnabled(id: string): void {
        this._formulas.update(formulas =>
            formulas.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f)
        );
    }

    toggleLocked(id: string): void {
        this._formulas.update(formulas =>
            formulas.map(f => f.id === id ? { ...f, locked: !f.locked } : f)
        );
    }

    duplicateFormula(id: string): void {
        const formula = this._formulas().find(f => f.id === id);
        if (formula) {
            this.addFormula(formula.expression);
        }
    }

    moveUp(id: string): void {
        this._formulas.update(formulas => {
            const index = formulas.findIndex(f => f.id === id);
            if (index <= 0) return formulas;
            const newFormulas = [...formulas];
            [newFormulas[index - 1], newFormulas[index]] = [newFormulas[index], newFormulas[index - 1]];
            return newFormulas;
        });
    }

    moveDown(id: string): void {
        this._formulas.update(formulas => {
            const index = formulas.findIndex(f => f.id === id);
            if (index < 0 || index >= formulas.length - 1) return formulas;
            const newFormulas = [...formulas];
            [newFormulas[index], newFormulas[index + 1]] = [newFormulas[index + 1], newFormulas[index]];
            return newFormulas;
        });
    }

    clearAll(): void {
        this._formulas.update(formulas => formulas.filter(f => f.locked));
    }
}
