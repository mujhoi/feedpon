import { createLogger } from 'redux-logger';

import applyMiddlewares from 'utils/flux/applyMiddlewares';
import createStore from 'utils/flux/createStore';
import errorHandlingMiddleware from 'utils/flux/middlewares/errorHandlingMiddleware';
import initialState from 'messaging/initialState';
import packageJson from '../package.json';
import reducer from 'messaging/reducer';
import reduxMiddleware from 'utils/flux/middlewares/reduxMiddleware';
import saveStateMiddleware from 'utils/flux/middlewares/saveStateMiddleware';
import thunkMiddleware from 'utils/flux/middlewares/thunkMiddleware';
import { Event, State, ThunkContext } from 'messaging/types';
import { Middleware, Store } from 'utils/flux/types';
import { sendNotification } from 'messaging/notifications/actions';

export default function initializeStore(
    context: ThunkContext,
    save: (state: Object) => Promise<void>,
    restore: (keys: string[]) => Promise<any>
): Store<State, Event> {
    const middlewares: Middleware<State, Event>[] = [
        errorHandlingMiddleware((error, { dispatch }) => {
            const errorString = (error + '') || 'Unknown error occured';

            dispatch(sendNotification(
                errorString,
                'negative',
                0
            ));
        }),
        thunkMiddleware(context),
        saveStateMiddleware(save, 1000)
    ];

    if (process.env.NODE_ENV !== 'production') {
        middlewares.push(reduxMiddleware(createLogger({ duration: true })));
    }

    const store = applyMiddlewares(createStore(reducer, initialState), middlewares);

    restore(Object.keys(initialState)).then((partialState) => {
        const state = {
            ...mergeState(store.getState(), partialState),
            version: packageJson.version
        };

        store.replaceState(state);

        store.dispatch({
            type: 'APPLICATION_INITIALIZED'
        });
    });

    return store;
}

function mergeState(currentState: any, restoredState: any): any {
    const state = { ...currentState };

    for (const key in restoredState) {
        if (typeof state[key] !== 'object' ||
            typeof restoredState[key] !== 'object' ||
            state[key].version === restoredState[key].version) {
                state[key] = restoredState[key];
        }
    }

    return state;
}
