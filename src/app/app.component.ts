import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfigService } from './core/services/config.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
    private readonly config = inject(ConfigService);

    ngOnInit(): void {
        this.injectCssVariables();
    }

    private injectCssVariables(): void {
        const root = document.documentElement;
        // Wait for config to be loaded if it's not already, though APP_INITIALIZER should handle it.
        // However, APP_INITIALIZER ensures load() promise resolves.

        if (!this.config.isLoaded()) return; // Should not happen with APP_INITIALIZER

        const { colors, fonts, borderRadius, spacing, shadows } = this.config.theme;

        // Cores
        Object.entries(colors).forEach(([key, value]) => {
            root.style.setProperty(`--color-${this.toKebab(key)}`, value);
        });

        // Fonts
        root.style.setProperty('--font-primary', fonts.primary);
        root.style.setProperty('--font-mono', fonts.mono);

        // Border radius
        Object.entries(borderRadius).forEach(([key, value]) => {
            root.style.setProperty(`--radius-${key}`, value);
        });

        // Spacing
        Object.entries(spacing).forEach(([key, value]) => {
            root.style.setProperty(`--space-${key}`, value);
        });

        // Shadows
        Object.entries(shadows).forEach(([key, value]) => {
            root.style.setProperty(`--shadow-${key}`, value);
        });
    }

    private toKebab(str: string): string {
        return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    }
}
