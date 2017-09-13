import React from "react";
import BrowserRouter from 'react-router-dom/BrowserRouter';
import asyncBootstrapper from 'react-async-bootstrapper';
import { AsyncComponentProvider, createAsyncContext } from 'react-async-component';
// hydrate is responsible for server rendering going forward
import { JobProvider } from 'react-jobs';
import { hydrate as render } from "react-dom";
import App from "./app";
import { Provider } from "react-redux";
import store from "./store";

// Get the DOM Element that will host our React application.
const container = document.querySelector('#app');

// Does the user's browser support the HTML5 history API?
// If the user's browser doesn't support the HTML5 history API then we
// will force full page refreshes on each page change.
const supportsHistory = 'pushState' in window.history;

// Get any rehydrateState for the async components.
// eslint-disable-next-line no-underscore-dangle
const asyncComponentsRehydrateState = window.__ASYNC_COMPONENTS_REHYDRATE_STATE__;

// Get any "rehydrate" state sent back by the server
// eslint-disable-next-line no-underscore-dangle
const rehydrateState = window.__PRELOADED_STATE__;

const JobsState = window.__JOBS_STATE__;

function renderApp (TheApp) {
  const app = (
    <AsyncComponentProvider rehydrateState={asyncComponentsRehydrateState}>
      <JobProvider rehydrateState={JobsState}>
        <BrowserRouter forceRefresh={!supportsHistory}>
          <Provider store={store}>
            <TheApp />
          </Provider>
        </BrowserRouter>
      </JobProvider>
    </AsyncComponentProvider>
  );

  // We use the react-async-component in order to support code splitting of
  // our bundle output. It's important to use this helper.
  // @see https://github.com/ctrlplusb/react-async-component
  asyncBootstrapper(app).then(() => render(app, container));
}

renderApp(App);

// Hot Module Replacement API
if (module.hot) {
  module.hot.accept();
}
