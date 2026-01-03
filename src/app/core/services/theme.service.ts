import { Injectable } from '@angular/core';

export interface Theme {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  isDark: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'ipi-theme';
  
  private availableThemes: Theme[] = [
    {
      id: 'green',
      name: 'Zelena Tema',
      primaryColor: '#27ae60',
      secondaryColor: '#2ecc71',
      backgroundColor: '#f8f9fa',
      textColor: '#2c3e50',
      isDark: false
    },
    {
      id: 'blue',
      name: 'Plava Tema',
      primaryColor: '#3498db',
      secondaryColor: '#2980b9',
      backgroundColor: '#ecf0f1',
      textColor: '#2c3e50',
      isDark: false
    },
    {
      id: 'pink',
      name: 'Roza Tema',
      primaryColor: '#e84393',
      secondaryColor: '#fd79a8',
      backgroundColor: '#ffeaa7',
      textColor: '#2d3436',
      isDark: false
    },
    {
      id: 'dark',
      name: 'Tamna Tema',
      primaryColor: '#6c5ce7',
      secondaryColor: '#a29bfe',
      backgroundColor: '#2d3436',
      textColor: '#dfe6e9',
      isDark: true
    },
    {
      id: 'cyberpunk',
      name: 'Cyberpunk',
      primaryColor: '#00ff9d',
      secondaryColor: '#ff00ff',
      backgroundColor: '#0a0a0a',
      textColor: '#00ff9d',
      isDark: true
    }
  ];

  private currentTheme!: Theme;

  constructor() {
    this.loadTheme();
  }

  getAvailableThemes(): Theme[] {
    return this.availableThemes;
  }

  getCurrentTheme(): Theme {
    return this.currentTheme;
  }

  setTheme(themeId: string): void {
    const theme = this.availableThemes.find(t => t.id === themeId);
    if (theme) {
      this.currentTheme = theme;
      this.applyTheme(theme);
      this.saveTheme();
    }
  }

  private applyTheme(theme: Theme): void {
    const root = document.documentElement;
    
    root.style.setProperty('--primary-color', theme.primaryColor);
    root.style.setProperty('--secondary-color', theme.secondaryColor);
    root.style.setProperty('--background-color', theme.backgroundColor);
    root.style.setProperty('--text-color', theme.textColor);
    
    // Aplikuj dark/light klasu na body
    if (theme.isDark) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }

  private loadTheme(): void {
    const savedTheme = localStorage.getItem(this.THEME_KEY);
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      this.setTheme('green'); // Podrazumevana tema
    }
  }

  private saveTheme(): void {
    if (this.currentTheme) {
      localStorage.setItem(this.THEME_KEY, this.currentTheme.id);
    }
  }
}