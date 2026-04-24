import { call, all, put, takeEvery, fork } from "redux-saga/effects";
import { toast } from "react-toastify";
import { httpClient } from "../../constants/Api";
import { ATTENDENCE } from "../../constants/AppConstants";
import {
  FETCH_CURRENT_DATE,
  FETCH_CURRENT_DATE_SUCCESS,
  FETCH_CURRENT_DATE_FAIL,
} from "../constants/ActionTypes";

const fetchCurrentDate = async () => {
  return await httpClient.get(ATTENDENCE.GET_CURRENT_DATE);
};

//-----------------------------------------------------------------------------------
function* getDate() {
  try {
    const result = yield call(fetchCurrentDate);
    yield put({ type: FETCH_CURRENT_DATE_SUCCESS, data: result.data });
  } catch (err) {
    yield put({
      type: FETCH_CURRENT_DATE_FAIL,
      message: err.response.data.message,
    });
    if (err.response) {
      toast.error(err.response.data.message);
    } else {
      toast.error("Something went wrong");
    }
  }
}

//---------------------------------------------------------------------------------------
function* dateSaga() {
  yield takeEvery(FETCH_CURRENT_DATE, getDate);
}

export default function* rootSaga() {
  yield all([fork(dateSaga)]);
}
