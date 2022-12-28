// angular
import { Directive, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { HostBinding, HostListener, Input } from '@angular/core';
import { ElementRef, ViewContainerRef } from '@angular/core';

// services
import { CanvasRendererService } from './services/canvas-renderer.service';
import { NgFlowchartCanvasService } from './ng-flowchart-canvas.service';
import { OptionsService } from './services/options.service';
import { StepManagerService } from './services/step-manager.service';

// interfaces
import { NgFlowchart } from './model/flow.model';

// contansts
import { CONSTANTS } from './model/flowchart.constants';

@Directive({
  selector: '[ngFlowchartCanvas]',
  providers: [
    CanvasRendererService,
    NgFlowchartCanvasService,
    OptionsService,
    StepManagerService
  ]
})
export class NgFlowchartCanvasDirective implements OnInit, AfterViewInit, OnDestroy {
  @HostListener('drop', ['$event'])
  protected onDrop(event: DragEvent) {
    if (this._disabled) {
      return;
    }

    // it is possible multiple canvases exist so make sure we only move/drop on the closest one
    const closestCanvasId = (event.target as HTMLElement).closest('.ngflowchart-canvas-content')?.id;

    if (this._id !== closestCanvasId) {
      return;
    }

    const type = event.dataTransfer.getData('type');
    if ('FROM_CANVAS' == type) {
      this.canvas.moveStep(event, event.dataTransfer.getData('id'));
    } else {
      this.canvas.onDrop(event);
    }
  }

  @HostListener('dragover', ['$event'])
  protected onDragOver(event: DragEvent) {
    event.preventDefault();

    if (this._disabled) {
      return;
    }

    this.canvas.onDragStart(event);
  }

  _options: NgFlowchart.Options;
  _callbacks: NgFlowchart.Callbacks;

  @HostListener('window:resize', ['$event'])
  protected onResize(event) {
    if (this._options.centerOnResize) {
      this.canvas.reRender(true);
    }
  }

  @HostListener('wheel', ['$event'])
  protected onZoom(event) {
    if (this._options.zoom.mode === 'WHEEL') {
      this.adjustWheelScale(event);
    }
  }

  @Input('ngFlowchartCallbacks')
  set callbacks(callbacks: NgFlowchart.Callbacks) {
    this.optionService.setCallbacks(callbacks);
  }

  @Input('ngFlowchartOptions')
  set options(options: NgFlowchart.Options) {
    this.optionService.setOptions(options);
    this._options = this.optionService.options;
    this.canvas.reRender();
  }

  get options() {
    return this._options;
  }

  @Input('disabled')
  @HostBinding('attr.disabled')
  set disabled(val: boolean) {
    this._disabled = val !== false;
    if (this.canvas) {
      this.canvas._disabled = this._disabled;
    }
  }

  get disabled() {
    return this._disabled;
  }

  private _disabled: boolean = false;
  private _id: string = null
  private canvasContent: HTMLElement;

  constructor(
    protected canvasEle: ElementRef<HTMLElement>,
    private canvas: NgFlowchartCanvasService,
    private optionService: OptionsService,
    private viewContainer: ViewContainerRef
  ) {
    this.canvasEle.nativeElement.classList.add(CONSTANTS.CANVAS_CLASS);
    this.canvasContent = this.createCanvasContent(this.viewContainer);
    this._id = this.canvasContent.id;
  }

  ngOnInit() {
    this.canvas.init(this.viewContainer);

    if (!this._options) {
      this.options = new NgFlowchart.Options();
    }

    this.canvas._disabled = this._disabled;
  }

  ngAfterViewInit() {}

  ngOnDestroy() {
    for (let i = 0; i < this.viewContainer.length; i++) {
      this.viewContainer.remove(i);
    }

    this.canvasEle.nativeElement.remove();
    this.viewContainer.element.nativeElement.remove();
    this.viewContainer = undefined;
  }

  private createCanvasContent(viewContainer: ViewContainerRef): HTMLElement {
    let canvasEle = viewContainer.element.nativeElement as HTMLElement;
    let canvasContent = document.createElement('div');
    const canvasId = 'c' + Date.now();

    canvasContent.id = canvasId;
    canvasContent.classList.add(CONSTANTS.CANVAS_CONTENT_CLASS);
    canvasEle.appendChild(canvasContent);
    return canvasContent;
  }

  // return the flow object representing this flow chart
  public getFlow() {
    return new NgFlowchart.Flow(this.canvas);
  }

  public scaleDown() {
    this.canvas.scaleDown();
  }

  public scaleUp() {
    this.canvas.scaleUp();
  }

  public setScale(scaleValue: number) {
    const scaleVal = Math.max(0, scaleValue);
    this.canvas.setScale(scaleVal);
  }

  private adjustWheelScale(event) {
    if (this.canvas.flow.hasRoot()) {
      event.preventDefault();

      // scale down / zoom out
      if (event.deltaY > 0) {
        this.scaleDown();
      } else if (event.deltaY < 0) {
        // scale up / zoom in
        this.scaleUp();
      }
    }
  }
}
