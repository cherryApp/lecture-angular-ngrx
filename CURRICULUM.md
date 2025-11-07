# Angular 21 Signals, Stores & Forms - Complete Development Curriculum

## 📚 Table of Contents
- [Project Overview](#project-overview)
- [Architecture Overview](#architecture-overview)
- [Development Journey](#development-journey)
- [Step-by-Step Implementation Guide](#step-by-step-implementation-guide)
- [Core Services & Systems](#core-services--systems)
- [State Management with NgRx Signals](#state-management-with-ngrx-signals)
- [Advanced Form Patterns](#advanced-form-patterns)
- [Testing Strategy](#testing-strategy)
- [Best Practices & Lessons Learned](#best-practices--lessons-learned)

---

## Project Overview

This curriculum documents the creation of a modern Angular 21 application demonstrating cutting-edge features including Signal Forms, NgRx Signals stores, standalone components, and reactive programming patterns. The application serves as a user management system with two distinct form implementations.

### Key Technologies
- **Angular 21.0.0-next.0** - Latest standalone component architecture
- **NgRx Signals 20.1.0** - Modern signal-based state management
- **Signal Forms API** - Experimental Angular form handling
- **TailwindCSS 4.1.12** - Utility-first CSS framework
- **TypeScript 5.9.2** - Strict typing throughout
- **Vitest** - Modern testing framework

---

## Architecture Overview

### Core Principles
1. **Signal-First Architecture** - All state management uses Angular signals
2. **Standalone Components** - No NgModules, modern Angular architecture
3. **Reactive Programming** - Computed signals and linked signals for data flow
4. **Type Safety** - Strict TypeScript with proper interfaces
5. **Test-Driven Development** - Comprehensive unit tests

### Application Structure
```
src/
├── app/
│   ├── app.config.ts          # App configuration with providers
│   ├── app.routes.ts          # Standalone routing configuration
│   ├── model/user.ts          # Core user interface
│   ├── services/user.service.ts   # HTTP service layer
│   ├── stores/user.store.ts       # Signal-based state management
│   ├── navigation/            # Navigation component
│   ├── users/                 # User feature modules
│   ├── user-create/           # Dynamic form implementation
│   └── user-edit/             # Signal form implementation
```

---

## Development Journey

### Phase 1: Foundation Setup
**Objective:** Establish the Angular 21 project with modern configuration

**CLI Commands:**
```bash
# Create new Angular 21 project with standalone architecture
ng new test-21 --routing --style=css --standalone

# Install additional dependencies
npm install @ngrx/signals tailwindcss @tailwindcss/forms
```

**Key Configuration Changes:**

1. **Angular Configuration (angular.json)**
- Enabled strict mode for TypeScript
- Configured build optimization for production
- Setup development server with hot reload

2. **Package.json Dependencies**
```json
{
  "dependencies": {
    "@angular/animations": "^21.0.0-next.0",
    "@angular/common": "^21.0.0-next.0",
    "@angular/compiler": "^21.0.0-next.0",
    "@angular/core": "^21.0.0-next.0",
    "@angular/forms": "^21.0.0-next.0",
    "@angular/platform-browser": "^21.0.0-next.0",
    "@angular/platform-browser-dynamic": "^21.0.0-next.0",
    "@angular/router": "^21.0.0-next.0",
    "@ngrx/signals": "^20.1.0",
    "rxjs": "~7.8.0"
  }
}
```

**App Configuration Setup:**
```typescript
// src/app/app.config.ts
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient()
  ]
};
```

---

## Step-by-Step Implementation Guide

### Step 1: Core Model Definition
**Command:** `touch src/app/model/user.ts`

**Implementation:**
```typescript
export interface User {
  id: number;
  name: string;
  email: string;
  category: 'admin' | 'user' | 'guest';
}
```

**Key Learning:** Interface definition with strict typing and union types for categories.

### Step 2: HTTP Service Layer
**Command:** `ng g s user --project=test-21`

**Implementation:**
```typescript
// src/app/services/user.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../model/user';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'nettuts.hu/jms/cherryApp/users';

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  createUser(user: Omit<User, 'id'>): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  updateUser(id: number, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

**Key Learning:** Modern dependency injection with `inject()` function and strict typing for API operations.

### Step 3: Signal-Based State Management
**Command:** `ng g s user --project=test-21`

**Implementation:**
```typescript
// src/app/stores/user.store.ts
import { signal, computed } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tap, pipe, switchMap, catchError, of } from 'rxjs';
import { inject } from '@angular/core';
import { UserService } from '../services/user.service';
import { User } from '../model/user';

export const UserStore = {
  // State signals
  users: signal<User[]>([]),
  loading: signal<boolean>(false),
  error: signal<string | null>(null),
  selectedUserId: signal<number | null>(null),

  // Computed signals
  userCount: computed(() => this.users().length),
  hasUsers: computed(() => this.users().length > 0),
  selectedUser: computed(() => {
    const id = this.selectedUserId();
    return id ? this.users().find(u => u.id === id) || null : null;
  }),

  // Actions
  loadUsers: rxMethod<void>(
    pipe(
      tap(() => {
        this.loading.set(true);
        this.error.set(null);
      }),
      switchMap(() => 
        inject(UserService).getUsers().pipe(
          tap(users => {
            this.users.set(users);
            this.loading.set(false);
          }),
          catchError(err => {
            this.error.set('Failed to load users');
            this.loading.set(false);
            return of([]);
          })
        )
      )
    )
  ),

  selectUser(id: number) {
    this.selectedUserId.set(id);
  },

  addUser(user: Omit<User, 'id'>) {
    const optimisticUser = { ...user, id: Date.now() } as User;
    const previousUsers = this.users();
    
    this.users.update(users => [...users, optimisticUser]);
    
    inject(UserService).createUser(user).pipe(
      catchError(err => {
        this.users.set(previousUsers);
        this.error.set('Failed to add user');
        return of(optimisticUser);
      })
    ).subscribe();
  },

  updateUser(id: number, updates: Partial<User>) {
    const previousUsers = this.users();
    
    this.users.update(users => 
      users.map(user => user.id === id ? { ...user, ...updates } : user)
    );
    
    inject(UserService).updateUser(id, updates).pipe(
      catchError(err => {
        this.users.set(previousUsers);
        this.error.set('Failed to update user');
        return of(null);
      })
    ).subscribe();
  },

  deleteUser(id: number) {
    const previousUsers = this.users();
    
    this.users.update(users => users.filter(user => user.id !== id));
    
    inject(UserService).deleteUser(id).pipe(
      catchError(err => {
        this.users.set(previousUsers);
        this.error.set('Failed to delete user');
        return of(null);
      })
    ).subscribe();
  }
};
```

**Key Learning:** Advanced signal patterns with `rxMethod`, computed properties, and optimistic updates with error rollbacks.

---

## Core Services & Systems

### User Service Architecture

**Design Principles:**
- RESTful API integration with proper HTTP methods
- Observable-based responses for reactive programming
- Type-safe parameters and return types
- Centralized API endpoint management
- Error handling preparation for service layer

**Implementation Highlights:**
- Uses `inject()` function for dependency injection (modern Angular 21)
- Provides CRUD operations with proper typing
- Implements optimistic updates in store layer
- Handles partial updates with `Partial<User>` type

### Store Pattern Implementation

**Core Concepts:**
1. **State Declaration:** Separate signals for different state aspects
2. **Computed Properties:** Derived state that reacts to changes
3. **Actions:** Methods that modify state with side effects
4. **Error Handling:** Rollback mechanisms for failed operations
5. **Loading States:** Proper async operation tracking

**Advanced Patterns:**
- `rxMethod` for reactive side effects
- Optimistic updates with rollback
- Computed signals for derived state
- Error boundary handling for async operations

---

## State Management with NgRx Signals

### Signal Store Benefits

**Compared to Traditional NgRx:**
- No boilerplate reducers, actions, or effects
- Direct state manipulation with signals
- Automatic change detection and reactivity
- Simplified testing approach
- Better TypeScript integration

**Signal Patterns Demonstrated:**

1. **Writable Signals:** Direct state updates
```typescript
users: signal<User[]>([]),
```

2. **Computed Signals:** Derived state
```typescript
userCount: computed(() => this.users().length),
selectedUser: computed(() => {
  const id = this.selectedUserId();
  return id ? this.users().find(u => u.id === id) || null : null;
})
```

3. **Linked Signals:** Two-way binding
```typescript
userForm = linkedSignal({
  source: () => this.userStore.selectedUser(),
  computation: (user) => this.buildForm(user)
});
```

### Advanced Error Handling

**Pattern:** Optimistic updates with rollback
```typescript
addUser(user: Omit<User, 'id'>) {
  const optimisticUser = { ...user, id: Date.now() } as User;
  const previousUsers = this.users();
  
  // Optimistic update
  this.users.update(users => [...users, optimisticUser]);
  
  // API call with rollback on error
  inject(UserService).createUser(user).pipe(
    catchError(err => {
      this.users.set(previousUsers);
      this.error.set('Failed to add user');
      return of(optimisticUser);
    })
  ).subscribe();
}
```

---

## Advanced Form Patterns

### Signal Form Implementation (Manual)

**Approach:** Field-by-field manual definition with Signal Forms API

**Key Features:**
- Individual field control with validation
- Type-safe form building
- Reactive validation messages
- Submission handling with error recovery

**Implementation Pattern:**
```typescript
// Form building pattern
form = this.fb.group({
  name: this.fb.control('', {
    validators: [Validators.required, Validators.minLength(2)],
    nonNullable: true
  }),
  email: this.fb.control('', {
    validators: [Validators.required, Validators.email],
    nonNullable: true
  })
});

// Linked signal for two-way binding
userForm = linkedSignal({
  source: () => this.userStore.selectedUser(),
  computation: (user) => this.buildForm(user)
});
```

### Dynamic Form Implementation (Metadata-Driven)

**Approach:** Form generation based on metadata configuration

**Key Benefits:**
- Reusable form generation logic
- Configuration-driven field creation
- Consistent validation patterns
- Reduced boilerplate code

**Field Definition Pattern:**
```typescript
export interface FieldDef {
  name: string;
  type: 'text' | 'email' | 'select';
  label: string;
  validators?: ValidatorConfig[];
  options?: Option[];
}

// Form generation logic
buildForm(fields: FieldDef[]): FormGroup {
  const controls: Record<string, FormControl> = {};
  
  fields.forEach(field => {
    const validators = this.buildValidators(field.validators);
    controls[field.name] = this.fb.control('', {
      validators,
      nonNullable: true
    });
  });
  
  return this.fb.group(controls);
}
```

**Dynamic Template Rendering:**
```html
@for (field of fields(); track field.name) {
  <div class="form-field">
    <label [for]="field.name">{{ field.label }}</label>
    
    @if (field.type === 'text' || field.type === 'email') {
      <input 
        [id]="field.name"
        [type]="field.type"
        [formControlName]="field.name"
        class="form-input"
      />
    }
    
    @if (field.type === 'select') {
      <select [id]="field.name" [formControlName]="field.name" class="form-select">
        @for (option of field.options; track option.value) {
          <option [value]="option.value">{{ option.label }}</option>
        }
      </select>
    }
    
    @if (formService.getError(field.name)) {
      <span class="error-message">{{ formService.getError(field.name) }}</span>
    }
  </div>
}
```

---

## Testing Strategy

### Unit Testing Approach

**Test Structure:**
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { UserStore } from './user.store';
import { UserService } from '../services/user.service';

describe('UserStore', () => {
  let store: typeof UserStore;
  let userService: UserService;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserService]
    });
    
    store = UserStore;
    userService = TestBed.inject(UserService);
  });
  
  it('should initialize with empty state', () => {
    expect(store.users()).toEqual([]);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });
  
  it('should compute user count correctly', () => {
    store.users.set([
      { id: 1, name: 'User 1', email: 'user1@example.com', category: 'user' },
      { id: 2, name: 'User 2', email: 'user2@example.com', category: 'user' }
    ]);
    
    expect(store.userCount()).toBe(2);
    expect(store.hasUsers()).toBe(true);
  });
});
```

**Testing Benefits of Signal Pattern:**
- Direct state assertion without complex setup
- Synchronous testing of async operations
- Predictable state transitions
- Easy stubbing of dependencies

---

## Best Practices & Lessons Learned

### 1. Signal Patterns

**Do's:**
- Use `computed()` for derived state
- Implement optimistic updates with rollback
- Use `linkedSignal()` for form binding
- Mark Angular-managed properties as `readonly`

**Don'ts:**
- Avoid `effect()` for setting state
- Don't create signals in computed functions
- Avoid over-computing derived state

### 2. Form Implementation Patterns

**Signal Forms:**
- Use for complex validation logic
- Better for unique form requirements
- More control over field behavior
- Easier debugging and testing

**Dynamic Forms:**
- Use for repetitive form patterns
- Better for CRUD operations
- Configuration-driven approach
- Consistent user experience

### 3. State Management Best Practices

**Store Implementation:**
- Separate signals for different concerns
- Use `rxMethod` for side effects
- Implement proper error boundaries
- Cache appropriately to avoid duplicate calls

**Performance Considerations:**
- Use `computed()` for expensive calculations
- Implement proper memoization
- Avoid unnecessary signal updates
- Use `untrack()` where appropriate

### 4. Error Handling Strategy

**Patterns Demonstrated:**
- Optimistic updates with rollback
- User-friendly error messages
- Centralized error handling
- Async operation state tracking

### 5. Component Architecture

**Modern Angular 21 Patterns:**
- Standalone components throughout
- `inject()` function for dependency injection
- Signal-based inputs and outputs
- Native control flow syntax (`@if`, `@for`)

---

## Summary

This curriculum demonstrates the complete development of a modern Angular 21 application showcasing:

1. **Advanced State Management** with NgRx Signals
2. **Two Distinct Form Patterns** - Signal Forms and Dynamic Forms
3. **Modern Angular Architecture** with standalone components
4. **Reactive Programming Patterns** with signals and computed properties
5. **Comprehensive Testing Strategy** with modern tools

The application serves as a reference implementation for developers learning modern Angular patterns and provides practical examples of cutting-edge Angular 21 features in a real-world context.

**Key Takeaways:**
- Signal-based architecture simplifies state management
- Dynamic forms enable reusable form generation
- Modern Angular patterns reduce boilerplate
- Testing becomes more straightforward with signals
- Error handling with rollback provides better UX

This curriculum provides a complete roadmap for building modern Angular applications with the latest features and best practices.