import { Component, effect, inject, signal } from '@angular/core';
import { UserService } from '../../../products/services/user.service';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-home-page',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './home-page.component.html',
})
export class HomePageComponent {
  // _userService = inject(UserService);
  // UsersResource = rxResource({
  //   request: () => ({}),
  //   loader: ({ request }) => {
  //     return this._userService.getUsers();
  //   },
  // });
}
