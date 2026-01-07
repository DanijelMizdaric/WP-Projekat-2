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
    console.log('=== REGISTER START ===');
    
    if (this.registerForm.invalid) {
      console.log('❌ Form invalid');
      return;
    }

    this.errorMessage.set('');
    this.isLoading.set(false); 

    this.isLoading.set(true);
    console.log('📝 Loading started');
  
    const { email, password, theme } = this.registerForm.value;
    
    console.log('📤 Registering:', email);
    
    try {

      this.firebaseService.register(email, password, theme)
        .then(result => {
          console.log('📊 Firebase result received:', result);
 
          this.isLoading.set(false);
          console.log('🔄 Loading stopped after firebase');
          
          if (result.success) {
            console.log('✅ Registration successful!');
       
            this.themeService.setTheme(theme);
            
            this.registerForm.reset({ theme: 'green' });
       
            setTimeout(() => {
          
              console.log('📍 Navigating to login...');
              this.router.navigate(['/login']);
            }, 100);
            
          } else {
            console.error('❌ Registration failed:', result.error);
            this.errorMessage.set(result.error || 'Greška');
            this.registerForm.get('password')?.reset();
            this.registerForm.get('confirmPassword')?.reset();
          }
        })
        .catch(error => {
          console.error('💥 Firebase promise error:', error);
          this.isLoading.set(false);
          this.errorMessage.set('Greška u komunikaciji sa serverom');
        });
        
    } catch (error) {
      console.error('💥 Try-catch error:', error);
      this.isLoading.set(false);
      this.errorMessage.set('Neočekivana greška');
    }
    
    setTimeout(() => {
      if (this.isLoading()) {
        console.warn('⚠️ EMERGENCY: Loading stuck for 5s, forcing stop');
        this.isLoading.set(false);
        this.router.navigate(['/login']);
      }
    }, 5000);
  }
  
  goToLogin() {
    console.log('🚀 Manual navigate to login');
    this.isLoading.set(false);
    this.router.navigate(['/login']);
  }
  
  testRegistration() {
    console.log('🧪 Test registration (no Firebase)');
    this.isLoading.set(true);
    
    setTimeout(() => {
      this.isLoading.set(false);
      alert('Test registracije uspješan!');
      this.router.navigate(['/login']);
    }, 1500);
  }
  
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }
  get theme() { return this.registerForm.get('theme'); }
}