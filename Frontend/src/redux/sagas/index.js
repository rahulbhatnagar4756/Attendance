import { all } from "redux-saga/effects";
import authSaga from "./AuthSaga";
import timeSaga from "./TimingSaga";
import dateSaga from "./DateSaga";

export default function* rootSaga() {
  yield all([authSaga(), timeSaga(), dateSaga()]);
}
