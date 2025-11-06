import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'users',
    loadComponent: () => import('./users/users.component').then(m => m.UsersComponent)
  },
  {
    path: 'users/edit/:id',
    loadComponent: () => import('./users/user-edit.component').then(m => m.UserEditComponent)
  },
  {
    path: 'users/create',
    loadComponent: () => import('./users/user-create/user-create').then(m => m.UserCreateComponent)
  }
];
