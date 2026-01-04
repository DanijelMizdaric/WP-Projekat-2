import { Injectable, signal, computed } from '@angular/core';
import { HabitTrackerComponent } from 'src/app/features/dashboard/widgets/habit-tracker/habit-tracker.component';
import { SleepTrackerComponent } from 'src/app/features/dashboard/widgets/sleep-tracker/sleep-tracker.component';

export interface WidgetConfig {
  id: string;
  title: string;
  description: string;
  icon: string;
  component: any;
  enabled: boolean;
  order: number;
  size: 'small' | 'medium' | 'large';
  category: 'productivity' | 'health' | 'finance' | 'learning';
  route?: string;
}

@Injectable({
  providedIn: 'root'
})
export class WidgetService {
  private readonly STORAGE_KEY = 'ipi_dashboard_widgets';
  
  // Svi dostupni widget-i
  private allWidgets: WidgetConfig[] = [
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
      id: 'study-planner',
      title: 'Study Planner',
      description: 'Planiraj sate učenja i prati napredak',
      icon: 'school',
      component: null,
      enabled: false,
      order: 3,
      size: 'small',
      category: 'learning'
    },
    {
      id: 'water-tracker',
      title: 'Water Intake',
      description: 'Prati unos vode tokom dana',
      icon: 'local_drink',
      component: null,
      enabled: false,
      order: 4,
      size: 'small',
      category: 'health'
    },
    {
      id: 'mood-tracker',
      title: 'Mood Tracker',
      description: 'Bilježi svoje raspoloženje tokom dana',
      icon: 'mood',
      component: null,
      enabled: false,
      order: 5,
      size: 'small',
      category: 'health'
    },
    {
      id: 'finance-tracker',
      title: 'Finance Tracker',
      description: 'Prati troškove i budžet',
      icon: 'account_balance_wallet',
      component: null,
      enabled: false,
      order: 6,
      size: 'large',
      category: 'finance'
    }
  ];

  // Signal za widget-e
  private widgetsSignal = signal<WidgetConfig[]>([]);
  
  // Computed vrijednosti
  activeWidgets = computed(() => 
    this.widgetsSignal().filter(w => w.enabled).sort((a, b) => a.order - b.order)
  );
  
  availableWidgets = computed(() => 
    this.widgetsSignal().filter(w => !w.enabled).sort((a, b) => a.order - b.order)
  );

  constructor() {
    this.loadWidgets();
  }

  private loadWidgets(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      
      if (saved) {
        // Učitaj sačuvane postavke
        const savedConfigs: Partial<WidgetConfig>[] = JSON.parse(saved);
        
        // Mapiraj sačuvane postavke na default widget-e
        const mergedWidgets = this.allWidgets.map(widget => {
          const savedWidget = savedConfigs.find(sw => sw.id === widget.id);
          if (savedWidget) {
            return {
              ...widget,
              enabled: savedWidget.enabled ?? widget.enabled,
              order: savedWidget.order ?? widget.order,
              size: savedWidget.size ?? widget.size
            };
          }
          return widget;
        });
        
        this.widgetsSignal.set(mergedWidgets);
      } else {
        // Prvi put - koristi default
        this.widgetsSignal.set([...this.allWidgets]);
        this.saveWidgets();
      }
    } catch (error) {
      console.error('Greška pri učitavanju widget-a:', error);
      this.widgetsSignal.set([...this.allWidgets]);
    }
  }

  private saveWidgets(): void {
    try {
      // Sačuvaj samo konfiguraciju, ne komponente
      const configsToSave = this.widgetsSignal().map(w => ({
        id: w.id,
        enabled: w.enabled,
        order: w.order,
        size: w.size
      }));
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(configsToSave));
    } catch (error) {
      console.error('Greška pri čuvanju widget-a:', error);
    }
  }

  // Public metode
  toggleWidget(widgetId: string): void {
    this.widgetsSignal.update(widgets =>
      widgets.map(widget =>
        widget.id === widgetId 
          ? { ...widget, enabled: !widget.enabled }
          : widget
      )
    );
    this.saveWidgets();
  }

  updateWidgetOrder(widgetId: string, newOrder: number): void {
    this.widgetsSignal.update(widgets => {
      const updated = widgets.map(widget =>
        widget.id === widgetId 
          ? { ...widget, order: newOrder }
          : widget
      );
      return updated.sort((a, b) => a.order - b.order);
    });
    this.saveWidgets();
  }

  getWidgetById(id: string): WidgetConfig | undefined {
    return this.widgetsSignal().find(w => w.id === id);
  }

  resetToDefault(): void {
    this.widgetsSignal.set([...this.allWidgets]);
    this.saveWidgets();
  }
}