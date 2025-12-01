import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigService } from '../../core/services/config.service';
import { NetworkService } from '../../core/services/network.service';
import { PresetButtonComponent } from './components/preset-button/preset-button.component';
import { PresetDescriptionComponent } from './components/preset-description/preset-description.component';
import { PresetBase } from '../../core/models/preset.model';

@Component({
    selector: 'app-presets-panel',
    standalone: true,
    imports: [CommonModule, PresetButtonComponent, PresetDescriptionComponent],
    templateUrl: './presets-panel.component.html',
    styleUrl: './presets-panel.component.scss',
})
export class PresetsPanelComponent {
    private readonly config = inject(ConfigService);
    private readonly network = inject(NetworkService);

    // Expose presets
    readonly presets = this.config.presets;

    readonly selectedPreset = signal<PresetBase | null>(null);

    onPresetSelect(preset: PresetBase): void {
        this.selectedPreset.set(preset);
        this.network.buildFromArch(preset.arch, preset.activations);
    }
}
