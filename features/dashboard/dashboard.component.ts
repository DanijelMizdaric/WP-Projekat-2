import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HabitTrackerComponent } from './widgets/habit-tracker/habit-tracker.component';
import { SleepTrackerComponent } from './widgets/sleep-tracker/sleep-tracker.component';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';

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
	HabitTrackerComponent,
	SleepTrackerComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  private firebaseService = inject(FirebaseService);
  private themeService = inject(ThemeService);
  private router = inject(Router);
  
  sidenavOpen = signal(false);
  
  availableThemes = this.themeService.getAvailableThemes();
  currentTheme = signal(this.themeService.getCurrentTheme());
  

  get user() {
    return this.firebaseService.currentUser();
  }
  
  getUsername(): string {
    const email = this.user?.email;
    if (!email) return 'Korisniče';
    
    return email.split('@')[0] || email;
  }
  
  getShortUsername(): string {
    const username = this.getUsername();
    return username.length > 10 ? username.substring(0, 10) + '...' : username;
  }

  toggleSidenav() {
    this.sidenavOpen.set(!this.sidenavOpen());
  }

  async logout() {
    await this.firebaseService.logout();
    this.router.navigate(['/auth/login']);
  }
  
  changeTheme(themeId: string) {
    this.themeService.setTheme(themeId);
    this.currentTheme.set(this.themeService.getCurrentTheme());
    
    if (this.user) {
      this.firebaseService.saveUserTheme(themeId);
    }
  }
}