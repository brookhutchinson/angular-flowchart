// angular
import { Injectable, TemplateRef, Type } from '@angular/core';

// components
import { NgFlowchartStepComponent } from './ng-flowchart-step/ng-flowchart-step.component';

@Injectable({
  providedIn: 'root'
})
export class NgFlowchartStepRegistry {
  private registry = new Map<string, Type<NgFlowchartStepComponent> | TemplateRef<any>>();

  constructor() {}

  getStepImpl(type: string): Type<NgFlowchartStepComponent> | TemplateRef<any> | null {
    return this.registry.get(type);
  }

  // Register a step implementation. Only needed if you are uploading a flow from json
  // @param type The unique type of the step
  // @param step The step templateRef or component type to create for this key
  registerStep(type: string, step: Type<NgFlowchartStepComponent> | TemplateRef<any>) {
    this.registry.set(type, step);
  }
}
