import {Component, Input, OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import { StringUtils } from '../../../utils/string.utils';
import { User } from '../../../models/user.model';

const TYPE_TEXT = 'text';
const TYPE_PASSWORD = 'password';

@Component({
  selector: 'std-password-field',
  styles: [`
    :host {
      display: flex;
      align-items: center;
    }`
  ],
  template: `
    <mat-form-field>
      <input matInput placeholder="{{'Password' | translate}}"
             [type]="revealed ? '${TYPE_TEXT}' : '${TYPE_PASSWORD}'"
             [formControl]="formControlRef"
             [(ngModel)]="model.password">
      <mat-error translate *ngIf="formControlRef.hasError('required')">
        Password is required
      </mat-error>
    </mat-form-field>
    <div class="helpers">
      <button mat-button 
              class="mat-icon-button"
              *ngIf="allowVisibilityControl"
              (click)="revealed = !revealed"
              [attr.aria-label]="'Show/Hide Password' | translate"
              [title]="'Show/Hide Password' | translate">
        <mat-icon>{{inputType === 'text' ? 'visibility_off' : 'visibility'}}</mat-icon>
      </button>
      <button translate mat-button *ngIf="allowGeneration" (click)="generatePassword()">
        Generate
      </button>
    </div>`
}) export class PasswordFieldComponent implements OnInit {
  @Input() model: { [key: string]: any; password?: string; } = {  };
  @Input() autoGenerate = false;
  @Input() allowVisibilityControl = true;
  @Input() allowGeneration = true;
  @Input() formControlRef;
  @Input() revealed = true;
  ngOnInit() {
    if (!this.formControlRef) {
      this.formControlRef = new FormControl('', [Validators.required]);
    }
    if (this.autoGenerate) {
      this.generatePassword();
    }
  }
  generatePassword() {
    const password: string = StringUtils.password();
    this.formControlRef.setValue(password);
    this.model.password = password;
  }
}
