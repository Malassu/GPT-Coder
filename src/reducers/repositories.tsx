import { RepositoriesAction, RepositoriesState } from '../types';

const initialState: RepositoriesState = {
  repositories: []
};

const repositoriesReducer = (state = initialState, action: RepositoriesAction): RepositoriesState => {
  switch (action.type) {
  case 'SET_REPOSITORIES':
    return {
      ...state,
      repositories: action.payload,
    };
  default:
    return state;
  }
};

export default repositoriesReducer;
