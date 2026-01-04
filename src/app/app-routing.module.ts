import { Routes } from '@angular/router';

import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { HomeComponent } from './home/home.component';
import { StudentFunZoneComponent } from './student-fun-zone/student-fun-zone.component';

import { DashboardComponent } from './features/dashboard/dashboard.component';


export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: 'home', component: HomeComponent },
      
      // { path: 'courses', component:  },
      // { path: 'schedule', component:  },
      // { path: 'contact', component: }, 
      
      { 
        path: 'fun-zone', 
        component: StudentFunZoneComponent,
        children: [

           { path: 'dashboard', component: DashboardComponent },
           
           { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
        ]
      },
      
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ]
  },

  { path: '**', redirectTo: 'login' }
];