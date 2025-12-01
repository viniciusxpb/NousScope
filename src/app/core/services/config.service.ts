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
        const [config, basic, xcos, classic, salto] = await Promise.all([
            this.fetchJson<AppConfig>('app.config.json'),
            this.fetchJson<Record<string, BasicPreset>>('presets/basic.presets.json'),
            this.fetchJson<Record<string, XcosPreset>>('presets/xcos.presets.json'),
            this.fetchJson<Record<string, ClassicPreset>>('presets/classic.presets.json'),
            this.fetchJson<Record<string, SaltoPreset>>('presets/salto.presets.json'),
        ]);

        this._config.set(config);
        this._presets.set({ basic, xcos, classic, salto });
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
