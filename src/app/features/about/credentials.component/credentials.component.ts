import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';
import { CredentialsService } from '../../../core/services/credentials.service';

@Component({
  selector: 'app-credentials',
  standalone: true,
  imports: [AsyncPipe, TranslocoPipe],
  templateUrl: './credentials.component.html',
  styleUrl: './credentials.component.scss',
})
export class CredentialsComponent {
  private service = inject(CredentialsService);

  readonly credentials$ = this.service.getCredentials();
  readonly languages$ = this.service.getSpokenLanguages();
}
