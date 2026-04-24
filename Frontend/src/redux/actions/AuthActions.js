import { SIGNIN_USER, SIGNOUT_USER } from "../constants/ActionTypes";

export const userSignIn = (user) => {
  return {
    type: SIGNIN_USER,
    payload: user,
  };
};

export const userSignOut = (token) => {
  return {
    type: SIGNOUT_USER,
    payload: token,
  };
};
