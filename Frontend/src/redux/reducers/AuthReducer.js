import {
  SIGNIN_USER,
  SIGNIN_FAIL,
  SIGNIN_SUCCESS,
} from "../constants/ActionTypes";

const INIT_STATE = {
  user: localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : "",
  loading: false,
  error: null,
};

export default function auth(state = INIT_STATE, action) {
  switch (action.type) {
    case SIGNIN_USER:
      return {
        ...state,
        loading: true,
      };
    case SIGNIN_SUCCESS:
      return {
        ...state,
        loading: false,
        user: action.user,
      };
    case SIGNIN_FAIL:
      return {
        ...state,
        loading: false,
        error: action.message,
      };

    default:
      return state;
  }
}
