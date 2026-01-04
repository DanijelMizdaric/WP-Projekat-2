import { Routes } from '@angular/router';
import { LoginComponent } from 'features/auth/login/login.component'; 
import { RegisterComponent } from 'features/auth/register/register.component'; 
import { HomeComponent } from './home/home.component';
import { CoursesComponent } from './components/courses/courses.component';
import { ScheduleComponent } from './components/schedule/schedule.component';
import { ContactComponent } from './components/contact/contact.component';
import { KanbanComponent } from './components/funzone/kanban/kanban.component';
import { WhiteboardComponent } from './components/funzone/whiteboard/whiteboard.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';

export const routes: Routes = [
  // Prazna ruta -> login (ili možda dashboard ako je prijavljen)
  { path: '', redirectTo: 'login', pathMatch: 'full' }, 

  // Login i Register
  { path: 'login', component: LoginComponent }, 
  { path: 'register', component: RegisterComponent }, 

  // ✅ DASHBOARD KAO SAMOSTALNA RUTA (IZVAN MAIN LAYOUT-A)
  { path: 'dashboard', component: DashboardComponent },

  // Main Layout (sadrži sve OSIM dashboard-a)
  {
    path: 'main', 
    component: MainLayoutComponent,
    children: [
      { path: '', component: HomeComponent }, 
      // { path: 'dashboard', component: DashboardComponent }, // ❌ UKLONI OVO IZ OVDE
      { path: 'courses', component: CoursesComponent },
      { path: 'schedule', component: ScheduleComponent },
      { path: 'contact', component: ContactComponent }, 
      {
        path: 'funzone',
        children: [
          { path: '', redirectTo: 'kanban', pathMatch: 'full' }, 
          { path: 'kanban', component: KanbanComponent },
          { path: 'whiteboard', component: WhiteboardComponent },
        ]
      }
    ]
  },
  
  { path: '**', redirectTo: 'login' }
];