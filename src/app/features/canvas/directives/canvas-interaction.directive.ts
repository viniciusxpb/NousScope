import { Directive, ElementRef, output, inject, OnDestroy, AfterViewInit } from '@angular/core';

@Directive({
    selector: '[appCanvasInteraction]',
    standalone: true,
})
export class CanvasInteractionDirective implements OnDestroy, AfterViewInit {
    private readonly element = inject(ElementRef<HTMLElement>);

    public readonly pan = output<{ dx: number; dy: number }>();
    public readonly zoom = output<{ factor: number; x: number; y: number }>();

    private isDragging = false;
    private lastX = 0;
    private lastY = 0;

    private readonly listeners: Array<() => void> = [];

    ngAfterViewInit(): void {
        const el = this.element.nativeElement;

        // Mouse events
        this.addListener(el, 'mousedown', this.onMouseDown.bind(this) as EventListener);
        this.addListener(window, 'mousemove', this.onMouseMove.bind(this) as EventListener);
        this.addListener(window, 'mouseup', this.onMouseUp.bind(this) as EventListener);
        this.addListener(el, 'wheel', this.onWheel.bind(this) as EventListener, { passive: false });
    }

    ngOnDestroy(): void {
        this.listeners.forEach(remove => remove());
    }

    private addListener(
        target: EventTarget,
        event: string,
        handler: EventListener,
        options?: boolean | AddEventListenerOptions
    ) {
        target.addEventListener(event, handler, options);
        this.listeners.push(() => target.removeEventListener(event, handler, options));
    }

    private onMouseDown(e: MouseEvent): void {
        this.isDragging = true;
        this.lastX = e.clientX;
        this.lastY = e.clientY;
    }

    private onMouseMove(e: MouseEvent): void {
        if (!this.isDragging) return;

        const dx = e.clientX - this.lastX;
        const dy = e.clientY - this.lastY;

        this.lastX = e.clientX;
        this.lastY = e.clientY;

        this.pan.emit({ dx, dy });
    }

    private onMouseUp(): void {
        this.isDragging = false;
    }

    private onWheel(e: WheelEvent): void {
        e.preventDefault();
        
        if (e.deltaY === 0) return;

        // Use smaller factor for smoother zoom
        const factor = e.deltaY > 0 ? 0.9 : 1.1;
        
        const rect = this.element.nativeElement.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.zoom.emit({ factor, x, y });
    }
}
