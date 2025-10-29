import { signalStore, withState, withMethods, withComputed } from '@ngrx/signals';
import { User } from '../model/user';

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
  withMethods((store) => ({
    addUser(user: User) {
      store.patchState({ users: [...store.users(), user] });
    },
    removeUser(id: number) {
      store.patchState({ users: store.users().filter(user => user.id !== id) });
    },
    selectUser(user: User | null) {
      store.patchState({ selectedUser: user });
    },
    setLoading(loading: boolean) {
      store.patchState({ loading });
    }
  })),
  withComputed((store) => ({
    userCount: () => store.users().length,
    hasUsers: () => store.users().length > 0
  }))
);