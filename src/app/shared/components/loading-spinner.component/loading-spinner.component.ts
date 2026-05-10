import {Component, inject} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {LoadingService} from '../../../core/services/loading.service';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [
    MatProgressSpinner
  ],
  templateUrl: './loading-spinner.component.html',
  styleUrl: './loading-spinner.component.scss'
})
export class LoadingSpinnerComponent {
  private loadingService = inject(LoadingService);

  readonly isLoading = toSignal(this.loadingService.loading$, { initialValue: false });
}
