import { Component, OnInit, inject, signal, HostListener } from '@angular/core';
import { ConfigService } from './core/services/config.service';
import { CanvasComponent } from './features/canvas/canvas.component';
import { PresetsPanelComponent } from './features/presets-panel/presets-panel.component';
import { ArchitecturePanelComponent } from './features/architecture-panel/architecture-panel.component';
import { ComparePanelComponent } from './features/compare-panel/compare-panel.component';
import { ToolbarComponent } from './features/toolbar/toolbar.component';
import { FormulaPLotterComponent } from './features/formula-plotter/formula-plotter.component';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        CanvasComponent,
        PresetsPanelComponent,
        ArchitecturePanelComponent,
        ComparePanelComponent,
        ToolbarComponent,
        FormulaPLotterComponent,
    ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
    private readonly config = inject(ConfigService);

    protected readonly activeTab = signal<'architecture' | 'formulas' | 'compare'>('architecture');
    protected readonly rightPanelWidth = signal<number>(320);
    private isResizing = false;
    private startX = 0;
    private startWidth = 0;

    ngOnInit(): void {
        this.injectCssVariables();
    }

    protected setActiveTab(tab: 'architecture' | 'formulas' | 'compare'): void {
        this.activeTab.set(tab);
    }

    protected onResizeStart(event: MouseEvent): void {
        event.preventDefault();
        this.isResizing = true;
        this.startX = event.clientX;
        this.startWidth = this.rightPanelWidth();
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    }

    @HostListener('document:mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        if (!this.isResizing) return;

        const deltaX = this.startX - event.clientX;
        const newWidth = Math.max(250, Math.min(600, this.startWidth + deltaX));
        this.rightPanelWidth.set(newWidth);
    }

    @HostListener('document:mouseup')
    onMouseUp(): void {
        if (this.isResizing) {
            this.isResizing = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }
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
