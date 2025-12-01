import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PresetBase } from '../../../../core/models/preset.model';

@Component({
    selector: 'app-preset-button',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './preset-button.component.html',
    styleUrl: './preset-button.component.scss',
})
export class PresetButtonComponent {
    readonly preset = input.required<PresetBase>();
    readonly select = output<PresetBase>();
}
