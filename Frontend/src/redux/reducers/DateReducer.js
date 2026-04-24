import {
    FETCH_CURRENT_DATE,FETCH_CURRENT_DATE_SUCCESS,FETCH_CURRENT_DATE_FAIL
  } from "../constants/ActionTypes";
  
  const INIT_STATE = {
    currentDate:"",
    loading: true,
    error: null,
  };
  
  export default function timing(state = INIT_STATE, action) {
    switch (action.type) {
      case FETCH_CURRENT_DATE:
        return {
          ...state,
          loading: true,
        };
      case FETCH_CURRENT_DATE_SUCCESS:
        return {
          ...state,
          loading: false,
          currentDate: action.data,
        };
      case FETCH_CURRENT_DATE_FAIL:
        return {
          ...state,
          loading: false,
          error: action.message,
        };
      default:
        return state;
    }
  }
  