export interface Repository {
  id: number;
  name: string;
  full_name: string;
}

export interface RepositoriesState {
  repositories: Repository[];
  user: string | null;
}

export interface SetRepositoriesAction {
  type: 'SET_REPOSITORIES';
  payload: Repository[];
}

export interface SetUserAction {
    type: 'SET_USER';
    payload: string;
  }

export type RepositoriesAction = SetRepositoriesAction;
export type UserAction = SetUserAction;
