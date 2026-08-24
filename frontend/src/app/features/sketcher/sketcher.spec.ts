import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SketchEditor } from './sketcher';

describe('SketchEditor', () => {
  let component: SketchEditor;
  let fixture: ComponentFixture<SketchEditor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SketchEditor],
    }).compileComponents();

    fixture = TestBed.createComponent(SketchEditor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
