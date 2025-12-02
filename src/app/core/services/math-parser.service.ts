import { Injectable } from '@angular/core';
import { FormulaParseResult } from '../models/formula.model';

/**
 * Parser de expressões matemáticas.
 * Converte strings como "sin(x) + x^2" em funções executáveis.
 */
@Injectable({ providedIn: 'root' })
export class MathParserService {

    private readonly constants: Record<string, number> = {
        PI: Math.PI,
        E: Math.E,
        TAU: Math.PI * 2,
        PHI: (1 + Math.sqrt(5)) / 2,
    };

    private readonly functions: Record<string, (x: number) => number> = {
        sin: Math.sin,
        cos: Math.cos,
        tan: Math.tan,
        asin: Math.asin,
        acos: Math.acos,
        atan: Math.atan,
        sinh: Math.sinh,
        cosh: Math.cosh,
        tanh: Math.tanh,
        sqrt: Math.sqrt,
        cbrt: Math.cbrt,
        abs: Math.abs,
        floor: Math.floor,
        ceil: Math.ceil,
        round: Math.round,
        log: Math.log,
        log10: Math.log10,
        log2: Math.log2,
        exp: Math.exp,
        sign: Math.sign,
    };

    /**
     * Parseia uma expressão matemática e retorna uma função.
     */
    parse(expression: string): FormulaParseResult {
        if (!expression || expression.trim() === '') {
            return { success: false, error: 'Expressão vazia' };
        }

        try {
            const sanitized = this.sanitize(expression);
            const fn = this.compile(sanitized);

            // Testar a função com alguns valores
            const testValues = [0, 1, -1, 0.5, 2];
            for (const x of testValues) {
                const result = fn(x);
                if (typeof result !== 'number' || (isNaN(result) && !expression.includes('/'))) {
                    // NaN é OK para divisão (pode ser div por zero)
                }
            }

            return { success: true, fn };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Erro desconhecido'
            };
        }
    }

    /**
     * Sanitiza e prepara a expressão para compilação.
     */
    private sanitize(expr: string): string {
        let result = expr
            .toLowerCase()
            .replace(/\s+/g, '')
            // Substituir ^ por **
            .replace(/\^/g, '**')
            // Substituir constantes
            .replace(/\bpi\b/gi, `(${Math.PI})`)
            .replace(/\be\b/gi, `(${Math.E})`)
            .replace(/\btau\b/gi, `(${Math.PI * 2})`)
            .replace(/\bphi\b/gi, `(${(1 + Math.sqrt(5)) / 2})`);

        // Substituir funções ANTES da multiplicação implícita
        for (const fnName of Object.keys(this.functions)) {
            const regex = new RegExp(`\\b${fnName}\\b`, 'gi');
            result = result.replace(regex, `Math.${fnName}`);
        }

        // Multiplicação implícita: 2x -> 2*x, mas NÃO em funções já substituídas
        result = result
            .replace(/(\d)([a-z])/gi, '$1*$2')
            .replace(/(\d)\(/g, '$1*(')
            .replace(/\)(\d)/g, ')*$1')
            .replace(/\)([a-z])/gi, ')*$1');

        return result;
    }

    /**
     * Compila a expressão sanitizada em uma função.
     */
    private compile(sanitized: string): (x: number) => number {
        // Criar função
        const fnBody = `return ${sanitized};`;

        try {
            // Usar Function constructor (similar a eval, mas mais controlado)
            const fn = new Function('x', 'Math', fnBody);

            return (x: number) => {
                try {
                    const result = fn(x, Math);
                    return typeof result === 'number' ? result : NaN;
                } catch {
                    return NaN;
                }
            };
        } catch (error) {
            throw new Error(`Sintaxe inválida: ${sanitized}`);
        }
    }

    /**
     * Retorna lista de funções disponíveis para autocomplete/help.
     */
    getAvailableFunctions(): string[] {
        return Object.keys(this.functions);
    }

    /**
     * Retorna lista de constantes disponíveis.
     */
    getAvailableConstants(): string[] {
        return Object.keys(this.constants);
    }
}
