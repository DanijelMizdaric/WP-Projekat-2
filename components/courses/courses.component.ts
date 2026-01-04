

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card'; 

@Component({
  selector: 'app-courses',
  standalone: true,
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.scss'],
  imports: [
    CommonModule,
    MatCardModule,
  ]
})
export class CoursesComponent {

}