import { createStore, compose, applyMiddleware } from "redux";
import reducers from "./reducers";
import createSagaMiddleware from "@redux-saga/core";
import rootSaga from "./sagas";

const sagaMiddleware = createSagaMiddleware();

// const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = compose(
  applyMiddleware(sagaMiddleware),
  // window.devToolsExtension && window.devToolsExtension()
)(createStore)(reducers);

sagaMiddleware.run(rootSaga);

export default store;
