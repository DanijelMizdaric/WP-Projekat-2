import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WidgetService, WidgetConfig } from '../widget.service';

import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-widget-selector',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './widget-selector.component.html',
  styleUrls: ['./widget-selector.component.scss']
})
export class WidgetSelectorComponent {
  public widgetService = inject(WidgetService);
  private dialogRef = inject(MatDialogRef<WidgetSelectorComponent>);
  
  availableWidgets = this.widgetService.availableWidgets;
  activeWidgets = this.widgetService.activeWidgets;
  
  toggleWidget(widget: WidgetConfig): void {
    this.widgetService.toggleWidget(widget.id);
  }
  
  getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      'productivity': '#27ae60',
      'health': '#3498db',
      'finance': '#e74c3c',
      'learning': '#9b59b6'
    };
    return colors[category] || '#95a5a6';
  }
  
  getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      'productivity': 'rocket_launch',
      'health': 'favorite',
      'finance': 'paid',
      'learning': 'school'
    };
    return icons[category] || 'widgets';
  }
  
  close(): void {
    this.dialogRef.close();
  }
}