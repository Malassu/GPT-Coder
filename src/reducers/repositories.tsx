import { RepositoriesAction, RepositoriesState, UserAction } from '../types';

const initialState: RepositoriesState = {
  repositories: [],
  user: null
};

const repositoriesReducer = (state = initialState, action: RepositoriesAction | UserAction): RepositoriesState => {
  switch (action.type) {
  case 'SET_REPOSITORIES':
    return {
      ...state,
      repositories: action.payload,
    };
  case 'SET_USER':
    return {
      ...state,
      user: action.payload,
    };
  default:
    return state;
  }
};

export default repositoriesReducer;
