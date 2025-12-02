import { Injectable, signal, computed, inject } from '@angular/core';
import { MathParserService } from './math-parser.service';
import { ConfigService } from './config.service';

@Injectable({ providedIn: 'root' })
export class CompareService {
    private readonly parser = inject(MathParserService);
    private readonly config = inject(ConfigService);

    // State
    readonly compareFunc = signal<string>(this.config.ui.defaultCompareFunc);
    readonly compareColor = signal<string>(this.config.ui.defaultCompareColor);
    readonly showCompare = signal<boolean>(true);

    // Computed
    readonly parsedFunction = computed(() => {
        if (!this.showCompare() || !this.compareFunc()) return null;
        
        const result = this.parser.parse(this.compareFunc());
        return result.success ? result.fn : null;
    });

    updateFunc(func: string): void {
        this.compareFunc.set(func);
    }

    updateColor(color: string): void {
        this.compareColor.set(color);
    }

    toggleCompare(): void {
        this.showCompare.update(v => !v);
    }
}
