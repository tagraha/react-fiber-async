import path from "path";
import express from "express";
import React from "react";
import { renderToString } from "react-dom/server";
import { JobProvider, createJobContext } from 'react-jobs';
import asyncBootstrapper from 'react-async-bootstrapper';
import { StaticRouter as Router } from "react-router";
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
    counter: 5
  });

  // Create the job context for our provider, this grants
  // us the ability to track the resolved jobs to send back to the client.
  const jobContext = createJobContext()

  const _App = sheet.collectStyles(
    <JobProvider jobContext={jobContext}>
      <Provider store={store}>
        <Router location={req.url} context={context}>
          <App />
        </Router>
      </Provider>
    </JobProvider>
  );

  asyncBootstrapper(_App).then(() => {
    let AppString = renderToString(_App);

    // Get the resolved jobs state.
    const jobsState = jobContext.getState()
    
    const htmlString = `
      <html>
        <head>
          <title>Example</title>
        </head>
        <body>
          <div id="app">${AppString}</div>
          <script type="text/javascript">
            window.__PRELOADED_STATE__ = ${serialize(jobsState)}
          </script>
        </body>
      </html>
    `

    const styleTags = sheet.getStyleTags();
    // res.send(htmlString);

    res.render(indexTemplate, {
      content: htmlString,
      styles: styleTags
    });
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
