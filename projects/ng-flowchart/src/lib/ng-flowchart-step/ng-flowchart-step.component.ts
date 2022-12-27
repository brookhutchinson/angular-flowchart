// angular
import { Component } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
import { EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { ComponentRef, ElementRef, TemplateRef, ViewContainerRef } from '@angular/core';

// components
import { NgFlowchartArrowComponent } from '../ng-flowchart-arrow/ng-flowchart-arrow.component';

// services
import { DropDataService } from '../services/dropdata.service';
import { NgFlowchartCanvasService } from '../ng-flowchart-canvas.service';

// interfaces
import { NgFlowchart } from '../model/flow.model';

// contants
import { CONSTANTS } from '../model/flowchart.constants';

export type AddChildOptions = {
  // should the child be added as a sibling to existing children, if false the existing children will be reparented to this new child
  sibling?: boolean,
  // the index of the child. Only used when sibling is true
  // defaults to the end of the child array
  index?: number
}

@Component({
  selector: 'ng-flowchart-step',
  templateUrl: './ng-flowchart-step.component.html',
  styleUrls: ['./ng-flowchart-step.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NgFlowchartStepComponent<T = any> {
  @Input() data: T;
  @Input() type: string;
  @Input() canvas: NgFlowchartCanvasService;
  @Input() compRef: ComponentRef<NgFlowchartStepComponent>;
  @Input() contentTemplate: TemplateRef<any>;

  @Output() viewInit = new EventEmitter();

  @ViewChild('canvasContent') protected view: ElementRef;

  @HostListener('dragstart', ['$event'])
  onMoveStart(event: DragEvent) {
    if (this.canvas.disabled) {
      return;
    }

    this.hideTree();
    event.dataTransfer.setData('type', 'FROM_CANVAS');
    event.dataTransfer.setData('id', this.nativeElement.id);

    this.drop.dragStep = {
      type: this.type,
      data: this.data,
      instance: this
    }
  }

  @HostListener('dragend', ['$event'])
  onMoveEnd(event: DragEvent) {
    this.showTree();
  }

  private _id: any;
  private _currentPosition = [0, 0];

  // only used if something tries to set the position before view has been initialized
  private _initPosition;
  private _isHidden = false;
  private _parent: NgFlowchartStepComponent;
  private _children: Array<NgFlowchartStepComponent>;
  private arrow: ComponentRef<NgFlowchartArrowComponent>;
  private drop: DropDataService;
  private viewContainer: ViewContainerRef;

  constructor() {
    this._children = [];
  }

  ngOnInit() {}

  ngAfterViewInit() {
    if (!this.nativeElement) {
      throw 'Missing canvasContent ViewChild. Be sure to add #canvasContent to your root html element.';
    }

    this.nativeElement.classList.add('ngflowchart-step-wrapper');
    this.nativeElement.setAttribute('draggable', 'true');

    if (this._initPosition) {
      this.zsetPosition(this._initPosition);
    }

    // force id creation if not already there
    this.nativeElement.id = this.id;

    this.viewInit.emit();
  }

  init(drop, viewContainer) {
    this.drop = drop;
    this.viewContainer = viewContainer;
  }

  canDeleteStep(): boolean {
    return true;
  }

  canDrop(dropEvent: NgFlowchart.DropTarget, error: NgFlowchart.ErrorMessage): boolean {
    return true;
  }

  // called when no longer trying to drop or move a step adjacent to this one
  // @param position Position to render the icon
  clearHoverIcons() {
    this.nativeElement.removeAttribute(CONSTANTS.DROP_HOVER_ATTR);
  }

  // destroy this step component and updates all necessary child and parent relationships
  // @param recursive
  // @param checkCallbacks
  destroy(recursive: boolean = true, checkCallbacks: boolean = true): boolean {
    if (!checkCallbacks || this.canDeleteStep()) {
      this.canvas.options.callbacks.beforeDeleteStep && this.canvas.options.callbacks.beforeDeleteStep(this);

      let parentIndex;

      if (this._parent) {
        parentIndex = this._parent.removeChild(this);
      }

      this.destroy0(parentIndex, recursive);
      this.canvas.reRender();
      this.canvas.options.callbacks.afterDeleteStep &&
      this.canvas.options.callbacks.afterDeleteStep(this)

      return true;
    }

    return false;
  }

  // return current rect of this step. The position can be animated so getBoundingClientRect cannot
  // be reliable for positions
  // @param canvasRect Optional canvasRect to provide to offset the values
  getCurrentRect(canvasRect?: DOMRect): Partial<DOMRect> {
    let clientRect = this.nativeElement.getBoundingClientRect();

    return {
      bottom: this._currentPosition[1] + clientRect.height + (canvasRect?.top || 0),
      left: this._currentPosition[0] + (canvasRect?.left || 0),
      height: clientRect.height,
      width: clientRect.width,
      right: this._currentPosition[0] + clientRect.width + (canvasRect?.left || 0),
      top: this._currentPosition[1] + (canvasRect?.top || 0)
    }
  }

  getDropPositionsForStep(step: NgFlowchart.Step): NgFlowchart.DropPosition[] {
    return ['BELOW', 'LEFT', 'RIGHT', 'ABOVE'];
  }

  // returns the total width extent (in pixels) of this node tree
  // @param stepGap The current step gap for the flow canvas
  getNodeTreeWidth(stepGap: number) {
    const currentNodeWidth = this.nativeElement.getBoundingClientRect().width;

    if (!this.hasChildren()) {
      return this.nativeElement.getBoundingClientRect().width;
    }

    let childWidth = this._children.reduce((childTreeWidth, child) => {
      return childTreeWidth += child.getNodeTreeWidth(stepGap);
    }, 0);

    childWidth += stepGap * (this._children.length - 1);

    return Math.max(currentNodeWidth, childWidth);
  }

  // does this step have any children?
  // @param count Optional count of children to check. Defaults to 1. I.E has at least 1 child
  hasChildren(count: number = 1) {
    return this.children && this.children.length >= count;
  }

  // is this step currently hidden and unavailable as a drop location
  isHidden() {
    return this._isHidden;
  }

  // is this the root element of the tree
  isRootElement() {
    return !this.parent;
  }

  // remove a child from this step. Returns the index at which the child was found or -1 if not found.
  // @param childToRemove Step component to remove
  removeChild(childToRemove: NgFlowchartStepComponent): number {
    if (!this.children) {
      return -1;
    }

    const i = this.children.findIndex(child => child.id == childToRemove.id);
    if (i > -1) {
      this.children.splice(i, 1);
    }

    return i;
  }

  setId(id) {
    this._id = id;
  }

  // re-parent this step
  // @param newParent The new parent for this step
  // @param force Force the re-parent if a parent already exists
  setParent(newParent: NgFlowchartStepComponent, force: boolean = false) {
    if (this.parent && !force) {
      console.warn('This child already has a parent, use force if you know what you are doing');
      return;
    }

    this._parent = newParent;

    if (!this._parent && this.arrow) {
      this.arrow.destroy();
      this.arrow = null;
    }
  }

  shouldEvalDropHover(coords: number[], stepToDrop: NgFlowchart.Step): boolean {
    return true;
  }

  // called when a step is trying to be dropped or moved adjacent to this step
  // @param position Position to render the icon
  showHoverIcon(position: NgFlowchart.DropPosition) {
    this.nativeElement.setAttribute(CONSTANTS.DROP_HOVER_ATTR, position.toLowerCase());
  }

  // return the JSON representation of this flow step
  toJSON() {
    return {
      id: this.id,
      type: this.type,
      data: this.data,
      children: this.hasChildren() ? this._children.map(child => {
        return child.toJSON()
      }) : []
    }
  }

  zaddChild0(newChild: NgFlowchartStepComponent): boolean {
    let oldChildIndex = null;

    if (newChild._parent) {
      oldChildIndex = newChild._parent.removeChild(newChild);
    }

    if (this.hasChildren()) {
      if (newChild.hasChildren()) {
        // if we have children and the child has children we need to confirm the child doesnt have multiple children at any point
        let newChildLastChild = newChild.findLastSingleChild();

        if (!newChildLastChild) {
          newChild._parent.zaddChildSibling0(newChild, oldChildIndex)
          console.error('Invalid move. A node cannot have multiple parents');
          return false;
        }

        // move the this nodes children to last child of the step arg
        newChildLastChild.setChildren(this._children.slice());
      } else {
        // move adjacent's children to newStep
        newChild.setChildren(this._children.slice());
      }
    }

    // finally reset this nodes to children to the single new child
    this.setChildren([newChild]);
    return true;
  }

  zaddChildSibling0(child: NgFlowchartStepComponent, index?: number) {
    if (child._parent) {
      child._parent.removeChild(child);
    }

    if (!this.children) {
      this._children = [];
    }

    if (index == null) {
      this.children.push(child);
    } else {
      this.children.splice(index, 0, child);
    }

    // since we are adding a new child here, it is safe to force set the parent
    child.setParent(this, true);
  }

  zdrawArrow(start: number[], end: number[]) {
    if (!this.arrow) {
      this.createArrow();
    }

    this.arrow.instance.position = {
      start: start,
      end: end
    };
  }

  zsetPosition(pos: number[], offsetCenter: boolean = false) {
    if (!this.view) {
      console.warn('Trying to set position before view init');
      // save pos and set in after view init
      this._initPosition = [...pos];
      return;
    }

    let adjustedX = Math.max(pos[0] - (offsetCenter ? this.nativeElement.offsetWidth / 2 : 0), 0);
    let adjustedY = Math.max(pos[1] - (offsetCenter ? this.nativeElement.offsetHeight / 2 : 0), 0);

    this.nativeElement.style.left = `${adjustedX}px`;
    this.nativeElement.style.top = `${adjustedY}px`;

    this._currentPosition = [adjustedX, adjustedY];
  }

  // create and add a child to this step
  // @param template The template or component type to create
  // @param options Add options
  async addChild(pending: NgFlowchart.PendingStep, options: AddChildOptions): Promise<NgFlowchartStepComponent | null> {
    let componentRef = await this.canvas.createStep(pending);

    this.canvas.addToCanvas(componentRef);

    if (options?.sibling) {
      this.zaddChildSibling0(componentRef.instance, options?.index);
    } else {
      this.zaddChild0(componentRef.instance);
    }

    this.canvas.flow.addStep(componentRef.instance);
    this.canvas.reRender();

    return componentRef.instance;
  }

  async onUpload(data: T) {}

  private destroy0(parentIndex, recursive: boolean = true) {
    this.compRef.destroy();

    // remove from master array
    this.canvas.flow.removeStep(this);

    if (this.isRootElement()) {
      this.canvas.flow.rootStep = null;
    }

    if (this.hasChildren()) {
      // this was the root node
      if (this.isRootElement()) {
        if (!recursive) {
          let newRoot = this._children[0];

          // set first child as new root
          this.canvas.flow.rootStep = newRoot;
          newRoot.setParent(null, true);

          // make previous siblings children of the new root
          if (this.hasChildren(2)) {
            for (let i = 1; i < this._children.length; i++) {
              let child = this._children[i];
              child.setParent(newRoot, true);
              newRoot._children.push(child);
            }
          }
        }
      }

      // update children
      let length = this._children.length;

      for (let i = 0; i < length; i++) {
        let child = this._children[i];

        if (recursive) {
          (child as NgFlowchartStepComponent).destroy0(null, true);
        } else if (!!this._parent) {
          // not the original root node
          this._parent._children.splice(i + parentIndex, 0, child);
          child.setParent(this._parent, true);
        }
      }

      this.setChildren([]);
    }

    this._parent = null;
  }

  private createArrow() {
    this.arrow = this.viewContainer.createComponent(NgFlowchartArrowComponent);
    this.nativeElement.parentElement.appendChild(this.arrow.location.nativeElement);
  }

  private findLastSingleChild() {
    if (this.hasChildren(2)) {
      // two or more children means we have no single child
      return null;
    } else if (this.hasChildren()) {
      // if one child.. keep going down the tree until we find no children or 2 or more
      return this._children[0].findLastSingleChild();
    } else
      // if no children then this is the last single child
      return this;
  }

  private hideTree() {
    this._isHidden = true;
    this.nativeElement.style.opacity = '.4';

    if (this.arrow) {
      this.arrow.instance.hideArrow();
    }

    if (this.hasChildren()) {
      this._children.forEach(child => {
        child.hideTree();
      });
    }
  }

  private setChildren(children: Array<NgFlowchartStepComponent>) {
    this._children = children;

    this.children.forEach(child => {
      child.setParent(this, true);
    });
  }

  private showTree() {
    this._isHidden = false;

    if (this.arrow) {
      this.arrow.instance.showArrow();
    }

    this.nativeElement.style.opacity = '1';

    if (this.hasChildren()) {
      this._children.forEach(child => {
        child.showTree();
      });
    }
  }

  // array of children steps for this step
  get children() {
    return this._children;
  }

  get currentPosition() {
    return this._currentPosition;
  }

  get id() {
    if (this._id == null) {
      this._id = 's' + Date.now();
    }

    return this._id;
  }

  // the native HTMLElement of this step
  get nativeElement(): HTMLElement {
    return this.view?.nativeElement;
  }

  // the parent step of this step
  get parent() {
    return this._parent;
  }
}
