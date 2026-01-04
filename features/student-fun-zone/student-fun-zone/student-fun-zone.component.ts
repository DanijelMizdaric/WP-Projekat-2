import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';


import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-student-fun-zone',
  standalone: true,
  imports: [
    CommonModule,
    
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatGridListModule,
    MatTooltipModule
  ],
  templateUrl: './student-fun-zone.component.html',
  styleUrls: ['./student-fun-zone.component.scss']
})
export class StudentFunZoneComponent {
 
}