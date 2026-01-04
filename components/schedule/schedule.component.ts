import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-schedule',
  standalone: true,
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss'],
  imports: [
    CommonModule,
    MatCardModule 
  ]
})
export class ScheduleComponent {

}