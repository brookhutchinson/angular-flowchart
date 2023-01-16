// angular modules
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// components
import { NgFlowchartArrowComponent } from './ng-flowchart-arrow/ng-flowchart-arrow.component';
import { NgFlowchartStepComponent } from './ng-flowchart-step/ng-flowchart-step.component';

// directives
import { NgFlowchartCanvasDirective } from './ng-flowchart-canvas.directive';
import { NgFlowchartStepDirective } from './ng-flowchart-step.directive';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    // components
    NgFlowchartStepComponent,
    NgFlowchartArrowComponent,
    // directives
    NgFlowchartCanvasDirective,
    NgFlowchartStepDirective
  ],
  exports: [
    // components
    NgFlowchartArrowComponent,
    NgFlowchartStepComponent,
    // directives
    NgFlowchartCanvasDirective,
    NgFlowchartStepDirective
  ]
})
export class NgFlowchartModule {}
