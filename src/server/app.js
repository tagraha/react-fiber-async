import path from "path";
import express from "express";
import React from "react";
import Helmet from 'react-helmet';
import { renderToString } from "react-dom/server";
import { AsyncComponentProvider, createAsyncContext } from 'react-async-component';
import { JobProvider, createJobContext } from 'react-jobs';
import asyncBootstrapper from 'react-async-bootstrapper';
import { StaticRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import serialize from 'serialize-javascript';
import { ServerStyleSheet } from "styled-components";
import App from "../client/app";
import createStore from "../client/store/createStore";
import rootReducer from "../client/reducers";

// Environment variables
const isDevelopment = process.env.NODE_ENV === "development";

// Create app
const app = express();

//set port
const port = process.env.PORT || 8888;

// set statics
const staticPath = path.join(__dirname, "../../", "static");
app.use(express.static(staticPath));

// set view engine
app.set("view engine", "pug");
// set views directory
if (isDevelopment) {
  app.set("views", path.join(__dirname, "templates"));
} else {
  app.set("views", path.join(__dirname, "../../", "static/templates"));
}

//Root html template
let indexTemplate = "index.dev.pug";
if (!isDevelopment) {
  indexTemplate = "index";
}

const context = {};

function render(req, res, err) {
  const sheet = new ServerStyleSheet();
  // setting counter initial value to 5
  const store = createStore(rootReducer, {
    counter: 5,
    posts:{}
  });

  // Create the job context for our provider, this grants
  // us the ability to track the resolved jobs to send back to the client.
  const jobContext = createJobContext(rootReducer)

  // Create a context for our AsyncComponentProvider.
  const asyncContext = createAsyncContext();

  const _App = sheet.collectStyles(
    <AsyncComponentProvider asyncContext={asyncContext}>
      <JobProvider jobContext={jobContext}>
        <Router location={req.url} context={context}>
          <Provider store={store}>
            <App />
          </Provider>
        </Router>
      </JobProvider>
    </AsyncComponentProvider>
  );

  asyncBootstrapper(_App).then(() => {
    let AppString = renderToString(_App);
    
    const helmet = Helmet.renderStatic();    

    // Get the resolved jobs state.
    const jobsState = jobContext.getState();

    const asyncState = asyncContext.getState();
    const preloadState = store.getState();
    
    const htmlString = `<!DOCTYPE html>
      <html ${helmet.htmlAttributes.toString()}>
        <head>
          ${helmet.title.toString()}
          ${helmet.meta.toString()}
          ${helmet.link.toString()}
        </head>
        <body>
          <div id="app">${AppString}</div>
          <script type="text/javascript">
            window.__ASYNC_COMPONENTS_REHYDRATE_STATE__ = ${serialize(asyncState)}
            window.__JOBS_STATE__ = ${serialize(jobsState)}
            window.__PRELOADED_STATE__ = ${JSON.stringify(preloadState)}
          </script>

          <script src="http://localhost:8080/manifest.bundle.js" charset="utf-8"></script>
          <script src="http://localhost:8080/vendor.bundle.js" charset="utf-8"></script>
          <script src="http://localhost:8080/main.bundle.js" charset="utf-8"></script>
        </body>
      </html>
    `

    const styleTags = sheet.getStyleTags();
    res.send(htmlString);

    // res.render(indexTemplate, {
    //   content: htmlString,
    //   styles: styleTags
    // });

    res.end();
  });
}

// add routes
app.get("/throw", (req, res, next) => {
  next(new Error("we messed up"));
});

app.get("*", (req, res) => {
  render(req, res);
});

if (isDevelopment) {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.redirect("/500");
  });
}

// start app
app.listen(port, () => {
  console.info(
    `🌎  Listening on port ${port} in ${process.env
      .NODE_ENV} mode on Node ${process.version}.`
  );
  if (isDevelopment) {
    console.info(`Open http://localhost:${port}`);
  }
});
