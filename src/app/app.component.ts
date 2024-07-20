import {
  Component,
  DestroyRef,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

import { interval, map, Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  clickCount = signal(0);
  clickCount$ = toObservable(this.clickCount);
  interval$ = interval(1000);
  intervalSignal = toSignal(this.interval$, { initialValue: 0 });
  customInterval$ = new Observable((subscriber) => {
    let timesExecuted = 0;
    const interval = setInterval(() => {
      if (timesExecuted > 3) {
        clearInterval(interval);
        subscriber.complete();
        return;
      }
      console.log('Emitting new value...');
      subscriber.next({ message: 'New value' });
      timesExecuted++;
    }, 2000);
  });
  private destroyRef = inject(DestroyRef);

  constructor() {
    effect(() => {
      console.log(`clicked button ${this.clickCount()} times.`);
    });
  }

  ngOnInit(): void {
    const subscriptionOBS = this.interval$
      .pipe(map((val) => val * 2))
      .subscribe({
        next(value) {
          console.log(value);
        },
      });

    this.destroyRef.onDestroy(() => {
      subscriptionOBS.unsubscribe();
    });

    const subscriptionSignal = this.clickCount$.subscribe({
      next(value) {
        console.log(`clicked button ${value} times.`);
      },
    });
    this.destroyRef.onDestroy(() => {
      subscriptionSignal.unsubscribe();
    });

    const customSubscription = this.customInterval$.subscribe({
      next(value) {
        console.log(value);
      },
      complete() {
        console.log('COMPLETED!');
      },
    });

    this.destroyRef.onDestroy(() => {
      customSubscription.unsubscribe();
    });
  }

  onClick() {
    this.clickCount.update((prevcount) => prevcount + 1);
  }
}
