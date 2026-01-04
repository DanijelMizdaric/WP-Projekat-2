import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { FirebaseService } from 'src/app/core/services/firebase.service';

export interface SleepRecord {
  id: string;
  date: Date;
  hours: number;
  quality: 1 | 2 | 3 | 4 | 5;
  notes?: string | null;
  userId?: string;
}

@Component({
  selector: 'app-sleep-tracker',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSliderModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './sleep-tracker.component.html',
  styleUrls: ['./sleep-tracker.component.scss']
})
export class SleepTrackerComponent {
  private firebaseService = inject(FirebaseService);
  
  sleepRecords = signal<SleepRecord[]>([]);
  isLoading = signal(true);
  
  todayHours = signal(8);
  todayQuality = signal<1 | 2 | 3 | 4 | 5>(3);
  todayNotes = signal('');
  
  get averageHours(): number {
    const records = this.sleepRecords();
    if (records.length === 0) return 0;
    const total = records.reduce((sum, record) => sum + record.hours, 0);
    return Math.round((total / records.length) * 10) / 10;
  }
  
  get sleepGoal(): number {
    return 8;
  }
  
  get goalProgress(): number {
    const avg = this.averageHours;
    return Math.min(Math.round((avg / this.sleepGoal) * 100), 100);
  }
  
  get qualityAverage(): number {
    const records = this.sleepRecords();
    if (records.length === 0) return 0;
    const total = records.reduce((sum, record) => sum + record.quality, 0);
    return Math.round((total / records.length) * 10) / 10;
  }
  
  get recommendation(): string {
    const avg = this.averageHours;
    if (avg >= 7.5 && avg <= 9) return 'Odlično! Optimalan san.';
    if (avg >= 6 && avg < 7.5) return 'Dobar san, ali pokušaj da spavaš još malo.';
    if (avg > 9) return 'Previše spavanja. Probaj 8-9 sati.';
    return 'Nedovoljno spavanja. Ciljaj 8 sati.';
  }
  
  get qualityIcon(): string {
    const avg = this.qualityAverage;
    if (avg >= 4) return 'sentiment_very_satisfied';
    if (avg >= 3) return 'sentiment_satisfied';
    if (avg >= 2) return 'sentiment_neutral';
    return 'sentiment_dissatisfied';
  }
  
  constructor() {
    console.log('🔍 SleepTrackerComponent se učitava');
    console.log('👤 Trenutni korisnik:', this.firebaseService.currentUser());
    this.loadSleepRecords();
  }
  
  async loadSleepRecords() {
    this.isLoading.set(true);
    const userId = this.firebaseService.currentUser()?.uid;
    
    if (!userId) {
      console.log('🎮 Demo mod - koristim demo podatke');
      this.loadDemoRecords();
      this.isLoading.set(false);
      return;
    }

    try {
      const docs = await this.firebaseService.getCollectionByUID('sleepRecords', userId);
      
      const records: SleepRecord[] = docs
        .map((doc: any) => ({
          id: doc.id,
          date: (doc['date'] as any)?.toDate ? (doc['date'] as any).toDate() : new Date(doc['date']),
          hours: doc['hours'],
          quality: doc['quality'],
          notes: doc['notes'] || null,
          userId: doc['userId']
        }))
        .filter((record: SleepRecord) => { 
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(new Date().getDate() - 7); 
          return record.date >= oneWeekAgo;
        })
        .sort((a: SleepRecord, b: SleepRecord) => a.date.getTime() - b.date.getTime());

      this.sleepRecords.set(records);
      console.log('✅ Učitano iz Firebase:', records.length, 'zapisa');
      
    } catch (error: any) {
      console.error("❌ Greška pri učitavanju:", error.message);
      this.loadDemoRecords();
    } finally {
      this.isLoading.set(false);
    }
  }
  
  private loadDemoRecords() {
    const demoRecords: SleepRecord[] = [
      { id: '1', date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), hours: 7.5, quality: 4, notes: 'Dobar san' },
      { id: '2', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), hours: 8, quality: 5, notes: 'Odlično' },
      { id: '3', date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), hours: 6.5, quality: 3, notes: 'Prekinut san' },
      { id: '4', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), hours: 8.5, quality: 4, notes: null },
      { id: '5', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), hours: 7, quality: 3, notes: 'Kasno legao' },
      { id: '6', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), hours: 9, quality: 5, notes: 'Vikend' },
    ];
    
    this.sleepRecords.set(demoRecords);
    console.log('📊 Demo podaci učitani');
  }
  
  increaseHours() {
    this.todayHours.update(h => Math.min(12, h + 0.5));
  }
  
  decreaseHours() {
    this.todayHours.update(h => Math.max(4, h - 0.5));
  }
  
  setQuality(quality: number) {
    this.todayQuality.set(quality as 1 | 2 | 3 | 4 | 5);
  }
  
  async addTodaySleep() {
    console.log('➕ Dodajem današnje spavanje...');
    
    const userId = this.firebaseService.currentUser()?.uid;
    const today = new Date();
    
    // Pronađi postojeći zapis za danas
    const existingRecord = this.sleepRecords().find(r => 
      r.date.toDateString() === today.toDateString()
    );

    // Kreiraj novi zapis
    const newRecord: SleepRecord = {
      id: existingRecord?.id || Date.now().toString(),
      date: today,
      hours: this.todayHours(),
      quality: this.todayQuality(),
      notes: this.todayNotes().trim() || null,
      userId: userId || 'demo-user'
    };
    
    // Dodaj/update lokalno
    if (existingRecord) {
      this.sleepRecords.update(records => 
        records.map(r => r.id === existingRecord.id ? newRecord : r)
      );
      console.log('✅ Sleep record updated locally');
    } else {
      this.sleepRecords.update(records => [...records, newRecord]);
      console.log('✅ Sleep record added locally');
    }
    
    // Reset form
    this.todayNotes.set('');
    
    // Firebase sync SAMO ako je korisnik prijavljen
    if (userId) {
      try {
        if (existingRecord && existingRecord.id) {
          await this.firebaseService.updateDocument('sleepRecords', existingRecord.id, newRecord);
          console.log('✅ Updated in Firebase');
        } else {
          await this.firebaseService.addDocument('sleepRecords', newRecord);
          console.log('✅ Added to Firebase');
        }
      } catch (error: any) {
        console.warn('⚠️ Firebase sync failed:', error.message);
      }
    }
  }
  
  getDayName(date: Date): string {
    const days = ['Ned', 'Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub'];
    return days[date.getDay()];
  }
  
  getQualityStars(quality: number): string {
    return '★'.repeat(quality) + '☆'.repeat(5 - quality);
  }
}