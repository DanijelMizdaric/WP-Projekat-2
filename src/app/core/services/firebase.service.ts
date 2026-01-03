import { Injectable, signal } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  User,
  Auth
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc,
  Firestore 
} from 'firebase/firestore';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private app;
  private auth: Auth;
  private db: Firestore;
  
  // Signal za praćenje trenutnog korisnika (moderni Angular pristup)
  currentUser = signal<User | null>(null);
  isLoading = signal<boolean>(false);

  constructor() {
    // 1. Inicijalizuj Firebase
    this.app = initializeApp(environment.firebaseConfig);
    
    // 2. Inicijalizuj Auth
    this.auth = getAuth(this.app);
    
    // 3. Inicijalizuj Firestore
    this.db = getFirestore(this.app);
    
    // 4. Pratite stanje autentifikacije
    this.setupAuthListener();
  }

  private setupAuthListener(): void {
    onAuthStateChanged(this.auth, (user) => {
      this.currentUser.set(user);
      console.log('Auth stanje:', user ? `Prijavljen: ${user.email}` : 'Odjavljen');
      
      // Automatski učitaj temu kada se korisnik prijavi
      if (user) {
        this.loadUserTheme();
      }
    });
  }

  // REGISTRACIJA
  async register(email: string, password: string, themeId: string = 'green') {
    this.isLoading.set(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth, 
        email, 
        password
      );
      
      // Sačuvaj temu korisnika prilikom registracije
      await this.saveUserTheme(themeId);
      
      console.log('✅ Korisnik registrovan:', userCredential.user.email);
      return { success: true, user: userCredential.user };
    } catch (error: any) {
      console.error('❌ Greška pri registraciji:', error.message);
      return { 
        success: false, 
        error: this.getFriendlyError(error.code) 
      };
    } finally {
      this.isLoading.set(false);
    }
  }

  // LOGIN
  async login(email: string, password: string) {
    this.isLoading.set(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth, 
        email, 
        password
      );
      console.log('✅ Korisnik prijavljen:', userCredential.user.email);
      return { success: true, user: userCredential.user };
    } catch (error: any) {
      console.error('❌ Greška pri prijavi:', error.message);
      return { 
        success: false, 
        error: this.getFriendlyError(error.code) 
      };
    } finally {
      this.isLoading.set(false);
    }
  }

  // LOGOUT
  async logout() {
    try {
      await signOut(this.auth);
      console.log('✅ Korisnik odjavljen');
      return { success: true };
    } catch (error: any) {
      console.error('❌ Greška pri odjavi:', error.message);
      return { success: false, error: error.message };
    }
  }

  // TEME: Sačuvaj temu korisnika u Firestore
  async saveUserTheme(themeId: string) {
    const user = this.currentUser();
    if (!user) {
      console.warn('⚠️ Nema prijavljenog korisnika za čuvanje teme');
      return;
    }
    
    try {
      await setDoc(doc(this.db, 'userThemes', user.uid), {
        userId: user.uid,
        theme: themeId,
        email: user.email,
        updatedAt: new Date().toISOString()
      }, { merge: true }); // merge ažurira samo promenjena polja
      
      console.log('🎨 Tema sačuvana:', themeId);
    } catch (error) {
      console.error('❌ Greška pri čuvanju teme:', error);
    }
  }

  // TEME: Učitaj temu korisnika iz Firestore
  async loadUserTheme(): Promise<string | null> {
    const user = this.currentUser();
    if (!user) return null;
    
    try {
      const themeDoc = await getDoc(doc(this.db, 'userThemes', user.uid));
      if (themeDoc.exists()) {
        const themeId = themeDoc.data()['theme'];
        console.log('🎨 Tema učitana iz baze:', themeId);
        return themeId;
      }
      return null;
    } catch (error) {
      console.error('❌ Greška pri učitavanju teme:', error);
      return null;
    }
  }

  // POMOĆNA: Pretvori Firebase greške u čitljive poruke
  private getFriendlyError(errorCode: string): string {
    const errors: { [key: string]: string } = {
      'auth/email-already-in-use': 'Email adresa je već u upotrebi.',
      'auth/invalid-email': 'Email adresa nije validna.',
      'auth/weak-password': 'Lozinka mora imati najmanje 6 karaktera.',
      'auth/user-not-found': 'Korisnik sa ovim email-om ne postoji.',
      'auth/wrong-password': 'Pogrešna lozinka.',
      'auth/too-many-requests': 'Previše neuspelih pokušaja. Pokušajte kasnije.'
    };
    
    return errors[errorCode] || 'Došlo je do greške. Pokušajte ponovo.';
  }

  // GETTERI
  getAuthInstance(): Auth {
    return this.auth;
  }
  
  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }
}