import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserStore } from '../stores/user.store';
import { User } from '../model/user';
// Import Signal Forms APIs
import { form, required, email, Field, submit } from '@angular/forms/signals';
import { linkedSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';

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
      @if (!userStore.loading() && userForm()) {
      <form (ngSubmit)="onSubmit()" class="max-w-md">
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="name"> Name </label>
          <input
            id="name"
            type="text"
            [field]="userForm.name"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          @if (userForm.name().errors().length > 0) {
          <p class="text-red-500 text-xs italic">
            {{ getErrorMessage(userForm.name().errors()[0]) }}
          </p>
          }
        </div>

        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="email"> Email </label>
          <input
            id="email"
            type="email"
            [field]="userForm.email"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          @if (userForm.email().errors().length > 0) {
          <p class="text-red-500 text-xs italic">
            {{ getErrorMessage(userForm.email().errors()[0]) }}
          </p>
          }
        </div>

        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="category">
            Category
          </label>
          <select
            id="category"
            [field]="userForm.category"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="Admin">Admin</option>
            <option value="User">User</option>
            <option value="Moderator">Moderator</option>
          </select>
        </div>

        <div class="flex items-center justify-between">
          <button
            type="button"
            (click)="onCancel()"
            class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            [disabled]="userForm().invalid()"
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            [class.opacity-50]="userForm().invalid()"
            [class.cursor-not-allowed]="userForm().invalid()"
          >
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
  imports: [Field, FormsModule],
})
export class UserEditComponent implements OnInit {
  readonly userStore = inject(UserStore);
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);

  // Create a linked signal for the user data
  user = linkedSignal<User>(() => {
    const selectedUser = this.userStore.selectedUser();
    return selectedUser ? { ...selectedUser } : { id: 0, name: '', email: '', category: 'User' };
  });

  // Create the signal form
  userForm = form(this.user, (path) => {
    required(path.name);
    required(path.email);
    email(path.email);
    required(path.category);
  });

  errorMessage = signal('');

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      // Load the user data
      this.userStore
        .loadUser(id)
        .then((user) => {
          if (user) {
            // Update the linked signal with the loaded user data
            this.user.set({ ...user });
          }
        })
        .catch((error) => {
          this.errorMessage.set('Failed to load user data');
          console.error('Error loading user:', error);
        });
    }
  }

  getErrorMessage(error: any): string {
    if (!error) return '';

    switch (error.kind) {
      case 'required':
        return 'This field is required';
      case 'email':
        return 'Please enter a valid email';
      default:
        return error.message || 'Invalid value';
    }
  }

  onSubmit() {
    submit(this.userForm, async () => {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      const userData = this.user();

      try {
        await this.userStore.updateUser(id, {
          name: userData.name,
          email: userData.email,
          category: userData.category,
        });
        this.router.navigate(['/users']);
        return null; // No validation errors
      } catch (error) {
        this.errorMessage.set('Failed to update user');
        console.error('Error updating user:', error);
        // Return a validation error to display in the form
        return {
          kind: 'submission_error',
          message: 'Failed to update user',
        };
      }
    });
  }

  onCancel() {
    this.router.navigate(['/users']);
  }
}
