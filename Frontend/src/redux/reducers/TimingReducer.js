import {
  FETCH_TIMING,
  FETCH_TIMING_FAIL,
  FETCH_TIMING_SUCCESS,
  CHECK_IN,
  CHECK_IN_FAIL,
  CHECK_IN_SUCCESS,
  CHECK_OUT,
  CHECK_OUT_FAIL,
  CHECK_OUT_SUCCESS,
  BREAK_START,
  BREAK_END,
  BREAK_END_FAIL,
  BREAK_END_SUCCESS,
  BREAK_START_FAIL,
  BREAK_START_SUCCESS,
} from "../constants/ActionTypes";

const INIT_STATE = {
  timing: "",
  loading: true,
  error: null,
};

export default function timing(state = INIT_STATE, action) {
  switch (action.type) {
    case FETCH_TIMING:
      return {
        ...state,
        loading: true,
      };
    case FETCH_TIMING_SUCCESS:
      return {
        ...state,
        loading: false,
        timing: action.data,
      };
    case FETCH_TIMING_FAIL:
      return {
        ...state,
        loading: false,
        error: action.message,
      };
    case CHECK_IN:
      return {
        ...state,
        loading: true,
      };
    case CHECK_IN_SUCCESS:
      return {
        ...state,
        loading: false,
        timing: action.data,
      };
    case CHECK_IN_FAIL:
      return {
        ...state,
        loading: false,
        error: action.message,
      };
    case CHECK_OUT:
      return {
        ...state,
        loading: true,
      };
    case CHECK_OUT_SUCCESS:
      return {
        ...state,
        loading: false,
        timing: action.data,
      };
    case CHECK_OUT_FAIL:
      return {
        ...state,
        loading: false,
        error: action.message,
      };
    case BREAK_START:
      return {
        ...state,
        loading: true,
      };
    case BREAK_START_SUCCESS:
      return {
        ...state,
        loading: false,
        timing: action.data,
      };
    case BREAK_START_FAIL:
      return {
        ...state,
        loading: false,
        error: action.message,
      };
    case BREAK_END:
      return {
        ...state,
        loading: true,
      };
    case BREAK_END_SUCCESS:
      return {
        ...state,
        loading: false,
        timing: action.data,
      };
    case BREAK_END_FAIL:
      return {
        ...state,
        loading: false,
        error: action.message,
      };
    default:
      return state;
  }
}
