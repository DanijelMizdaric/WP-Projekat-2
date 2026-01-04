import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';


import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

import { FirebaseService } from 'src/app/core/services/firebase.service';
import { ThemeService, Theme } from 'src/app/core/services/theme.service';

@Component({
  selector: 'app-register',
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
    MatSelectModule,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private firebaseService = inject(FirebaseService);
  private themeService = inject(ThemeService);
  private router = inject(Router);
  
  registerForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');
  

  availableThemes: Theme[] = this.themeService.getAvailableThemes();
  
  constructor() {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      theme: ['green', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }
  
  
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    return null;
  }
  
  async onSubmit() {
  if (this.registerForm.invalid) return;
  
  this.isLoading.set(true);
  this.errorMessage.set('');
  
  const { email, password, theme } = this.registerForm.value;
  
  const result = await this.firebaseService.register(email, password, theme);
  
  this.isLoading.set(false);
  
  if (result.success) {
    
    this.themeService.setTheme(theme);
    
   
    this.router.navigate(['/home']); 
  } else {
    const errorMsg = result.error || 'Došlo je do nepoznate greške pri registraciji';
    this.errorMessage.set(errorMsg);
    this.registerForm.get('password')?.reset();
    this.registerForm.get('confirmPassword')?.reset();
  }
}
  
  
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }
  get theme() { return this.registerForm.get('theme'); }
}