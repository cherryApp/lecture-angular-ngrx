import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserStore } from '../stores/user.store';
import { User } from '../model/user';

@Component({
  selector: 'app-user-edit',
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-4">Edit User</h1>
      
      <!-- Loading indicator -->
      @if (userStore.loading()) {
        <div class="flex justify-center items-center h-32">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      }
      
      <!-- User edit form -->
      @if (!userStore.loading() && userForm) {
        <form [formGroup]="userForm" (ngSubmit)="onSubmit()" class="max-w-md">
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="name">
              Name
            </label>
            <input
              id="name"
              type="text"
              formControlName="name"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              [class.border-red-500]="userForm.get('name')?.invalid && userForm.get('name')?.touched">
            @if (userForm.get('name')?.invalid && userForm.get('name')?.touched) {
              <p class="text-red-500 text-xs italic">Name is required</p>
            }
          </div>
          
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              formControlName="email"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              [class.border-red-500]="userForm.get('email')?.invalid && userForm.get('email')?.touched">
            @if (userForm.get('email')?.invalid && userForm.get('email')?.touched) {
              <p class="text-red-500 text-xs italic">Please enter a valid email</p>
            }
          </div>
          
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="category">
              Category
            </label>
            <select
              id="category"
              formControlName="category"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
              <option value="Admin">Admin</option>
              <option value="User">User</option>
              <option value="Moderator">Moderator</option>
            </select>
          </div>
          
          <div class="flex items-center justify-between">
            <button 
              type="button"
              (click)="onCancel()"
              class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              Cancel
            </button>
            <button
              type="submit"
              [disabled]="userForm.invalid"
              class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              [class.opacity-50]="userForm.invalid"
              [class.cursor-not-allowed]="userForm.invalid">
              Save Changes
            </button>
          </div>
        </form>
      }
      
      <!-- Error message -->
      @if (errorMessage()) {
        <div class="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {{ errorMessage() }}
        </div>
      }
    </div>
  `,
  standalone: true,
  imports: [ReactiveFormsModule]
})
export class UserEditComponent implements OnInit {
  readonly userStore = inject(UserStore);
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly fb = inject(FormBuilder);
  
  userForm = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    category: ['User', [Validators.required]]
  });
  
  errorMessage = signal('');
  
  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      // Load the user data
      this.userStore.loadUser(id).then(user => {
        if (user) {
          this.userForm.patchValue({
            name: user.name,
            email: user.email,
            category: user.category
          });
        }
      }).catch(error => {
        this.errorMessage.set('Failed to load user data');
        console.error('Error loading user:', error);
      });
    }
  }
  
  onSubmit() {
    if (this.userForm.valid) {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      const formValue = this.userForm.value;
      
      this.userStore.updateUser(id, {
        name: formValue.name!,
        email: formValue.email!,
        category: formValue.category!
      }).then(() => {
        this.router.navigate(['/users']);
      }).catch(error => {
        this.errorMessage.set('Failed to update user');
        console.error('Error updating user:', error);
      });
    } else {
      // Mark all fields as touched to show validation errors
      this.userForm.markAllAsTouched();
    }
  }
  
  onCancel() {
    this.router.navigate(['/users']);
  }
}