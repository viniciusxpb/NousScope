import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompareService } from '../../core/services/compare.service';
import { FormulaRowComponent } from '../formula-plotter/components/formula-row/formula-row.component';

@Component({
    selector: 'app-compare-panel',
    standalone: true,
    imports: [CommonModule, FormsModule, FormulaRowComponent],
    templateUrl: './compare-panel.component.html',
    styleUrl: './compare-panel.component.scss',
})
export class ComparePanelComponent {
    private readonly compareService = inject(CompareService);

    readonly formulas = this.compareService.formulas;

    addFormula(): void {
        this.compareService.addFormula();
    }

    onRemove(id: string): void {
        this.compareService.removeFormula(id);
    }

    onExpressionChange(id: string, expression: string): void {
        this.compareService.updateExpression(id, expression);
    }

    onColorChange(id: string, color: string): void {
        this.compareService.updateColor(id, color);
    }

    onToggleEnabled(id: string): void {
        this.compareService.toggleEnabled(id);
    }

    onToggleLocked(id: string): void {
        this.compareService.toggleLocked(id);
    }

    onDuplicate(id: string): void {
        this.compareService.duplicateFormula(id);
    }

    onMoveUp(id: string): void {
        this.compareService.moveUp(id);
    }

    onMoveDown(id: string): void {
        this.compareService.moveDown(id);
    }

    clearAll(): void {
        this.compareService.clearAll();
    }
}
