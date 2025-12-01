import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PresetBase } from '../../../../core/models/preset.model';

@Component({
    selector: 'app-preset-description',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './preset-description.component.html',
    styleUrl: './preset-description.component.scss',
})
export class PresetDescriptionComponent {
    readonly preset = input.required<PresetBase>();
}
