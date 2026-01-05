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

// **DODAJ OVE IMPORTOVE:**
import { HabitTrackerComponent } from './features/dashboard/widgets/habit-tracker/habit-tracker.component';
import { SleepTrackerComponent } from './features/dashboard/widgets/sleep-tracker/sleep-tracker.component';

export const routes: Routes = [
  { path: '', redirectTo: 'main', pathMatch: 'full' }, 
  
  { path: 'login', component: LoginComponent }, 
  { path: 'register', component: RegisterComponent }, 
  
  // Dashboard SA children rutama za widget-e
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    children: [
      // **OVO JE VAŽNO:** prazna ruta ostaje dashboard
      { path: '', redirectTo: '', pathMatch: 'full' },
      // **DODAJ WIDGET RUTE:**
      { path: 'habits', component: HabitTrackerComponent },
      { path: 'sleep', component: SleepTrackerComponent },
      // Dodaj i druge widget rute ako imaš
    ]
  },
  
  {
    path: 'main', 
    component: MainLayoutComponent,
    children: [
      { path: '', component: HomeComponent }, 
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
  
  { path: '**', redirectTo: 'main' }
];