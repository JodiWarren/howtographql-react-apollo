import React from "react";
import ReactDOM from "react-dom";
import { ApolloProvider } from "react-apollo";
import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache
} from "apollo-boost";
import { BrowserRouter } from "react-router-dom";

import App from "./components/App";
import registerServiceWorker from "./registerServiceWorker";
import { AUTH_TOKEN } from "./constants";

import "./styles/index.css";

const httpLink = new HttpLink({ uri: "http://localhost:4000" });

const middlewareAuthLink = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem(AUTH_TOKEN);
  const authorizationHeader = token ? `Bearer ${token}` : null;
  operation.setContext({
    headers: {
      authorization: authorizationHeader
    }
  });
  return forward(operation);
});

const httpLinkWithAuthToken = middlewareAuthLink.concat(httpLink);

const client = new ApolloClient({
  link: httpLinkWithAuthToken,
  cache: new InMemoryCache()
});

ReactDOM.render(
  <BrowserRouter>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </BrowserRouter>,
  document.getElementById("root")
);
registerServiceWorker();
