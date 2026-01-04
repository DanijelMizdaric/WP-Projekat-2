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
    console.log('🔍 HabitTrackerComponent se učitava');
    console.log('👤 Trenutni korisnik:', this.firebaseService.currentUser());
    
    this.loadHabits();
  }
  
  async loadHabits() {
    this.isLoading.set(true);
    
    // Provjeri da li je korisnik prijavljen
    const userId = this.firebaseService.currentUser()?.uid;
    
    if (userId) {
      // Pokušaj učitati iz Firebase
      try {
        const docs = await this.firebaseService.getCollectionByUID('habits', userId);
        const habits = docs.map((doc: any) => ({
          id: doc.id,
          title: doc['title'],
          completed: doc['completed'] || false,
          createdAt: doc['createdAt']?.toDate?.() || new Date(),
          streak: doc['streak'] || 0
        }));
        
        this.habits.set(habits);
        console.log('✅ Učitano iz Firebase:', habits.length, 'navika');
      } catch (error) {
        console.warn('⚠️ Nije moguće učitati iz Firebase, koristim demo podatke');
        this.loadDemoHabits();
      }
    } else {
      // Demo mod
      console.log('🎮 Demo mod - koristim demo podatke');
      this.loadDemoHabits();
    }
    
    this.isLoading.set(false);
  }
  
  private loadDemoHabits() {
    this.habits.set([
      { id: '1', title: 'Popij 8 čaša vode', completed: true, createdAt: new Date(), streak: 5 },
      { id: '2', title: '1h učenja', completed: false, createdAt: new Date(), streak: 3 },
      { id: '3', title: '30min vežbanja', completed: true, createdAt: new Date(), streak: 7 },
      { id: '4', title: 'Pročitaj 10 strana', completed: false, createdAt: new Date(), streak: 2 },
    ]);
  }
  
  async addHabit() {
    const title = this.newHabitTitle().trim();
    if (!title) return;
    
    console.log('➕ Dodajem naviku:', title);
    
    const newHabit: Habit = {
      id: Date.now().toString(),
      title,
      completed: false,
      createdAt: new Date(),
      streak: 0
    };
    
    // Dodaj lokalno
    this.habits.update(habits => [...habits, newHabit]);
    this.newHabitTitle.set('');
    
    // Pokušaj sačuvati u Firebase ako je korisnik prijavljen
    const userId = this.firebaseService.currentUser()?.uid;
    if (userId) {
      try {
        await this.firebaseService.addDocument('habits', {
          ...newHabit,
          userId: userId
        });
        console.log('✅ Habit sačuvan u Firebase');
      } catch (error: any) {
        console.warn('⚠️ Nije moguće sačuvati u Firebase:', error.message);
      }
    }
  }
  
  // SAMO JEDNA toggleHabit metoda!
  toggleHabit(habit: Habit) {
    console.log('🔄 Toggle navika:', habit.title);
    
    this.habits.update(habits => 
      habits.map(h => 
        h.id === habit.id 
          ? { ...h, completed: !h.completed, streak: !h.completed ? h.streak + 1 : h.streak }
          : h
      )
    );
    
    // Firebase sync samo ako je korisnik prijavljen
    const userId = this.firebaseService.currentUser()?.uid;
    if (userId && habit.id) {
      // Async bez čekanja
      this.firebaseService.updateDocument('habits', habit.id, {
        completed: !habit.completed,
        streak: !habit.completed ? habit.streak + 1 : habit.streak
      }).catch((err: any) => console.warn('Firebase sync failed:', err));
    }
  }
  
  deleteHabit(habitId: string) {
    console.log('🗑️ Brišem naviku:', habitId);
    
    this.habits.update(habits => habits.filter(h => h.id !== habitId));
    
    // Ako FirebaseService nema deleteDocument, koristimo ovu logiku:
    const userId = this.firebaseService.currentUser()?.uid;
    if (userId) {
      // Ako imaš deleteDocument metodu, koristi je:
      // this.firebaseService.deleteDocument('habits', habitId)
      //   .catch((err: any) => console.warn('Firebase delete failed:', err));
      
      console.log('Firebase delete bi ovde bio pozvan');
    }
  }
  
  resetDay() {
    console.log('🔄 Resetujem dan');
    
    this.habits.update(habits => 
      habits.map(habit => ({ ...habit, completed: false }))
    );
    
    // Update u Firebase ako je korisnik prijavljen
    const userId = this.firebaseService.currentUser()?.uid;
    if (userId) {
      // Ovde bi trebalo update-ovati sve navike
      console.log('Firebase reset bi ovde bio implementiran');
    }
  }
}