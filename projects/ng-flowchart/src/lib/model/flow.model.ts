// angular
import { TemplateRef, Type } from '@angular/core';

// components
import { NgFlowchartStepComponent } from '../ng-flowchart-step/ng-flowchart-step.component';

// services
import { NgFlowchartCanvasService } from '../ng-flowchart-canvas.service';

export namespace NgFlowchart {
  export class Flow {
    constructor(
      private canvas: NgFlowchartCanvasService
    ) {}

    // returns the json representation of this flow
    // @param indent Optional indent to specify for formatting
    toJSON(indent?: number) {
      return JSON.stringify(this.toObject(), null, indent);
    }

    toObject() {
      return {
        root: this.canvas.flow.rootStep?.toJSON(),
      };
    }

    // create a flow and render it on the canvas from a json string
    // @param json The json string of the flow to render
    async upload(json: string | object): Promise<void> {
      let jsonObj = typeof json === 'string' ? JSON.parse(json) : json;
      let root: any = jsonObj.root;

      this.clear();
      await this.canvas.upload(root);
    }

    // return the root step of the flow chart
    getRoot(): NgFlowchartStepComponent {
      return this.canvas.flow.rootStep;
    }

    // find a step in the flow chart by a given id
    // @param id Id of the step to find. By default, the html id of the step
    getStep(id): NgFlowchartStepComponent {
      return this.canvas.flow.steps.find((child) => child.id == id);
    }

    // re-renders the canvas. Generally this should only be used in rare circumstances
    // @param pretty Attempt to recenter the flow in the canvas
    render(pretty?: boolean) {
      this.canvas.reRender(pretty);
    }

    // clear all flow chart, reseting the current canvas
    clear() {
      if (this.canvas.flow?.rootStep) {
        this.canvas.flow.rootStep.destroy(true, false);
        this.canvas.reRender();
      }
    }
  }

  export class Options {
    // the gap (in pixels) between flow steps
    stepGap?: number = 40;

    // an inner deadzone radius (in pixels) that will not register the hover icon
    hoverDeadzoneRadius?: number = 20;

    // is the flow sequential? If true, then you will not be able to drag parallel steps
    isSequential?: boolean = false;

    // the default root position when dropped. Default is TOP_CENTER
    rootPosition?: 'TOP_CENTER' | 'CENTER' | 'FREE' = 'TOP_CENTER';

    // should the canvas be centered when a resize is detected?
    centerOnResize?: boolean = true;

    // canvas zoom options. defaults to mouse wheel zoom
    zoom?: {
      mode: 'WHEEL' | 'MANUAL' | 'DISABLED';
      defaultStep?: number;
    } = {
      mode: 'WHEEL',
      defaultStep: 0.1
    };
  }

  export type DropEvent = {
    parent?: NgFlowchartStepComponent;
    step: NgFlowchartStepComponent;
    isMove: boolean;
  };

  export type DropError = {
    parent?: NgFlowchartStepComponent;
    step: PendingStep;
    error: ErrorMessage;
  };

  export type MoveError = {
    parent?: NgFlowchartStepComponent;
    step: MoveStep;
    error: ErrorMessage;
  };

  export type ErrorMessage = {
    code?: string;
    message?: string;
  };

  export interface MoveStep extends Step {
    instance: NgFlowchartStepComponent;
  }

  export interface PendingStep extends Step {
    // an ng-template containing the canvas content to be displayed
    // or a component type that extends NgFlowchartStepComponent
    template: TemplateRef<any> | Type<NgFlowchartStepComponent>;
  }

  export interface Step {
    // a unique string indicating the type of step this is
    // this type will be used to register steps if you are uploading from json
    type: string;
    // optional data to give the step. Typically configuration data that users can edit on the step.
    data?: any;
  }

  export type DropTarget = {
    step: NgFlowchartStepComponent;
    position: DropPosition;
  };

  export type DropStatus = 'SUCCESS' | 'PENDING' | 'FAILED';
  export type DropPosition = 'RIGHT' | 'LEFT' | 'BELOW' | 'ABOVE';

  export type Callbacks = {
    // called when user drops a new step from the palette or moves an existing step
    onDropStep?: (drop: DropEvent) => void;

    // called when the delete method has been called on the step
    beforeDeleteStep?: (step: NgFlowchartStepComponent) => void;

    // called after the delete method has run on the step. If you need to access
    // step children or parents, use beforeDeleteStep
    afterDeleteStep?: (step: NgFlowchartStepComponent) => void;

    // called when a new step fails to drop on the canvas
    onDropError?: (drop: DropError) => void;

    // called when an existing step fails to move
    onMoveError?: (drop: MoveError) => void;

    // called before the canvas is about to re-render
    beforeRender?: () => void;

    // called after the canvas completes a re-render
    afterRender?: () => void;

    // called after the canvas has been scaled
    afterScale?: (newScale: number) => void;
  };
}
