import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

// Servisi
import { FirebaseService } from 'src/app/core/services/firebase.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private firebaseService = inject(FirebaseService);
  private router = inject(Router);
  
  loginForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');
  
  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }
  
  async onSubmit() {
    if (this.loginForm.invalid) return;
    
    this.isLoading.set(true);
    this.errorMessage.set('');
    
    const { email, password } = this.loginForm.value;
    
    const result = await this.firebaseService.login(email, password);
    
    this.isLoading.set(false);
    
    if (result.success) {
      // Preusmeri na dashboard
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMessage.set(result.error || 'Došlo je do nepoznate greške');
      this.loginForm.get('password')?.reset();
    }
  }
  
  // Pomoćne metode za template
  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
}