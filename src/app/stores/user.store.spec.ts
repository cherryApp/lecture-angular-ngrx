import { TestBed } from '@angular/core/testing';
import { UserStore } from './user.store';
import { UserService } from '../services/user.service';
import { of } from 'rxjs';
import { vi } from 'vitest';

describe('UserStore', () => {
  let store: any;
  let userService: any;

  beforeEach(() => {
    const spy = {
      getUsers: vi.fn(),
      createUser: vi.fn(),
      updateUser: vi.fn(),
      deleteUser: vi.fn()
    };
    
    TestBed.configureTestingModule({
      providers: [
        UserStore,
        { provide: UserService, useValue: spy }
      ]
    });

    store = TestBed.inject(UserStore);
    userService = TestBed.inject(UserService);
  });

  it('should not reload users if they are already loaded', async () => {
    // Set up mock data
    const mockUsers = [{ id: 1, name: 'John', email: 'john@example.com' }];
    userService.getUsers.mockReturnValue(of(mockUsers));

    // Load users for the first time
    await store.loadUsers();
    
    // Verify getUsers was called
    expect(userService.getUsers).toHaveBeenCalledTimes(1);
    expect(store.users().length).toBe(1);

    // Reset the spy call count
    userService.getUsers.mockClear();

    // Try to load users again
    await store.loadUsers();
    
    // Verify getUsers was not called again
    expect(userService.getUsers).not.toHaveBeenCalled();
    expect(store.users().length).toBe(1);
  });
});