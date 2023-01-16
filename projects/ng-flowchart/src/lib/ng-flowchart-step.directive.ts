// angular
import { Directive, AfterViewInit } from '@angular/core';
import { ElementRef, HostListener, Input } from '@angular/core';

// services
import { DropDataService } from './services/dropdata.service';

// interfaces
import { NgFlowchart } from './model/flow.model';

@Directive({
  selector: '[ngFlowchartStep]'
})
export class NgFlowchartStepDirective implements AfterViewInit {

    @HostListener('dragstart', ['$event'])
    onDragStart(event: DragEvent) {
        this.data.setDragStep(this.flowStep);
        event.dataTransfer.setData('type', 'FROM_PALETTE');
    }

    @HostListener('dragend', ['$event'])
    onDragEnd(event: DragEvent) {

        this.data.setDragStep(null);

    }

    @Input('ngFlowchartStep')
    flowStep: NgFlowchart.PendingStep;

    constructor(
        protected element: ElementRef<HTMLElement>,
        private data: DropDataService
    ) {
        this.element.nativeElement.setAttribute('draggable', 'true');
    }

    ngAfterViewInit() {
    }
}
