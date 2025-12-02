import { Injectable, signal } from '@angular/core';

export interface CropBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * Serviço para gerenciar o crop box de exportação
 */
@Injectable({ providedIn: 'root' })
export class PrintService {
    public readonly showCropBox = signal(false);
    public readonly cropBox = signal<CropBox>({
        x: 100,
        y: 100,
        width: 800,
        height: 600
    });

    toggleCropBox(): void {
        this.showCropBox.update(v => !v);
    }

    /**
     * Inicializa o crop box baseado no tamanho do canvas
     */
    initializeCropBox(canvasWidth: number, canvasHeight: number): void {
        const width = Math.max(100, canvasWidth - 40); // 20px de cada lado
        const height = Math.max(100, canvasHeight - 40);
        const x = (canvasWidth - width) / 2; // Centralizar
        const y = (canvasHeight - height) / 2;

        this.cropBox.set({ x, y, width, height });
    }

    updateCropBox(box: Partial<CropBox>): void {
        this.cropBox.update(current => ({ ...current, ...box }));
    }

    /**
     * Exporta a área do canvas como imagem
     */
    async exportImage(canvas: HTMLCanvasElement): Promise<void> {
        const box = this.cropBox();

        // Criar canvas temporário com o tamanho da área selecionada
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = box.width;
        tempCanvas.height = box.height;
        const ctx = tempCanvas.getContext('2d')!;

        // Copiar a área selecionada
        ctx.drawImage(
            canvas,
            box.x, box.y, box.width, box.height,
            0, 0, box.width, box.height
        );

        // Converter para blob e baixar
        tempCanvas.toBlob((blob) => {
            if (!blob) return;

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `nousscope-export-${Date.now()}.png`;
            link.click();
            URL.revokeObjectURL(url);
        }, 'image/png');
    }
}
