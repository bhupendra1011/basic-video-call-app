// global store
// https://redux.js.org/introduction/why-rtk-is-redux-today
import { configureStore } from '@reduxjs/toolkit'
import AppReducer from './reducer'

/**
 * Currently one reducer managing state of all whole app , can be split across reducers
 */
export const store = configureStore({
    reducer: {
        app: AppReducer
    }
})
