import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from '../core/services/firebase.service';

@Component({
  selector: 'app-test-firebase',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="test-container" *ngIf="!isLoggedIn; else dashboard">
      <h2>🔥 Test Firebase Auth</h2>
      
      <!-- REGISTRACIJA -->
      <div class="form-section">
        <h3>Registracija</h3>
        <input [(ngModel)]="regEmail" placeholder="Email" />
        <input [(ngModel)]="regPassword" type="password" placeholder="Lozinka" />
        <button (click)="register()" [disabled]="loading">
          {{ loading ? 'U toku...' : 'Registruj se' }}
        </button>
      </div>
      
      <!-- LOGIN -->
      <div class="form-section">
        <h3>Login</h3>
        <input [(ngModel)]="loginEmail" placeholder="Email" />
        <input [(ngModel)]="loginPassword" type="password" placeholder="Lozinka" />
        <button (click)="login()" [disabled]="loading">
          {{ loading ? 'U toku...' : 'Prijavi se' }}
        </button>
      </div>
      
      <p *ngIf="message" class="message">{{ message }}</p>
    </div>

    <ng-template #dashboard>
      <div class="dashboard">
        <h2>👋 Dobrodošao, {{ userEmail }}!</h2>
        <button (click)="logout()">Odjavi se</button>
        <button (click)="saveTheme()">Sačuvaj temu "blue"</button>
        <button (click)="loadTheme()">Učitaj temu</button>
        <p *ngIf="message">{{ message }}</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .test-container { padding: 20px; max-width: 400px; margin: 0 auto; }
    .form-section { margin: 20px 0; padding: 15px; border: 1px solid #ccc; }
    input { display: block; width: 100%; margin: 10px 0; padding: 8px; }
    button { padding: 10px 15px; margin-right: 10px; }
    .message { color: green; margin-top: 10px; }
    .dashboard { padding: 20px; }
  `]
})
export class TestFirebaseComponent {
  firebaseService = inject(FirebaseService);
  
  // Form podaci
  regEmail = 'test@example.com';
  regPassword = 'test123';
  loginEmail = 'test@example.com';
  loginPassword = 'test123';
  
  // Stanje
  message = '';
  loading = false;
  
  // Ispravno - kao getter metode
  get isLoggedIn() {
    return this.firebaseService.isAuthenticated();
  }
  
  get userEmail() {
    return this.firebaseService.currentUser()?.email || '';
  }

  async register() {
    this.loading = true;
    this.message = '';
    
    const result = await this.firebaseService.register(
      this.regEmail, 
      this.regPassword
    );
    
    this.loading = false;
    this.message = result.success 
      ? '✅ Registracija uspešna!' 
      : `❌ ${result.error}`;
  }

  async login() {
    this.loading = true;
    this.message = '';
    
    const result = await this.firebaseService.login(
      this.loginEmail, 
      this.loginPassword
    );
    
    this.loading = false;
    this.message = result.success 
      ? '✅ Prijava uspešna!' 
      : `❌ ${result.error}`;
  }

  async logout() {
    await this.firebaseService.logout();
    this.message = 'Odjavljen si.';
  }

  async saveTheme() {
    await this.firebaseService.saveUserTheme('blue');
    this.message = 'Tema "blue" sačuvana!';
  }

  async loadTheme() {
    const theme = await this.firebaseService.loadUserTheme();
    this.message = theme 
      ? `Učitana tema: ${theme}` 
      : 'Nema sačuvane teme.';
  }
}