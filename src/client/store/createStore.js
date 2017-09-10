import { applyMiddleware, compose, createStore } from "redux";
import { createLogger } from 'redux-logger';

const logger = createLogger({
  collapsed: true
});

export default function(rootReducer, preloadedState) {
  const middlewares = [logger];
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
