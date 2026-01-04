import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Servisi
import { FirebaseService } from 'src/app/core/services/firebase.service';

export interface SleepRecord {
  id: string;
  date: Date;
  hours: number;
  quality: 1 | 2 | 3 | 4 | 5;
  // 👇 POPRAVKA: Dodali smo '| null' jer Firestore ne podržava 'undefined' za opciona polja.
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
  
  // VRAĆENA LOGIKA ZA GET ACCESSOR-e (ISPRAVNO)
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
    this.loadSleepRecords();
  }
  
  /** Učitava zapise o spavanju iz Firestore-a. */
  async loadSleepRecords() {
    this.isLoading.set(true);
    const userId = this.firebaseService.currentUser()?.uid;
    
    if (!userId) {
        console.error('Korisnik nije prijavljen.');
        this.isLoading.set(false);
        return;
    }

    try {
        const docs = await this.firebaseService.getCollectionByUID('sleepRecords', userId);
        
        const records: SleepRecord[] = docs
            .map((doc: any) => ({
                id: doc.id,
                // Proveravamo da li je date Timestamp (tipično za Firebase) ili već Date
                date: (doc['date'] as any)?.toDate ? (doc['date'] as any).toDate() : new Date(doc['date']),
                hours: doc['hours'],
                quality: doc['quality'],
                // Pošto sada model SleepRecord prihvata null, ovo je sigurno.
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
        
    } catch (error) {
        console.error("Greška pri učitavanju zapisa o spavanju:", error);
        this.sleepRecords.set([]);
    } finally {
        this.isLoading.set(false);
    }
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
  
  /** Dodaje ili ažurira zapis o spavanju u Firestore-u. */
  async addTodaySleep() {
    const userId = this.firebaseService.currentUser()?.uid;
    if (!userId) {
        alert('Morate biti prijavljeni da biste dodali zapis.');
        return;
    }

    const today = new Date();
    const existingRecord = this.sleepRecords().find(r => 
      r.date.toDateString() === today.toDateString()
    );

    const dataToSave: SleepRecord = {
      id: existingRecord?.id || '',
      date: today,
      hours: this.todayHours(),
      quality: this.todayQuality(),
      // ISPRAVLJENO: Prazan string (trim() daje '') postaje null. Sada je kompatibilno sa SleepRecord interfejsom.
      notes: this.todayNotes().trim() || null, 
      userId: userId
    };

    try {
        if (existingRecord && existingRecord.id) {
            await this.firebaseService.updateDocument('sleepRecords', existingRecord.id, dataToSave);
            console.log('✅ Sleep record updated:', existingRecord.id);
        } else {
            const docId = await this.firebaseService.addDocument('sleepRecords', dataToSave);
            dataToSave.id = docId;
            console.log('✅ Sleep record added:', docId);
        }
        
        await this.loadSleepRecords(); 
        
    } catch (error) {
        console.error("❌ Greška pri dodavanju/ažuriranju zapisa:", error);
    }
    
    this.todayNotes.set('');
  }
  
  // VRAĆENA LOGIKA ZA POMOĆNE METODE (ISPRAVNO)
  getDayName(date: Date): string {
    const days = ['Ned', 'Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub'];
    return days[date.getDay()];
  }
  
  getQualityStars(quality: number): string {
    return '★'.repeat(quality) + '☆'.repeat(5 - quality);
  }
}