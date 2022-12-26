// angular
import { ComponentFixture, TestBed } from '@angular/core/testing';

// component
import { NgFlowchartStepComponent } from './ng-flowchart-step.component';

describe('NgFlowchartStepComponent', () => {
  let component: NgFlowchartStepComponent;
  let fixture: ComponentFixture<NgFlowchartStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        // components
        NgFlowchartStepComponent
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgFlowchartStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
