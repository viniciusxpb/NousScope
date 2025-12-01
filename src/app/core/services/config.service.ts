import { Injectable, signal, computed } from '@angular/core';
import { AppConfig, ThemeConfig, CanvasConfig, NetworkConfig, UIConfig } from '../models/config.model';
import { BasicPreset, ClassicPreset, SaltoPreset, XcosPreset } from '../models/preset.model';

interface PresetsCollection {
    basic: Record<string, BasicPreset>;
    xcos: Record<string, XcosPreset>;
    classic: Record<string, ClassicPreset>;
    salto: Record<string, SaltoPreset>;
}

/**
 * Serviço de configuração global.
 * Carrega configs do JSON e expõe via signals.
 */
@Injectable({ providedIn: 'root' })
export class ConfigService {
    private readonly configPath = '/assets/config';

    private readonly _config = signal<AppConfig | null>(null);
    private readonly _presets = signal<PresetsCollection>({
        basic: {},
        xcos: {},
        classic: {},
        salto: {},
    });

    public readonly isLoaded = computed(() => this._config() !== null);

    /**
     * Carrega todas as configurações. Chamado via APP_INITIALIZER.
     */
    async load(): Promise<void> {
        try {
            const [config, basic, xcos, classic, salto] = await Promise.all([
                this.fetchJson<AppConfig>('app.config.json'),
                this.fetchJson<Record<string, BasicPreset>>('presets/basic.presets.json'),
                this.fetchJson<Record<string, XcosPreset>>('presets/xcos.presets.json'),
                this.fetchJson<Record<string, ClassicPreset>>('presets/classic.presets.json'),
                this.fetchJson<Record<string, SaltoPreset>>('presets/salto.presets.json'),
            ]);

            this._config.set(config);
            this._presets.set({ basic, xcos, classic, salto });
        } catch (error) {
            console.error('Failed to load configuration, using defaults:', error);
            // Provide minimal fallback config to prevent crash
            this._config.set({
                app: { name: 'NousScope', version: '1.0.0', description: 'Neural Network Visualizer' },
                theme: {
                    colors: {
                        background: '#1a1a2e', panel: '#16213e', panelHover: '#1a2744', canvasBg: '#0f0f23',
                        primary: '#00d9ff', primaryHover: '#00b8d9', secondary: '#ff6b6b', secondaryHover: '#ff5252',
                        success: '#2ed573', warning: '#ffa502', error: '#ff4757',
                        text: '#eeeeee', textMuted: '#888888', textDark: '#333333',
                        grid: '#1a1a3e', axis: '#444444',
                        inputBg: '#0d1117', inputBorder: '#333333', inputFocus: '#00d9ff',
                        layerInput: '#2ed573', layerHidden: '#ffa502', layerOutput: '#ff6b6b',
                    },
                    fonts: { primary: 'system-ui, sans-serif', mono: 'monospace' },
                    borderRadius: { xs: '2px', sm: '4px', md: '6px', lg: '8px', xl: '12px', full: '9999px' },
                    spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px', xxl: '48px' },
                    shadows: { sm: '0 1px 2px rgba(0,0,0,0.3)', md: '0 4px 6px rgba(0,0,0,0.4)', lg: '0 10px 15px rgba(0,0,0,0.5)' },
                },
                canvas: {
                    defaultScale: 50, minScale: 5, maxScale: 500, zoomFactor: 1.5, panSpeed: 1,
                    gridStepMin: 50, gridStepMax: 200,
                    lineWidth: { network: 3, compare: 2, grid: 1, axis: 2 },
                    sampleDensity: 2,
                    colors: { networkLine: '#00d9ff', compareLine: '#ff6b6b' },
                },
                network: {
                    maxNeurons: 10, minNeurons: 1, maxLayers: 10, maxTotalNeurons: 256,
                    defaultActivation: 'relu', outputActivation: 'linear', defaultHiddenNeurons: 2,
                    initialization: { method: 'he', weightScale: 2, biasMin: -0.1, biasMax: 0.1 },
                },
                ui: {
                    debounceMs: 16, animationDurationMs: 200, tooltipDelayMs: 500, toastDurationMs: 3000,
                    defaultCompareColor: '#ff6b6b', defaultCompareFunc: 'x*cos(x)', coordsPrecision: 4,
                },
            });
        }
    }

    private async fetchJson<T>(path: string): Promise<T> {
        const response = await fetch(`${this.configPath}/${path}`);
        if (!response.ok) {
            throw new Error(`Failed to load config: ${path}`);
        }
        return response.json();
    }

    get app() { return this._config()!.app; }
    get theme(): ThemeConfig { return this._config()!.theme; }
    get canvas(): CanvasConfig { return this._config()!.canvas; }
    get network(): NetworkConfig { return this._config()!.network; }
    get ui(): UIConfig { return this._config()!.ui; }
    get presets(): PresetsCollection { return this._presets(); }
}
