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
  collection, 
  query,     
  where,      
  getDocs,   
  addDoc,   
  updateDoc, 
  Timestamp, 
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
  
 
  currentUser = signal<User | null>(null);
  isLoading = signal<boolean>(false);

  constructor() {
    
    this.app = initializeApp(environment.firebaseConfig);
    
  
    this.auth = getAuth(this.app);
    
    
    this.db = getFirestore(this.app);
    
    
    this.setupAuthListener();
  }

  private setupAuthListener(): void {
    onAuthStateChanged(this.auth, (user) => {
     
      this.currentUser.set(user); 
      console.log('Auth stanje:', user ? `Prijavljen: ${user.email}` : 'Odjavljen');
      
   
      if (user) {
        this.loadUserTheme();
      }
    });
  }
  
 

 
async register(email: string, password: string, themeId: string = 'green') {
  console.log('🔥 Firebase register START for:', email);
  
  this.isLoading.set(true);
  
  try {
    console.log('📤 Creating user in Firebase...');
    
    const userCredential = await createUserWithEmailAndPassword(
      this.auth, 
      email, 
      password
    );
    
    console.log('✅ Firebase user created:', userCredential.user.email);
    
    
    await this.saveUserTheme(themeId);
    
    console.log('🎨 Theme saved to database');
    
    return { 
      success: true, 
      user: userCredential.user,
      message: 'Registracija uspješna!' 
    };
    
  } catch (error: any) {
    console.error('❌ Firebase register ERROR:', error.code, error.message);
    
    const friendlyError = this.getFriendlyError(error.code);
    console.log('📝 Returning error:', friendlyError);
    
    return { 
      success: false, 
      error: friendlyError 
    };
    
  } finally {
  
    console.log('🔄 Firebase register FINALLY - isLoading = false');
    this.isLoading.set(false);
    
  
    setTimeout(() => {
      if (this.isLoading()) {
        console.error('🚨 CRITICAL: isLoading still true! Forcing false.');
        this.isLoading.set(false);
      }
    }, 100);
  }
}

  
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
      }, { merge: true });
      
      console.log('🎨 Tema sačuvana:', themeId);
    } catch (error) {
      console.error('❌ Greška pri čuvanju teme:', error);
    }
  }

  
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

 
  async getCollectionByUID(collectionName: string, userId: string): Promise<any[]> {
    const collRef = collection(this.db, collectionName);
    const q = query(collRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
   
    return querySnapshot.docs.map((doc: any) => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
  }

 
  async addDocument(collectionName: string, data: any): Promise<string> {
  
    const docData = { ...data, date: Timestamp.fromDate(data.date) };
    
    const docRef = await addDoc(collection(this.db, collectionName), docData);
    return docRef.id;
  }


  async updateDocument(collectionName: string, docId: string, data: any): Promise<void> {
   
    const docData = { ...data, date: Timestamp.fromDate(data.date) };
    
    const docRef = doc(this.db, collectionName, docId);
    await updateDoc(docRef, docData);
  }
  
 
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


  getAuthInstance(): Auth {
    return this.auth;
  }
  

  isAuthenticatedValue(): boolean {
    return this.currentUser() !== null;
  }
}