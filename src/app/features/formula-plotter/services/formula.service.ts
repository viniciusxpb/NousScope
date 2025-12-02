import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { Formula, PlottedFormula } from '../../../core/models/formula.model';
import { MathParserService } from '../../../core/services/math-parser.service';

/**
 * Gerencia as fórmulas matemáticas para plotagem.
 */
@Injectable({ providedIn: 'root' })
export class FormulaService {
    private readonly parser = inject(MathParserService);
    private readonly STORAGE_KEY = 'NOUSSCOPE_FORMULAS';

    private readonly _formulas = signal<Formula[]>(this.loadFromStorage());
    private nextId = this.initializeNextId();

    // Cores padrão para novas fórmulas (rotaciona)
    private readonly defaultColors = [
        '#ff6b6b',  // Vermelho
        '#4ecdc4',  // Teal
        '#ffe66d',  // Amarelo
        '#95e1d3',  // Verde água
        '#f38181',  // Rosa
        '#aa96da',  // Roxo
        '#fcbad3',  // Rosa claro
        '#a8d8ea',  // Azul claro
    ];

    public readonly formulas = this._formulas.asReadonly();

    // Salvar automaticamente quando houver mudanças
    private readonly _saveEffect = effect(() => {
        this.saveToStorage(this._formulas());
    });

    private initializeNextId(): number {
        return this._formulas().reduce((max, f) => {
            const match = f.id.match(/formula-(\d+)/);
            return match ? Math.max(max, parseInt(match[1], 10)) : max;
        }, 0) + 1;
    }

    /**
     * Carrega fórmulas do localStorage.
     */
    private loadFromStorage(): Formula[] {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Erro ao carregar fórmulas', e);
            }
        }
        return [];
    }

    /**
     * Salva fórmulas no localStorage.
     */
    private saveToStorage(formulas: Formula[]): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(formulas));
    }

    /**
     * Fórmulas válidas e habilitadas, prontas para plotagem.
     */
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

    /**
     * Quantidade de fórmulas.
     */
    public readonly formulaCount = computed(() => this._formulas().length);

    /**
     * Adiciona uma nova fórmula.
     */
    addFormula(expression: string = ''): void {
        const id = `formula-${this.nextId++}`;
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

    /**
     * Remove uma fórmula por ID.
     */
    removeFormula(id: string): void {
        const formula = this._formulas().find(f => f.id === id);
        if (formula?.locked) return; // Não remove se estiver travada

        this._formulas.update(formulas => formulas.filter(f => f.id !== id));
    }

    /**
     * Atualiza a expressão de uma fórmula.
     */
    updateExpression(id: string, expression: string): void {
        const formula = this._formulas().find(f => f.id === id);
        if (formula?.locked) return; // Não edita se estiver travada

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

    /**
     * Atualiza a cor de uma fórmula.
     */
    updateColor(id: string, color: string): void {
        this._formulas.update(formulas =>
            formulas.map(f => f.id === id ? { ...f, color } : f)
        );
    }

    /**
     * Toggle enabled de uma fórmula.
     */
    toggleEnabled(id: string): void {
        this._formulas.update(formulas =>
            formulas.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f)
        );
    }

    /**
     * Toggle locked de uma fórmula.
     */
    toggleLocked(id: string): void {
        this._formulas.update(formulas =>
            formulas.map(f => f.id === id ? { ...f, locked: !f.locked } : f)
        );
    }

    /**
     * Habilita/desabilita uma fórmula.
     */
    setEnabled(id: string, enabled: boolean): void {
        this._formulas.update(formulas =>
            formulas.map(f => f.id === id ? { ...f, enabled } : f)
        );
    }

    /**
     * Remove todas as fórmulas (exceto as travadas).
     */
    clearAll(): void {
        this._formulas.update(formulas => formulas.filter(f => f.locked));
    }

    /**
     * Adiciona fórmulas de exemplo.
     */
    addExamples(): void {
        const examples = [
            'sin(x)',
            'x^2',
            'cos(x) * x',
            'sqrt(abs(x))',
        ];

        for (const expr of examples) {
            this.addFormula(expr);
        }
    }

    /**
     * Duplica uma fórmula.
     */
    duplicateFormula(id: string): void {
        const formula = this._formulas().find(f => f.id === id);
        if (formula) {
            this.addFormula(formula.expression);
        }
    }

    /**
     * Move fórmula para cima na lista.
     */
    moveUp(id: string): void {
        this._formulas.update(formulas => {
            const index = formulas.findIndex(f => f.id === id);
            if (index <= 0) return formulas;

            const newFormulas = [...formulas];
            [newFormulas[index - 1], newFormulas[index]] = [newFormulas[index], newFormulas[index - 1]];
            return newFormulas;
        });
    }

    /**
     * Move fórmula para baixo na lista.
     */
    moveDown(id: string): void {
        this._formulas.update(formulas => {
            const index = formulas.findIndex(f => f.id === id);
            if (index < 0 || index >= formulas.length - 1) return formulas;

            const newFormulas = [...formulas];
            [newFormulas[index], newFormulas[index + 1]] = [newFormulas[index + 1], newFormulas[index]];
            return newFormulas;
        });
    }
}
