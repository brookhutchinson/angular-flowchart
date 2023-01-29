// angular
import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { ElementRef, ViewChild } from '@angular/core';

// components
import { NgFlowchartStepComponent } from 'projects/ng-flowchart/src';

// directives
import { NgFlowchartCanvasDirective } from 'projects/ng-flowchart/src';

// interfaaces
import { NgFlowchart } from 'projects/ng-flowchart/src';

export type NestedData = {
  nested: any
}

@Component({
  selector: 'app-nested-flow',
  templateUrl: './nested-flow.component.html',
  styleUrls: ['./nested-flow.component.scss']
})
export class NestedFlowComponent extends NgFlowchartStepComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(NgFlowchartCanvasDirective) nestedCanvas: NgFlowchartCanvasDirective;
  @ViewChild('canvasContent') stepContent: ElementRef<HTMLElement>;

  callbacks: NgFlowchart.Callbacks = {
    afterRender: () => {
      this.canvas.reRender(true)
    }
  };

  options: NgFlowchart.Options = {
    stepGap: 40,
    rootPosition: 'TOP_CENTER',
    zoom: {
      mode: 'DISABLED'
    }
  }

  constructor() {
    super();
  }

  ngOnInit() {
    super.ngOnInit();
  }

  ngAfterViewInit() {
    super.ngAfterViewInit();
    this.addAlternateClass();
  }

  ngOnDestroy() {
    this.nestedCanvas?.getFlow().clear();
  }

  // add nested-alt class to alternate nested flows for better visibility
  addAlternateClass() {
    const parentCanvasWrapperClasses = (this.canvas.viewContainer.element.nativeElement as HTMLElement).parentElement.classList;

    if (parentCanvasWrapperClasses.contains('nested-flow-step') && !parentCanvasWrapperClasses.contains('nested-alt')) {
      this.nativeElement.classList.add('nested-alt');
    }
  }

  shouldEvalDropHover(coords: number[], stepToDrop: NgFlowchart.Step): boolean {
    const canvasRect = this.stepContent.nativeElement.getBoundingClientRect();

    return !this.areCoordsInRect(coords, canvasRect);
  }

  toJSON() {
    const json = super.toJSON();

    return {
      ...json,
      data: {
        ...this.data,
        nested: this.nestedCanvas.getFlow().toObject()
      }
    }
  }

  canDrop(dropEvent: NgFlowchart.DropTarget): boolean {
    return true;
  }

  canDeleteStep(): boolean {
    return true;
  }

  async onUpload(data: NestedData) {
    if (!this.nestedCanvas) {
      return;
    }

    await this.nestedCanvas.getFlow().upload(data.nested);
  }

  private areCoordsInRect(coords: number[], rect: Partial<DOMRect>): boolean {
    return this.isNumInRange(coords[0], rect.left, rect.left + rect.width) && this.isNumInRange(coords[1], rect.top, rect.top + rect.height)
  }

  private isNumInRange(num: number, start: number, end: number): boolean {
    return num >= start && num <= end;
  }
}
