import { Injectable, inject, signal, computed } from '@angular/core';
import { Formula, PlottedFormula } from '../../../core/models/formula.model';
import { MathParserService } from '../../../core/services/math-parser.service';

/**
 * Gerencia as fórmulas matemáticas para plotagem.
 */
@Injectable({ providedIn: 'root' })
export class FormulaService {
    private readonly parser = inject(MathParserService);

    private readonly _formulas = signal<Formula[]>([]);
    private nextId = 1;

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
            valid: parseResult.success,
            errorMessage: parseResult.error,
        };

        this._formulas.update(formulas => [...formulas, formula]);
    }

    /**
     * Remove uma fórmula por ID.
     */
    removeFormula(id: string): void {
        this._formulas.update(formulas => formulas.filter(f => f.id !== id));
    }

    /**
     * Atualiza a expressão de uma fórmula.
     */
    updateExpression(id: string, expression: string): void {
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
     * Habilita/desabilita uma fórmula.
     */
    setEnabled(id: string, enabled: boolean): void {
        this._formulas.update(formulas =>
            formulas.map(f => f.id === id ? { ...f, enabled } : f)
        );
    }

    /**
     * Remove todas as fórmulas.
     */
    clearAll(): void {
        this._formulas.set([]);
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
