import { applyMiddleware, compose, createStore } from "redux";
import axios from 'axios';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';

const logger = createLogger({
  collapsed: true
});

export default function(rootReducer, preloadedState) {
  const middlewares = [logger, thunk.withExtraArgument({ axios })];
  const store = createStore(
    rootReducer,
    preloadedState,
    compose(
      applyMiddleware(...middlewares),
      // redux browser extension
      typeof window === "object" &&
      typeof window.devToolsExtension !== "undefined"
        ? window.devToolsExtension()
        : f => f
    )
  );
  return store;
}
