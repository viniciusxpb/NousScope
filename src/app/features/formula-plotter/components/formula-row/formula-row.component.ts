import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Formula } from '../../../../core/models/formula.model';

@Component({
    selector: 'app-formula-row',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './formula-row.component.html',
    styleUrl: './formula-row.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormulaRowComponent {
    // Inputs
    public readonly formula = input.required<Formula>();
    public readonly index = input<number>(0);
    public readonly isFirst = input<boolean>(false);
    public readonly isLast = input<boolean>(false);

    // Outputs
    public readonly remove = output<void>();
    public readonly expressionChange = output<string>();
    public readonly colorChange = output<string>();
    public readonly toggleEnabled = output<void>();
    public readonly duplicate = output<void>();
    public readonly moveUp = output<void>();
    public readonly moveDown = output<void>();

    protected onExpressionInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.expressionChange.emit(input.value);
    }

    protected onColorInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.colorChange.emit(input.value);
    }
}
