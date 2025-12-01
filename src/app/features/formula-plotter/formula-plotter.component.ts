import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormulaService } from './services/formula.service';
import { MathParserService } from '../../core/services/math-parser.service';
import { FormulaRowComponent } from './components/formula-row/formula-row.component';
import { ConfigService } from '../../core/services/config.service';

@Component({
    selector: 'app-formula-plotter',
    standalone: true,
    imports: [FormulaRowComponent],
    templateUrl: './formula-plotter.component.html',
    styleUrl: './formula-plotter.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormulaPLotterComponent {
    protected readonly formulaService = inject(FormulaService);
    protected readonly parser = inject(MathParserService);
    protected readonly config = inject(ConfigService);

    protected readonly formulas = this.formulaService.formulas;
    protected readonly formulaCount = this.formulaService.formulaCount;

    protected addFormula(): void {
        this.formulaService.addFormula('');
    }

    protected addExamples(): void {
        this.formulaService.addExamples();
    }

    protected clearAll(): void {
        this.formulaService.clearAll();
    }

    protected onRemove(id: string): void {
        this.formulaService.removeFormula(id);
    }

    protected onExpressionChange(id: string, expression: string): void {
        this.formulaService.updateExpression(id, expression);
    }

    protected onColorChange(id: string, color: string): void {
        this.formulaService.updateColor(id, color);
    }

    protected onToggleEnabled(id: string): void {
        this.formulaService.toggleEnabled(id);
    }

    protected onDuplicate(id: string): void {
        this.formulaService.duplicateFormula(id);
    }

    protected onMoveUp(id: string): void {
        this.formulaService.moveUp(id);
    }

    protected onMoveDown(id: string): void {
        this.formulaService.moveDown(id);
    }
}
