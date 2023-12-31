export interface Repository {
  id: number;
  name: string;
  full_name: string;
}

export interface RepositoriesState {
  repositories: Repository[];
}

export interface SetRepositoriesAction {
  type: 'SET_REPOSITORIES';
  payload: Repository[];
}

export interface TypePrRef {
  repository: string;
  prUrl: string;
}

export type RepositoriesAction = SetRepositoriesAction;
