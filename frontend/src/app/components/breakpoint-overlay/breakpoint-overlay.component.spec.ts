import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { of } from 'rxjs';
import { BreakpointOverlayComponent } from './breakpoint-overlay.component';

describe('BreakpointOverlayComponent', () => {
  let component: BreakpointOverlayComponent;
  let fixture: ComponentFixture<BreakpointOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BreakpointOverlayComponent ],
      providers: [
        { provide: BreakpointObserver, useValue: { observe: () => of({ matches: false }) } }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BreakpointOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
