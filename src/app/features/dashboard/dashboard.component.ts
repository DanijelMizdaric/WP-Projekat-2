import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// Angular Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';

// Servisi
import { FirebaseService } from 'src/app/core/services/firebase.service';
import { ThemeService } from 'src/app/core/services/theme.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatCardModule,
    MatGridListModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  private firebaseService = inject(FirebaseService);
  private themeService = inject(ThemeService);
  private router = inject(Router);
  
  // Sidebar stanje
  sidenavOpen = signal(false);
  
  // Dostupne teme
  availableThemes = this.themeService.getAvailableThemes();
  currentTheme = signal(this.themeService.getCurrentTheme());
  
  // User info
  get user() {
    return this.firebaseService.currentUser();
  }
  
  // Toggle sidebar
  toggleSidenav() {
    this.sidenavOpen.set(!this.sidenavOpen());
  }
  
  // Logout
  async logout() {
    await this.firebaseService.logout();
    this.router.navigate(['/auth/login']);
  }
  
  // Promeni temu
  changeTheme(themeId: string) {
    this.themeService.setTheme(themeId);
    this.currentTheme.set(this.themeService.getCurrentTheme());
    
    // Sačuvaj u Firebase ako je korisnik prijavljen
    if (this.user) {
      this.firebaseService.saveUserTheme(themeId);
    }
  }
}