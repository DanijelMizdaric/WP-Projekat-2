import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';


import { FirebaseService } from 'src/app/core/services/firebase.service';

export interface Habit {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  streak: number; 
}

@Component({
  selector: 'app-habit-tracker',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
	RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatCheckboxModule,
    MatProgressBarModule,
  ],
  templateUrl: './habit-tracker.component.html',
  styleUrls: ['./habit-tracker.component.scss']
})
export class HabitTrackerComponent {
  private firebaseService = inject(FirebaseService);
  
 
  habits = signal<Habit[]>([]);
  newHabitTitle = signal('');
  isLoading = signal(true);
  
 
  get completionPercentage(): number {
    const completed = this.habits().filter(h => h.completed).length;
    const total = this.habits().length || 1;
    return Math.round((completed / total) * 100);
  }
  
  get streakCount(): number {
    return this.habits().reduce((max, habit) => Math.max(max, habit.streak), 0);
  }
  
  constructor() {
    this.loadHabits();
  }
  
  async loadHabits() {
    this.isLoading.set(true);
    
   
    setTimeout(() => {
      this.habits.set([
        { id: '1', title: 'Popij 8 čaša vode', completed: true, createdAt: new Date(), streak: 5 },
        { id: '2', title: '1h učenja', completed: false, createdAt: new Date(), streak: 3 },
        { id: '3', title: '30min vežbanja', completed: true, createdAt: new Date(), streak: 7 },
        { id: '4', title: 'Pročitaj 10 strana', completed: false, createdAt: new Date(), streak: 2 },
      ]);
      this.isLoading.set(false);
    }, 500);
  }
  
  addHabit() {
    const title = this.newHabitTitle().trim();
    if (!title) return;
    
    const newHabit: Habit = {
      id: Date.now().toString(),
      title,
      completed: false,
      createdAt: new Date(),
      streak: 0
    };
    
    this.habits.update(habits => [...habits, newHabit]);
    this.newHabitTitle.set('');
    
   
    console.log('Habit dodan:', newHabit);
  }
  
  toggleHabit(habit: Habit) {
    this.habits.update(habits => 
      habits.map(h => 
        h.id === habit.id 
          ? { ...h, completed: !h.completed, streak: !h.completed ? h.streak + 1 : h.streak }
          : h
      )
    );
    
    
    console.log('Habit ažuriran:', habit);
  }
  
  deleteHabit(habitId: string) {
    this.habits.update(habits => habits.filter(h => h.id !== habitId));
    
   
    console.log('Habit obrisan:', habitId);
  }
  
  resetDay() {
    this.habits.update(habits => 
      habits.map(habit => ({ ...habit, completed: false }))
    );
    
   
    console.log('Dan resetovan');
  }
}