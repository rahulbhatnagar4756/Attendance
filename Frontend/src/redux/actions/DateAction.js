import {
    FETCH_CURRENT_DATE
  } from "../constants/ActionTypes";

export const fetchCurrentDate = () => {
    return {
      type: FETCH_CURRENT_DATE,
    };
  };