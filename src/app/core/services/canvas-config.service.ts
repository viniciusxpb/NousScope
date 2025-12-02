import { Injectable, signal } from '@angular/core';
import { inject } from '@angular/core';
import { ConfigService } from './config.service';

/**
 * Serviço para gerenciar configurações visuais do canvas.
 * Usa Signals para reatividade.
 */
@Injectable({ providedIn: 'root' })
export class CanvasConfigService {
    private readonly config = inject(ConfigService);
    private readonly STORAGE_KEY = 'NOUSSCOPE_CANVAS_CONFIG';

    // Canvas colors as signals
    public readonly backgroundColor = signal(this.config.theme.colors.canvasBg);
    public readonly gridColor = signal(this.config.theme.colors.grid);
    public readonly textColor = signal(this.config.theme.colors.text);
    public readonly themePreset = signal<'white' | 'black' | 'custom'>('black');

    constructor() {
        this.loadFromStorage();
    }

    /**
     * Carrega configurações salvas.
     */
    private loadFromStorage(): void {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
            try {
                const data = JSON.parse(saved);
                if (data.themePreset) this.themePreset.set(data.themePreset);
                if (data.backgroundColor) this.backgroundColor.set(data.backgroundColor);
                if (data.gridColor) this.gridColor.set(data.gridColor);
                if (data.textColor) this.textColor.set(data.textColor);

                // Aplicar tema visualmente
                this.applyTheme(this.themePreset(), this.backgroundColor(), this.gridColor());
            } catch (e) {
                console.error('Erro ao carregar config do canvas', e);
            }
        }
    }

    /**
     * Salva configurações atuais.
     */
    private saveToStorage(): void {
        const data = {
            themePreset: this.themePreset(),
            backgroundColor: this.backgroundColor(),
            gridColor: this.gridColor(),
            textColor: this.textColor()
        };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    }

    /**
     * Define o preset de tema e aplica as cores correspondentes.
     */
    setThemePreset(preset: 'white' | 'black' | 'custom'): void {
        this.themePreset.set(preset);

        if (preset === 'white') {
            this.setBackgroundColor('#ffffff', false);
            this.setGridColor('#cccccc', false);
            this.setTextColor('#333333', false);
        } else if (preset === 'black') {
            this.setBackgroundColor('#0f0f23', false);
            this.setGridColor('#1a1a3e', false);
            this.setTextColor('#eeeeee', false);
        }

        this.applyTheme(preset, this.backgroundColor(), this.gridColor());
        this.saveToStorage();
    }

    /**
     * Aplica as variáveis CSS e atributos baseados no tema.
     */
    private applyTheme(preset: string, bg: string, grid: string): void {
        if (preset === 'white') {
            document.documentElement.setAttribute('data-canvas-theme', 'white');
        } else if (preset === 'black') {
            document.documentElement.setAttribute('data-canvas-theme', 'black');
        } else {
            document.documentElement.removeAttribute('data-canvas-theme');
        }

        document.documentElement.style.setProperty('--color-canvasBg', bg);
        document.documentElement.style.setProperty('--color-grid', grid);
    }

    /**
     * Atualiza a cor de fundo do canvas.
     */
    setBackgroundColor(color: string, save = true): void {
        this.backgroundColor.set(color);
        this.config.theme.colors.canvasBg = color;

        if (this.themePreset() === 'custom') {
            this.applyTheme('custom', color, this.gridColor());
        }

        if (save) {
            if (this.themePreset() !== 'custom') {
                this.themePreset.set('custom');
                this.applyTheme('custom', color, this.gridColor());
            }
            this.saveToStorage();
        }
    }

    /**
     * Atualiza a cor das grades.
     */
    setGridColor(color: string, save = true): void {
        this.gridColor.set(color);
        this.config.theme.colors.grid = color;

        if (this.themePreset() === 'custom') {
            this.applyTheme('custom', this.backgroundColor(), color);
        }

        if (save) {
            if (this.themePreset() !== 'custom') {
                this.themePreset.set('custom');
                this.applyTheme('custom', this.backgroundColor(), color);
            }
            this.saveToStorage();
        }
    }

    /**
     * Atualiza a cor do texto no canvas.
     */
    setTextColor(color: string, save = true): void {
        this.textColor.set(color);

        if (save) {
            if (this.themePreset() !== 'custom') {
                this.themePreset.set('custom');
            }
            this.saveToStorage();
        }
    }

    /**
     * Reseta as configurações para o padrão.
     */
    resetConfig(): void {
        localStorage.removeItem(this.STORAGE_KEY);
        // Voltar para o padrão (black)
        this.setThemePreset('black');
    }
}
