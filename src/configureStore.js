import throttle from 'lodash/throttle';
import { loadState, saveState } from './localStorage'

const configureStore = () => {
    const persistedState = loadState();
    const store = createStore(
        app,
        persistedState
    );
    store.subscribe(throttle(() => {
        saveState({
            places: store.getState().places
        })
    }, 1000));
    return store
};

export default configureStore;
