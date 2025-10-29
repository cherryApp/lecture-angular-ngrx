import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navigation',
  template: `
    <nav class="bg-gray-800">
      <div class="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div class="relative flex items-center justify-between h-16">
          <div class="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
            <div class="flex-shrink-0 flex items-center">
              <span class="text-white font-bold text-xl">My App</span>
            </div>
            <div class="hidden sm:block sm:ml-6">
              <div class="flex space-x-4">
                <a routerLink="/" routerLinkActive="bg-gray-900" 
                   class="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Home
                </a>
                <a routerLink="/users" routerLinkActive="bg-gray-900" 
                   class="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Users
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  `,
  standalone: true,
  imports: [RouterLink, RouterLinkActive]
})
export class NavigationComponent {}