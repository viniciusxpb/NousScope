import { Injectable, signal, effect } from '@angular/core';
import { inject } from '@angular/core';
import { ConfigService } from './config.service';

/**
 * Serviço para gerenciar configurações visuais do canvas.
 * Usa Signals para reatividade.
 */
@Injectable({ providedIn: 'root' })
interface CanvasConfig {
    themePreset?: 'white' | 'black' | 'custom';
    backgroundColor?: string;
    gridColor?: string;
    textColor?: string;
}

@Injectable({ providedIn: 'root' })
export class CanvasConfigService {
    private readonly config = inject(ConfigService);
    private readonly STORAGE_KEY = 'NOUSSCOPE_CANVAS_CONFIG';

    // Load saved config once
    private readonly savedConfig = this.loadFromStorage();

    // Canvas colors as signals (initialized from saved or default)
    public readonly backgroundColor = signal(this.savedConfig?.backgroundColor ?? this.config.theme.colors.canvasBg);
    public readonly gridColor = signal(this.savedConfig?.gridColor ?? this.config.theme.colors.grid);
    public readonly textColor = signal(this.savedConfig?.textColor ?? this.config.theme.colors.text);
    public readonly themePreset = signal<'white' | 'black' | 'custom'>(this.savedConfig?.themePreset ?? 'black');

    // Effect to apply theme and save config automatically
    private readonly _syncEffect = effect(() => {
        const preset = this.themePreset();
        const bg = this.backgroundColor();
        const grid = this.gridColor();
        const text = this.textColor();

        // Apply Theme
        if (preset === 'white') {
            document.documentElement.setAttribute('data-canvas-theme', 'white');
        } else if (preset === 'black') {
            document.documentElement.setAttribute('data-canvas-theme', 'black');
        } else {
            document.documentElement.removeAttribute('data-canvas-theme');
        }

        document.documentElement.style.setProperty('--color-canvasBg', bg);
        document.documentElement.style.setProperty('--color-grid', grid);

        // Sync with ConfigService (legacy support)
        this.config.theme.colors.canvasBg = bg;
        this.config.theme.colors.grid = grid;

        // Save to Storage
        const data: CanvasConfig = {
            themePreset: preset,
            backgroundColor: bg,
            gridColor: grid,
            textColor: text
        };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    });

    private loadFromStorage(): CanvasConfig | null {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
            try {
                return JSON.parse(saved) as CanvasConfig;
            } catch (e) {
                console.error('Erro ao carregar config do canvas', e);
            }
        }
        return null;
    }

    setThemePreset(preset: 'white' | 'black' | 'custom'): void {
        // Update signals, effect will handle the rest
        if (preset === 'white') {
            this.backgroundColor.set('#ffffff');
            this.gridColor.set('#cccccc');
            this.textColor.set('#333333');
        } else if (preset === 'black') {
            this.backgroundColor.set('#0f0f23');
            this.gridColor.set('#1a1a3e');
            this.textColor.set('#eeeeee');
        }
        this.themePreset.set(preset);
    }

    setBackgroundColor(color: string): void {
        this.backgroundColor.set(color);
        if (this.themePreset() !== 'custom') {
            this.themePreset.set('custom');
        }
    }

    setGridColor(color: string): void {
        this.gridColor.set(color);
        if (this.themePreset() !== 'custom') {
            this.themePreset.set('custom');
        }
    }

    setTextColor(color: string): void {
        this.textColor.set(color);
        if (this.themePreset() !== 'custom') {
            this.themePreset.set('custom');
        }
    }

    resetConfig(): void {
        localStorage.removeItem(this.STORAGE_KEY);
        this.setThemePreset('black');
    }
}
