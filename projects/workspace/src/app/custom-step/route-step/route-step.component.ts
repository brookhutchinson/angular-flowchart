// angular
import { Component } from '@angular/core';

// components
import { NgFlowchartStepComponent } from 'projects/ng-flowchart/src/lib/ng-flowchart-step/ng-flowchart-step.component';

// interfaces
import { NgFlowchart } from 'projects/ng-flowchart/src';

@Component({
  selector: 'app-route-step',
  templateUrl: './route-step.component.html',
  styleUrls: ['./route-step.component.scss']
})
export class RouteStepComponent extends NgFlowchartStepComponent {
  ngOnInit() {}

  getDropPositionsForStep(step: NgFlowchart.Step): NgFlowchart.DropPosition[] {
    if (step.type !== 'route-step') {
      return ['BELOW']
    } else {
      return ['LEFT', 'RIGHT'];
    }
  }
}
