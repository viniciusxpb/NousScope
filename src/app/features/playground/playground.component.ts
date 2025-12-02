import { Component, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CanvasComponent } from '../canvas/canvas.component';
import { PresetsPanelComponent } from '../presets-panel/presets-panel.component';
import { ArchitecturePanelComponent } from '../architecture-panel/architecture-panel.component';
import { ComparePanelComponent } from '../compare-panel/compare-panel.component';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { FormulaPLotterComponent } from '../formula-plotter/formula-plotter.component';
import { PrintPanelComponent } from '../print-panel/print-panel.component';

@Component({
    selector: 'app-playground',
    standalone: true,
    imports: [
        CommonModule,
        CanvasComponent,
        PresetsPanelComponent,
        ArchitecturePanelComponent,
        ComparePanelComponent,
        ToolbarComponent,
        FormulaPLotterComponent,
        PrintPanelComponent,
    ],
    templateUrl: './playground.component.html',
    styleUrl: './playground.component.scss',
})
export class PlaygroundComponent {
    protected readonly activeTab = signal<'architecture' | 'formulas' | 'compare' | 'print'>('architecture');
    protected readonly rightPanelWidth = signal<number>(320);
    private isResizing = false;
    private startX = 0;
    private startWidth = 0;

    protected setActiveTab(tab: 'architecture' | 'formulas' | 'compare' | 'print'): void {
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
}
