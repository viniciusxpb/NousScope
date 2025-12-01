export interface AppInfo {
  name: string;
  version: string;
  description: string;
}

export interface ThemeColors {
  background: string;
  panel: string;
  panelHover: string;
  canvasBg: string;
  primary: string;
  primaryHover: string;
  secondary: string;
  secondaryHover: string;
  success: string;
  warning: string;
  error: string;
  text: string;
  textMuted: string;
  textDark: string;
  grid: string;
  axis: string;
  inputBg: string;
  inputBorder: string;
  inputFocus: string;
  layerInput: string;
  layerHidden: string;
  layerOutput: string;
}

export interface ThemeConfig {
  colors: ThemeColors;
  fonts: {
    primary: string;
    mono: string;
  };
  borderRadius: Record<string, string>;
  spacing: Record<string, string>;
  shadows: Record<string, string>;
}

export interface CanvasConfig {
  defaultScale: number;
  minScale: number;
  maxScale: number;
  zoomFactor: number;
  panSpeed: number;
  gridStepMin: number;
  gridStepMax: number;
  lineWidth: {
    network: number;
    compare: number;
    grid: number;
    axis: number;
  };
  sampleDensity: number;
  colors: {
    networkLine: string;
    compareLine: string;
  };
}

export type InitializationMethod = 'he' | 'xavier' | 'uniform';

export interface NetworkConfig {
  maxNeurons: number;
  minNeurons: number;
  maxLayers: number;
  maxTotalNeurons: number;
  defaultActivation: import('./layer.model').ActivationType;
  outputActivation: import('./layer.model').ActivationType;
  defaultHiddenNeurons: number;
  initialization: {
    method: InitializationMethod;
    weightScale: number;
    biasMin: number;
    biasMax: number;
  };
}

export interface UIConfig {
  debounceMs: number;
  animationDurationMs: number;
  tooltipDelayMs: number;
  toastDurationMs: number;
  defaultCompareColor: string;
  defaultCompareFunc: string;
  coordsPrecision: number;
}

export interface AppConfig {
  app: AppInfo;
  theme: ThemeConfig;
  canvas: CanvasConfig;
  network: NetworkConfig;
  ui: UIConfig;
}
