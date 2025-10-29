import { TestBed } from '@angular/core/testing';
import { NavigationComponent } from './navigation.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('NavigationComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavigationComponent, RouterTestingModule],
    }).compileComponents();
  });

  it('should create the navigation component', () => {
    const fixture = TestBed.createComponent(NavigationComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should toggle menu when hamburger button is clicked', () => {
    const fixture = TestBed.createComponent(NavigationComponent);
    const component = fixture.componentInstance;
    const compiled = fixture.nativeElement as HTMLElement;
    
    // Initially menu should be closed
    expect(component.isMenuOpen()).toBe(false);
    
    // Click the hamburger button
    const button = compiled.querySelector('button');
    button?.click();
    fixture.detectChanges();
    
    // Menu should now be open
    expect(component.isMenuOpen()).toBe(true);
    
    // Click again
    button?.click();
    fixture.detectChanges();
    
    // Menu should now be closed
    expect(component.isMenuOpen()).toBe(false);
  });

  it('should show hamburger icon when menu is closed', () => {
    const fixture = TestBed.createComponent(NavigationComponent);
    const compiled = fixture.nativeElement as HTMLElement;
    
    // Check that hamburger icon is visible
    const hamburgerIcon = compiled.querySelector('svg:not(.hidden)');
    expect(hamburgerIcon).toBeTruthy();
  });
});