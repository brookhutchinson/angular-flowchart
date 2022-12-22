// angular modules
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

// ng flowchart modules
import { NgFlowchartModule } from 'projects/ng-flowchart/src/lib/ng-flowchart.module';

// components
import { AppComponent } from './app.component';
import { CustomStepComponent } from './custom-step/custom-step.component';
import { FormStepComponent } from './form-step/form-step.component';
import { NestedFlowComponent } from './nested-flow/nested-flow.component';
import { RouteStepComponent } from './custom-step/route-step/route-step.component';

@NgModule({
  imports: [
    BrowserModule,
    NgFlowchartModule,
    FormsModule,
  ],
  declarations: [
    // components
    AppComponent,
    CustomStepComponent,
    FormStepComponent,
    NestedFlowComponent,
    RouteStepComponent
  ],
  providers: [],
  bootstrap: [ AppComponent ]
})
export class AppModule {}
