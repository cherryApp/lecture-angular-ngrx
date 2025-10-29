import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { User } from '../model/user';
import { UserService } from '../services/user.service';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface UserState {
  users: User[];
  loading: boolean;
  selectedUser: User | null;
}

export const UserStore = signalStore(
  withState<UserState>({
    users: [],
    loading: false,
    selectedUser: null
  }),
  withMethods((store, userService = inject(UserService)) => ({
    // Load all users from the API
    async loadUsers() {
      patchState(store, { loading: true });
      try {
        const users = await firstValueFrom(userService.getUsers());
        patchState(store, { users, loading: false });
      } catch (error) {
        patchState(store, { loading: false });
        throw error;
      }
    },
    
    // Create a new user
    async createUser(user: Omit<User, 'id'>) {
      const newUser = await firstValueFrom(userService.createUser(user));
      patchState(store, { users: [...store.users(), newUser] });
      return newUser;
    },
    
    // Update an existing user
    async updateUser(id: number, user: Partial<User>) {
      const updatedUser = await firstValueFrom(userService.updateUser(id, user));
      patchState(store, { 
        users: store.users().map(u => u.id === id ? updatedUser : u),
        selectedUser: updatedUser
      });
      return updatedUser;
    },
    
    // Remove a user
    async removeUser(id: number) {
      await firstValueFrom(userService.deleteUser(id));
      patchState(store, { 
        users: store.users().filter(user => user.id !== id),
        selectedUser: store.selectedUser()?.id === id ? null : store.selectedUser()
      });
    },
    
    selectUser(user: User | null) {
      patchState(store, { selectedUser: user });
    },
    
    setLoading(loading: boolean) {
      patchState(store, { loading });
    }
  })),
  withComputed((store) => ({
    userCount: () => store.users().length,
    hasUsers: () => store.users().length > 0
  }))
);