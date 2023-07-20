import { createStore, Store } from 'redux';
import repositoriesReducer from './reducers/repositories';
import { RepositoriesState } from './types';

const store: Store<RepositoriesState> = createStore(repositoriesReducer);

export default store;
