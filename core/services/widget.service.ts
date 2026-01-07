import { Injectable, signal, computed, effect } from '@angular/core';
import { HabitTrackerComponent } from 'src/app/features/dashboard/widgets/habit-tracker/habit-tracker.component';
import { SleepTrackerComponent } from 'src/app/features/dashboard/widgets/sleep-tracker/sleep-tracker.component';
import { StudentFunZoneComponent } from 'src/app/student-fun-zone/student-fun-zone.component';

export interface WidgetConfig {
  id: string;
  title: string;
  description: string;
  icon: string;
  component: any;
  enabled: boolean;
  order: number;
  size: 'small' | 'medium' | 'large';
  category: 'productivity' | 'health' | 'finance' | 'learning' | 'entertainment';
  route?: string;
}

@Injectable({
  providedIn: 'root'
})
export class WidgetService {
  private readonly STORAGE_KEY = 'ipi_dashboard_widgets';
  
  // Default widgeti - samo 3
  private defaultWidgets: WidgetConfig[] = [
    {
      id: 'habit-tracker',
      title: 'Habit Tracker',
      description: 'Prati svoje dnevne navike i gradi bolje rutine',
      icon: 'check_circle',
      component: HabitTrackerComponent,
      enabled: true,
      order: 1,
      size: 'large',
      category: 'productivity',
      route: '/dashboard/habits'
    },
    {
      id: 'sleep-tracker',
      title: 'Sleep Tracker',
      description: 'Prati obrasce spavanja i kvalitet sna',
      icon: 'bedtime',
      component: SleepTrackerComponent,
      enabled: true,
      order: 2,
      size: 'medium',
      category: 'health',
      route: '/dashboard/sleep'
    },
    {
      id: 'student-funzone',
      title: 'Student Fun Zone',
      description: 'Igre i alati za zabavu i produktivnost',
      icon: 'sports_esports',
      component: StudentFunZoneComponent,
      enabled: true,
      order: 3,
      size: 'large',
      category: 'entertainment'
    }
  ];

  // Signal koji drži stanje svih widgeta
  private widgetsSignal = signal<WidgetConfig[]>([]);
  
  // Computed vrijednosti - automatski se ažuriraju kada se signal promijeni
  activeWidgets = computed(() => {
    const widgets = this.widgetsSignal();
    return widgets
      .filter(w => w.enabled)
      .sort((a, b) => a.order - b.order);
  });
  
  availableWidgets = computed(() => {
    const widgets = this.widgetsSignal();
    return widgets
      .filter(w => !w.enabled)
      .sort((a, b) => a.order - b.order);
  });

  constructor() {

    this.loadWidgets();
    

    effect(() => {
      this.saveWidgets();
    });
  }


  private loadWidgets(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      
      if (saved) {
        const savedConfigs: any[] = JSON.parse(saved);
        

        const loadedWidgets = this.defaultWidgets.map(defaultWidget => {
          const savedWidget = savedConfigs.find(s => s.id === defaultWidget.id);
          
          if (savedWidget) {
            return {
              ...defaultWidget,
              enabled: savedWidget.enabled !== undefined ? savedWidget.enabled : defaultWidget.enabled,
              order: savedWidget.order || defaultWidget.order,
              size: savedWidget.size || defaultWidget.size
            };
          }
          
          return defaultWidget;
        });
        
        this.widgetsSignal.set(loadedWidgets);
      } else {
      
        this.widgetsSignal.set([...this.defaultWidgets]);
      }
    } catch (error) {
      console.error('Error loading widgets:', error);
      this.widgetsSignal.set([...this.defaultWidgets]);
    }
  }


  private saveWidgets(): void {
    try {
      const widgets = this.widgetsSignal();
      const configsToSave = widgets.map(w => ({
        id: w.id,
        enabled: w.enabled,
        order: w.order,
        size: w.size
      }));
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(configsToSave));
    } catch (error) {
      console.error('Error saving widgets:', error);
    }
  }


  toggleWidget(widgetId: string): void {
    this.widgetsSignal.update(widgets => {
      return widgets.map(widget => {
        if (widget.id === widgetId) {
          return { ...widget, enabled: !widget.enabled };
        }
        return widget;
      });
    });
  }

  setWidgetEnabled(widgetId: string, enabled: boolean): void {
    this.widgetsSignal.update(widgets => {
      return widgets.map(widget => {
        if (widget.id === widgetId) {
          return { ...widget, enabled };
        }
        return widget;
      });
    });
  }

  updateWidgetOrder(widgetId: string, newOrder: number): void {
    this.widgetsSignal.update(widgets => {
      return widgets.map(widget => {
        if (widget.id === widgetId) {
          return { ...widget, order: newOrder };
        }
        return widget;
      }).sort((a, b) => a.order - b.order);
    });
  }

  getWidgetById(id: string): WidgetConfig | undefined {
    return this.widgetsSignal().find(w => w.id === id);
  }

  resetToDefault(): void {
    this.widgetsSignal.set([...this.defaultWidgets]);
  }
}