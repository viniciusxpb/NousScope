import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrintService } from '../../core/services/print.service';

/**
 * Painel de exportação/print do canvas.
 * Permite selecionar uma área e exportar como imagem.
 */
@Component({
    selector: 'app-print-panel',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './print-panel.component.html',
    styleUrl: './print-panel.component.scss',
})
export class PrintPanelComponent {
    private readonly printService = inject(PrintService);

    readonly showCropBox = this.printService.showCropBox;
    readonly cropBox = this.printService.cropBox;

    readonly cropBoxWidth = computed(() => this.cropBox().width);
    readonly cropBoxHeight = computed(() => this.cropBox().height);

    toggleCropBox(): void {
        if (!this.showCropBox()) {
            // Ao abrir, inicializar com base no tamanho do canvas
            const canvas = document.querySelector('canvas');
            if (canvas) {
                this.printService.initializeCropBox(canvas.width, canvas.height);
            }
        }
        this.printService.toggleCropBox();
    }

    exportImage(): void {
        // Encontrar o canvas element
        const canvas = document.querySelector('canvas');
        if (!canvas) {
            console.error('Canvas não encontrado');
            return;
        }

        this.printService.exportImage(canvas);
    }
}
