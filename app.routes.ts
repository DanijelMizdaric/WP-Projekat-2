import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { HomeComponent } from './components/home/home.component';
import { CoursesComponent } from './components/courses/courses.component';
import { ScheduleComponent } from './components/schedule/schedule.component';
import { ContactComponent } from './components/contact/contact.component';
import { RegisterComponent } from './components/register/register.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'main/home',
        pathMatch: 'full'
    },
    {
        path: 'main',
        component: MainLayoutComponent,
        children: [
            { path: 'home', component: HomeComponent },
            { path: 'courses', component: CoursesComponent },
            { path: 'schedule', component: ScheduleComponent },
            { path: 'contact', component: ContactComponent },
            { path: 'student-fun-zone', redirectTo: '/auth/register', pathMatch: 'full' }
        ]
    },
    {
        path: 'auth',
        children: [
            { path: 'register', component: RegisterComponent }
        ]
    },
    {
        path: '**',
        redirectTo: 'main/home'
    }
];