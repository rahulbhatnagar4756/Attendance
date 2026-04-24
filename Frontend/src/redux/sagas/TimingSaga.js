import { call, all, put, takeEvery, fork } from "redux-saga/effects";
import { toast } from "react-toastify";
import { httpClient } from "../../constants/Api";
import { ATTENDENCE } from "../../constants/AppConstants";
import {
  FETCH_TIMING,
  FETCH_TIMING_SUCCESS,
  FETCH_TIMING_FAIL,
  CHECK_IN_SUCCESS,
  CHECK_IN_FAIL,
  CHECK_IN,
  CHECK_OUT,
  CHECK_OUT_SUCCESS,
  CHECK_OUT_FAIL,
  BREAK_START,
  BREAK_START_SUCCESS,
  BREAK_START_FAIL,
  BREAK_END,
  BREAK_END_SUCCESS,
  BREAK_END_FAIL,
} from "../constants/ActionTypes";

const fetchTimings = async () => {
  return await httpClient.get(ATTENDENCE.GET_ATTENDENCE);
};

const checkIn = async (data) => {
  return await httpClient.post(ATTENDENCE.CHECK_IN, data.payload);
};

const checkout = async () => {
  return await httpClient.put(ATTENDENCE.CHECK_OUT);
};

const breakStart = async (data) => {
  return await httpClient.put(ATTENDENCE.BREAK_START, data.payload);
};

const breakEnd = async (data) => {
  return await httpClient.put(ATTENDENCE.BREAK_END);
};
//-----------------------------------------------------------------------------------
function* getTimings() {
  try {
    const result = yield call(fetchTimings);
    yield put({ type: FETCH_TIMING_SUCCESS, data: result.data });
  } catch (err) {
    yield put({ type: FETCH_TIMING_FAIL, message: err.response.data.message });
    if (err.response) {
      toast.error(err.response.data.message);
    } else {
      toast.error("Something went wrong");
    }
  }
}

function* markIn(data) {
  try {
    const res = yield call(checkIn, data);
    yield put({ type: CHECK_IN_SUCCESS, data: res.data });
    // const fetchTime = yield call(fetchTimings);
    // yield put({ type: FETCH_TIMING_SUCCESS, data: fetchTime.data });
  } catch (err) {
    yield put({ type: CHECK_IN_FAIL, message: err.response.data.message });
    if (err.response) {
      toast.error(err.response.data.message);
    } else {
      toast.error("Something went wrong");
    }
  }
}

function* markOut() {
  try {
    const res = yield call(checkout);
    yield put({ type: CHECK_OUT_SUCCESS, data: res.data });
    // const fetchTime = yield call(fetchTimings);
    // yield put({ type: FETCH_TIMING_SUCCESS, data: fetchTime.data });
  } catch (err) {
    yield put({ type: CHECK_OUT_FAIL, message: err.response.data.message });
    if (err.response) {
      toast.error(err.response.data.message);
    } else {
      toast.error("Something went wrong");
    }
  }
}

function* breakOn(data) {
  try {
    const res = yield call(breakStart, data);
    yield put({ type: BREAK_START_SUCCESS, data: res.data });
    // const fetchTime = yield call(fetchTimings);
    // yield put({ type: FETCH_TIMING_SUCCESS, data: fetchTime.data });
  } catch (err) {
    yield put({ type: BREAK_START_FAIL, message: err.response.data.message });
    if (err.response) {
      toast.error(err.response.data.message);
    } else {
      toast.error("Something went wrong");
    }
  }
}

function* breakOff(data) {
  try {
    const res = yield call(breakEnd);
    yield put({ type: BREAK_END_SUCCESS, data: res.data });
    // const fetchTime = yield call(fetchTimings);
    // yield put({ type: FETCH_TIMING_SUCCESS, data: fetchTime.data });
  } catch (err) {
    yield put({ type: BREAK_END_FAIL, message: err.response.data.message });
    if (err.response) {
      toast.error(err.response.data.message);
    } else {
      toast.error("Something went wrong");
    }
  }
}
//---------------------------------------------------------------------------------------
function* timeSaga() {
  yield takeEvery(FETCH_TIMING, getTimings);
}

function* checkInSaga() {
  yield takeEvery(CHECK_IN, markIn);
}
function* checkOutSaga() {
  yield takeEvery(CHECK_OUT, markOut);
}

function* breakOnSaga() {
  yield takeEvery(BREAK_START, breakOn);
}
function* breakOffSaga() {
  yield takeEvery(BREAK_END, breakOff);
}

export default function* rootSaga() {
  yield all([
    fork(timeSaga),
    fork(checkInSaga),
    fork(checkOutSaga),
    fork(breakOnSaga),
    fork(breakOffSaga),
  ]);
}
