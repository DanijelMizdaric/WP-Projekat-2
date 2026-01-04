

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card'; 

import { FormsModule, ReactiveFormsModule } from '@angular/forms'; 

@Component({
  selector: 'app-contact',
  standalone: true,
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  imports: [
    CommonModule,
    MatCardModule, 
    FormsModule, 
    ReactiveFormsModule
  ]
})
export class ContactComponent {
  
}