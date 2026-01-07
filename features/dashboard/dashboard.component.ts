import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationStart } from '@angular/router';

import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

import { MatDialog } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';

import { HabitTrackerComponent } from './widgets/habit-tracker/habit-tracker.component';
import { SleepTrackerComponent } from './widgets/sleep-tracker/sleep-tracker.component';
import { StudentFunZoneComponent } from 'src/app/student-fun-zone/student-fun-zone.component';

import { FirebaseService } from 'src/app/core/services/firebase.service';
import { ThemeService } from 'src/app/core/services/theme.service';
import { WidgetService, WidgetConfig } from 'src/app/core/services/widget.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatCardModule,
    MatGridListModule,
    MatTooltipModule,
    MatChipsModule,
    HabitTrackerComponent,
    SleepTrackerComponent,
    StudentFunZoneComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private firebaseService = inject(FirebaseService);
  private themeService = inject(ThemeService);
  private widgetService = inject(WidgetService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  
  sidenavOpen = signal(false);
  
  availableThemes = this.themeService.getAvailableThemes();
  currentTheme = signal(this.themeService.getCurrentTheme());
  
  activeWidgets = this.widgetService.activeWidgets;
  
  draggableWidgets = signal<WidgetConfig[]>([]);
  
  activeFullscreenWidget = signal<string | null>(null);
  

  get hasActiveWidgets(): boolean {
    return this.activeWidgets().length > 0;
  }

  get user() {
    return this.firebaseService.currentUser();
  }
  
  ngOnInit(): void {
    this.draggableWidgets.set([...this.activeWidgets()]);
    
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        console.log('🔍 Router event:', event.url);
      }
    });
    
    console.log('=== 🚀 DASHBOARD INIT ===');
    console.log('Aktivni widgeti:', this.activeWidgets().map(w => w.title));
    console.log('========================');
  }

  onWidgetDrop(event: CdkDragDrop<WidgetConfig[]>): void {
    console.log('🧱 Widget dropped:', event.previousIndex, '→', event.currentIndex);
    
    const widgets = [...this.draggableWidgets()];

    moveItemInArray(widgets, event.previousIndex, event.currentIndex);

    this.draggableWidgets.set(widgets);

    this.updateWidgetOrder();
  }

  private updateWidgetOrder(): void {
    const widgets = this.draggableWidgets();
    
    widgets.forEach((widget, index) => {

      this.widgetService.updateWidgetOrder(widget.id, index + 1);
    });
    
    console.log('🔄 Widget order updated:', widgets.map(w => ({ id: w.id, order: w.order })));
  }

  getDisplayWidgets(): WidgetConfig[] {
    return this.draggableWidgets().length > 0 
      ? this.draggableWidgets() 
      : this.activeWidgets();
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

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  async logout() {
    await this.firebaseService.logout();
    this.router.navigate(['/login']);
  }
  
  changeTheme(themeId: string) {
    this.themeService.setTheme(themeId);
    this.currentTheme.set(this.themeService.getCurrentTheme());
    
    if (this.user) {
      this.firebaseService.saveUserTheme(themeId);
    }
  }
  
  openWidgetSelector(): void {
    import('src/app/core/services/widget-selector/widget-selector.component').then(module => {
      this.dialog.open(module.WidgetSelectorComponent, {
        width: '900px',
        maxHeight: '80vh',
        panelClass: 'widget-selector-dialog'
      });
    }).catch(error => {
      console.error('Greška pri učitavanju widget selector komponente:', error);
    });
  }

  getWidgetSizeClass(size: string): string {
    switch(size) {
      case 'large': return 'widget-large';
      case 'medium': return 'widget-medium';
      case 'small': return 'widget-small';
      default: return 'widget-medium';
    }
  }
  
  navigateToWidgetDetails(widgetId: string, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    console.log('🎯 Widget kliknut:', widgetId);
    this.activateWidget(widgetId);
  }
  
  private activateWidget(widgetId: string): void {
    console.log('⚡ Aktiviran widget:', widgetId);
    
    switch(widgetId) {
      case 'habit-tracker':
        this.activateHabitTracker();
        break;
      case 'sleep-tracker':
        this.activateSleepTracker();
        break;
      case 'student-funzone':
        this.activateStudentFunZone();
        break;
      default:
        console.log('ℹ️ Widget funkcionalnost:', widgetId);
    }
  }

  private activateStudentFunZone(): void {
    console.log('🎮 Student Fun Zone aktiviran!');
    this.highlightWidget('student-funzone');
    this.scrollToWidget('student-funzone');
  }
  
  private activateHabitTracker(): void {
    console.log('📝 Habit Tracker aktiviran!');
    this.highlightWidget('habit-tracker');
    this.scrollToWidget('habit-tracker');
  }

  private activateSleepTracker(): void {
    console.log('🛌 Sleep Tracker aktiviran!');
    this.highlightWidget('sleep-tracker');
    this.scrollToWidget('sleep-tracker');
  }
  
  private highlightWidget(widgetId: string): void {
    console.log('🌟 Highlight widget:', widgetId);
    const element = document.getElementById(`widget-${widgetId}`);
    if (element) {
      element.classList.add('widget-active');
      setTimeout(() => {
        element.classList.remove('widget-active');
      }, 2000);
    }
  }

  private scrollToWidget(widgetId: string): void {
    const element = document.getElementById(`widget-${widgetId}`);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  }

  toggleWidgetFullscreen(widgetId: string): void {
    if (this.activeFullscreenWidget() === widgetId) {
      this.activeFullscreenWidget.set(null);
      console.log('📱 Uklonjen fullscreen za:', widgetId);
    } else {
      this.activeFullscreenWidget.set(widgetId);
      console.log('🖥️ Fullscreen aktiviran za:', widgetId);
    }
  }

  isWidgetFullscreen(widgetId: string): boolean {
    return this.activeFullscreenWidget() === widgetId;
  }
}