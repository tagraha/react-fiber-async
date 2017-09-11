import { INCREMENT, DECREMENT } from "../constants";

export function incrementCounter() {
  return {
    type: INCREMENT
  };
}

export function decrementCounter() {
  return {
    type: DECREMENT
  };
}

function fetched(post) {
  return { type: 'FETCHED_DATA', payload: post };
}

export function getPostFromAPI() {
  return (dispatch, getState, { axios }) => {
    dispatch({ type: 'GET_DATA_FROM_API' });
    dispatch(incrementCounter())

    return axios
      .get(`https://jsonplaceholder.typicode.com/posts/${1}`)
      .then(({ data }) => dispatch(fetched(data)))
      // We use 'react-jobs' to call our actions.  We don't want to return
      // the actual action to the 'react-jobs' withJob as it will cause
      // the data to be serialized into the react-jobs state by the server.
      // As we already have the state in the redux state tree, which is also
      // getting serialized by the server we will just return a simple "true"
      // here to indicate to react-jobs that all is well.
      .then(() => true);
  }
}
