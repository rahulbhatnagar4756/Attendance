import {
  FETCH_TIMING,
  CHECK_IN,
  CHECK_OUT,
  BREAK_END,
  BREAK_START,
} from "../constants/ActionTypes";

export const fetchTiming = () => {
  return {
    type: FETCH_TIMING,
  };
};

export const checkIn = (data) => {
  return {
    type: CHECK_IN,
    payload: data,
  };
};

export const checkout = (data) => {
  return {
    type: CHECK_OUT,
    payload: data,
  };
};

export const breakStart = (data) => {
  return {
    type: BREAK_START,
    payload: data,
  };
};

export const breakEnd = (data) => {
  return {
    type: BREAK_END,
    payload: data,
  };
};
