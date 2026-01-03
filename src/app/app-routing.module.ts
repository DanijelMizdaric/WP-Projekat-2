import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CoursesListComponent } from './courses/courses-list/courses-list.component';
import { ContactComponent } from './contact/contact.component';
import { StudentFunZoneComponent } from './student-fun-zone/student-fun-zone.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'courses', component: CoursesListComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'student-fun-zone', component: StudentFunZoneComponent },
  
  // Lazy loading za feature module
  { 
    path: 'auth', 
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule) 
  },
  { 
    path: 'dashboard', 
    loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule) 
  },
  { 
    path: 'statistics', 
    loadChildren: () => import('./features/statistics/statistics.module').then(m => m.StatisticsModule) 
  },
  
  // Fallback
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }