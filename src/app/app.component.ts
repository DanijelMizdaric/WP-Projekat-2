import { Component, OnInit, effect } from '@angular/core'; // DODAJ effect
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { FirebaseService } from './core/services/firebase.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'WebProjekat';

  constructor(
    private themeService: ThemeService,
    private firebaseService: FirebaseService
  ) {
    // Pratite promene auth stanja KORISTEĆI effect
    effect(() => {
      const user = this.firebaseService.currentUser();
      console.log('🔄 Auth state changed:', user ? user.email : 'Logged out');
    });
  }

  ngOnInit() {
    this.themeService.getCurrentTheme();
    
    // DEBUG: Proveri Firebase stanje
    console.log('🔥 AppComponent initialized');
    console.log('🔐 isAuthenticated:', this.firebaseService.isAuthenticated());
    console.log('👤 currentUser:', this.firebaseService.currentUser());
  }
}