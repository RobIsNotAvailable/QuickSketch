import { Directive, ElementRef, EventEmitter, Output, AfterViewInit, OnDestroy } from '@angular/core';

@Directive
({
  selector: '[appInfiniteScroll]',
  standalone: true
})
export class InfiniteScrollDirective implements AfterViewInit, OnDestroy
{
  @Output() scrolled = new EventEmitter<void>();
  private observer?: IntersectionObserver;

  constructor(private el: ElementRef) {}

  ngAfterViewInit(): void
  {
    this.observer = new IntersectionObserver((entries) =>
    {
      if (entries[0].isIntersecting)
      {
        this.scrolled.emit();
      }
    }, { rootMargin: '200px', threshold: 0.1 });
    
    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void
  {
    if (this.observer)
    {
      this.observer.disconnect();
    }
  }
}