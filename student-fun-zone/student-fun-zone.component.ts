// src/app/student-fun-zone/student-fun-zone.component.ts
import { Component, inject, signal, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

interface FunZoneApp {
  id: string;
  title: string;
  description: string;
  icon: string;
  htmlFile: string;
  cssFiles?: string[];
  jsFiles?: string[];
  category: 'game' | 'productivity' | 'creative';
}

@Component({
  selector: 'app-student-fun-zone',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatSelectModule,
    MatTooltipModule
  ],
  templateUrl: './student-fun-zone.component.html',
  styleUrl: './student-fun-zone.component.scss'
})
export class StudentFunZoneComponent implements AfterViewInit {
  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);
  private elementRef = inject(ElementRef);
  
  @ViewChild('appContainer') appContainer!: ElementRef<HTMLDivElement>;
  
  apps: FunZoneApp[] = [
    {
      id: 'bingo',
      title: 'Bingo Challenge',
      description: 'Pronađite osobe koje odgovaraju opisima u ćelijama',
      icon: 'casino',
      htmlFile: 'assets/funzone/Bingo/bingo.html',
      cssFiles: ['assets/funzone/Bingo/style.css'],
      jsFiles: [],
      category: 'game'
    },
    {
      id: 'quiz',
      title: 'Kviz',
      description: 'Testirajte svoje znanje o HTML-u i osnovama weba',
      icon: 'quiz',
      htmlFile: 'assets/funzone/Kviz/quiz.html',
      cssFiles: ['assets/funzone/Kviz/style.css'],
      jsFiles: [],
      category: 'game'
    },
    {
      id: 'kanban',
      title: 'Kanban Ploča',
      description: 'Organizuj zadatke sa Kanban tablom',
      icon: 'view_column',
      htmlFile: 'assets/funzone/Kanban/index1.html',
      cssFiles: ['assets/funzone/Kanban/style1.css'],
      jsFiles: ['assets/funzone/Kanban/javascript1.js'],
      category: 'productivity'
    },
    {
      id: 'visionboard',
      title: 'Vision Board',
      description: 'Kreirajte svoj motivacioni vision board',
      icon: 'dashboard',
      htmlFile: 'assets/funzone/Visionboard/index2.html',
      cssFiles: ['assets/funzone/Visionboard/style2.css'],
      jsFiles: ['assets/funzone/Visionboard/javascript2.js'],
      category: 'creative'
    },
    {
      id: 'whiteboard',
      title: 'Interaktivni Whiteboard',
      description: 'Crtajte, dizajnirajte i izražavajte kreativnost',
      icon: 'edit',
      htmlFile: 'assets/funzone/whiteboard/index3.html',
      cssFiles: ['assets/funzone/whiteboard/style3.css'],
      jsFiles: ['assets/funzone/whiteboard/javascript3.js'],
      category: 'creative'
    }
  ];
  

  currentAppId = signal<string>('');
  isFullscreen = signal(false);
  showAppGrid = signal(false);
  isLoading = signal(false);
  appContent = signal<SafeHtml>('');
  fileStatus = signal<{html: boolean, css: boolean, js: boolean} | null>(null);
  
  ngAfterViewInit(): void {
    console.log('🚀 Student Fun Zone komponenta inicijalizovana');
    this.testFileAccess();
    
    const lastApp = localStorage.getItem('funzone_last_app');
    if (lastApp && this.apps.some(app => app.id === lastApp)) {
      setTimeout(() => this.loadApp(lastApp), 100);
    }
  }

  async testFileAccess(): Promise<void> {
    console.log('🔍 Testiranje dostupnosti Fun Zone fajlova...');
    
    for (const app of this.apps) {
      console.log(`\n📂 Aplikacija: ${app.title} (${app.id})`);
      
      try {
 
        const htmlResponse = await fetch(app.htmlFile, { method: 'HEAD' });
        console.log(`  📄 HTML: ${app.htmlFile} - ${htmlResponse.ok ? '✅ POSTOJI' : '❌ NEMA'}`);
        
        if (app.cssFiles) {
          for (const cssFile of app.cssFiles) {
            const cssResponse = await fetch(cssFile, { method: 'HEAD' });
            console.log(`  🎨 CSS: ${cssFile} - ${cssResponse.ok ? '✅ POSTOJI' : '❌ NEMA'}`);
          }
        }
        
        
        if (app.jsFiles) {
          for (const jsFile of app.jsFiles) {
            const jsResponse = await fetch(jsFile, { method: 'HEAD' });
            console.log(`  ⚡ JS: ${jsFile} - ${jsResponse.ok ? '✅ POSTOJI' : '❌ NEMA'}`);
          }
        }
        
      } catch (error) {
        console.error(`  ❌ Greška prilikom testiranja ${app.id}:`, error);
      }
    }
  }
  
  async loadApp(appId: string): Promise<void> {
    this.currentAppId.set(appId);
    this.showAppGrid.set(false);
    this.isLoading.set(true);
    this.fileStatus.set(null);
    localStorage.setItem('funzone_last_app', appId);
    
    console.log(`\n🎮 POKREĆEM APLIKACIJU: ${appId}`);
    console.log(`📍 Trenutna putanja: ${window.location.href}`);
    
    try {
      await this.verifyAppFiles(appId);
      await this.loadAppContent(appId);
      console.log(`✅ Aplikacija ${appId} uspješno učitana`);
    } catch (error) {
      console.error(`❌ Greška pri učitavanju aplikacije ${appId}:`, error);
      this.showError(appId, error);
    } finally {
      this.isLoading.set(false);
    }
  }
  
  private async verifyAppFiles(appId: string): Promise<void> {
    const app = this.getCurrentApp();
    if (!app) throw new Error(`Aplikacija ${appId} nije pronađena`);
    
    console.log(`🔍 Verifikacija fajlova za: ${app.title}`);
    
    const status = {
      html: false,
      css: false,
      js: false
    };
    
    try {

      const htmlResponse = await fetch(app.htmlFile, { method: 'GET' });
      status.html = htmlResponse.ok;
      console.log(`  📄 HTML (${app.htmlFile}): ${htmlResponse.status} ${htmlResponse.ok ? '✅' : '❌'}`);

      if (app.cssFiles && app.cssFiles.length > 0) {
        const cssResponse = await fetch(app.cssFiles[0], { method: 'GET' });
        status.css = cssResponse.ok;
        console.log(`  🎨 CSS (${app.cssFiles[0]}): ${cssResponse.status} ${cssResponse.ok ? '✅' : '❌'}`);
      }
      
      if (app.jsFiles && app.jsFiles.length > 0) {
        const jsResponse = await fetch(app.jsFiles[0], { method: 'GET' });
        status.js = jsResponse.ok;
        console.log(`  ⚡ JS (${app.jsFiles[0]}): ${jsResponse.status} ${jsResponse.ok ? '✅' : '❌'}`);
      }
      
      this.fileStatus.set(status);
      
      if (!status.html) {
        throw new Error(`HTML fajl nije pronađen: ${app.htmlFile}`);
      }
      
    } catch (error) {
      console.error('❌ Greška prilikom verifikacije fajlova:', error);
      throw error;
    }
  }
  
  private async loadAppContent(appId: string): Promise<void> {
    const app = this.getCurrentApp();
    if (!app) throw new Error('Aplikacija nije pronađena');
    
    console.log(`📥 Učitavam sadržaj iz: ${app.htmlFile}`);
    
    try {
   
      const htmlContent = await this.http.get(app.htmlFile, { 
        responseType: 'text',
        headers: { 'Cache-Control': 'no-cache' }
      }).toPromise();
      
      if (!htmlContent) throw new Error('HTML content not found');
      
      console.log(`✅ HTML učitan (${htmlContent.length} karaktera)`);
      
      let fullHtml = this.prepareFullHtml(htmlContent, app);
      
      this.appContent.set(this.sanitizer.bypassSecurityTrustHtml(fullHtml));
      
      setTimeout(() => this.loadExternalScripts(app), 300);
      
    } catch (error) {
      console.error('❌ Greška pri učitavanju HTML-a:', error);
      throw error;
    }
  }
  
  private prepareFullHtml(htmlContent: string, app: FunZoneApp): string {
    let fullHtml = htmlContent;
    
    if (!fullHtml.includes('<base')) {
      const baseTag = `<base href="/${app.htmlFile.split('/').slice(0, -1).join('/')}/">`;
      fullHtml = fullHtml.replace('<head>', `<head>${baseTag}`);
    }
    
    if (app.cssFiles && app.cssFiles.length > 0) {
      const cssLinks = app.cssFiles.map(cssFile => 
        `<link rel="stylesheet" href="${cssFile}">`
      ).join('\n');
      
      if (fullHtml.includes('</head>')) {
        fullHtml = fullHtml.replace('</head>', `${cssLinks}\n</head>`);
      } else if (fullHtml.includes('<head>')) {
        fullHtml = fullHtml.replace('<head>', `<head>${cssLinks}`);
      } else {
        fullHtml = `<head>${cssLinks}</head>\n${fullHtml}`;
      }
    }
    
    return fullHtml;
  }
  
  private loadExternalScripts(app: FunZoneApp): void {
    console.log(`⚡ Učitavam eksterne skripte za: ${app.title}`);
    
    if (!app.jsFiles || app.jsFiles.length === 0) {
      console.log('ℹ️ Nema eksternih skripti za učitavanje');
      return;
    }
    
    const container = this.appContainer?.nativeElement;
    if (!container) {
      console.warn('⚠️ App container nije pronađen');
      return;
    }
    
    const oldScripts = container.querySelectorAll('script[data-funzone]');
    oldScripts.forEach(script => script.remove());
    
    app.jsFiles.forEach((jsFile, index) => {
      console.log(`  📦 Učitavam skriptu ${index + 1}: ${jsFile}`);
      
      const script = document.createElement('script');
      script.src = jsFile;
      script.type = 'text/javascript';
      script.async = true;
      script.setAttribute('data-funzone', 'true');
      
      script.onload = () => console.log(`    ✅ Skripta učitana: ${jsFile}`);
      script.onerror = (error) => {
        console.error(`    ❌ Greška pri učitavanju skripte: ${jsFile}`, error);
        console.log(`    ℹ️ Pokušavam alternativni način...`);
        this.loadScriptFallback(jsFile, container);
      };
      
      container.appendChild(script);
    });
  }
  
  private loadScriptFallback(jsFile: string, container: HTMLElement): void {

    this.http.get(jsFile, { responseType: 'text' }).subscribe({
      next: (jsContent) => {
        console.log(`    🔄 Učitavam skriptu alternativnim putem: ${jsFile}`);
        const script = document.createElement('script');
        script.textContent = jsContent;
        script.setAttribute('data-funzone-fallback', 'true');
        container.appendChild(script);
      },
      error: (error) => {
        console.error(`    💥 Ne mogu učitati skriptu ni na jedan način: ${jsFile}`, error);
      }
    });
  }
  
  private showError(appId: string, error: any): void {
    const app = this.getCurrentApp();
    const errorHtml = `
      <div class="funzone-error">
        <div style="text-align: center; padding: 40px; max-width: 500px; margin: 0 auto;">
          <h3 style="color: #e74c3c;">⚠️ Greška pri učitavanju aplikacije</h3>
          <p><strong>${app?.title || appId}</strong> ne može biti učitana.</p>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: left;">
            <p style="margin: 5px 0;"><strong>Detalji:</strong></p>
            <p style="margin: 5px 0; font-size: 14px; color: #666;">${error.message || error}</p>
            ${this.fileStatus() ? `
              <p style="margin: 5px 0; font-size: 14px;">
                <strong>Status fajlova:</strong><br>
                📄 HTML: ${this.fileStatus()?.html ? '✅' : '❌'}<br>
                🎨 CSS: ${this.fileStatus()?.css ? '✅' : '❌'}<br>
                ⚡ JS: ${this.fileStatus()?.js ? '✅' : '❌'}
              </p>
            ` : ''}
          </div>
          
          <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
            <button onclick="location.reload()" 
                    style="background: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
              🔄 Pokušaj ponovo
            </button>
            <button onclick="window.open('${app?.htmlFile || ''}', '_blank')" 
                    style="background: #2ecc71; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
              🔗 Otvori u novom tabu
            </button>
          </div>
          
          <p style="margin-top: 20px; font-size: 12px; color: #999;">
            Ako problem traje, provjerite da li fajlovi postoje u:<br>
            <code>${app?.htmlFile || 'assets/funzone/'}</code>
          </p>
        </div>
      </div>
    `;
    
    this.appContent.set(this.sanitizer.bypassSecurityTrustHtml(errorHtml));
  }
  
  getCurrentApp(): FunZoneApp | undefined {
    return this.apps.find(app => app.id === this.currentAppId());
  }
  
  getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      'game': '🎮 Igra',
      'productivity': '📈 Produktivnost',
      'creative': '🎨 Kreativnost'
    };
    return labels[category] || category;
  }
  
  toggleFullscreen(): void {
    this.isFullscreen.set(!this.isFullscreen());
  }
  
  refreshApp(): void {
    if (this.currentAppId()) {
      console.log('🔄 Osvežavam aplikaciju:', this.currentAppId());
      this.loadApp(this.currentAppId());
    }
  }
  
  openInNewTab(): void {
    const app = this.getCurrentApp();
    if (app) {
      console.log('🔗 Otvaram u novom tabu:', app.htmlFile);
      window.open(app.htmlFile, '_blank');
    }
  }
  
  runDiagnostics(): void {
    console.log('🩺 Pokrećem dijagnostiku Fun Zone...');
    console.log('=== FUN ZONE DIJAGNOSTIKA ===');
    console.log('1. Trenutna aplikacija:', this.currentAppId());
    console.log('2. Ukupno aplikacija:', this.apps.length);
    console.log('3. isLoading:', this.isLoading());
    console.log('4. showAppGrid:', this.showAppGrid());
    console.log('5. isFullscreen:', this.isFullscreen());
    
    this.testFileAccess();
    
    const lastApp = localStorage.getItem('funzone_last_app');
    console.log('6. Posljednja aplikacija (localStorage):', lastApp);
    
    console.log('=== DIJAGNOSTIKA ZAVRŠENA ===');
  }
}