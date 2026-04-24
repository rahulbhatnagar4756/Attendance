import { FETCH_ROUTE } from "../constants/ActionTypes";

const INIT_STATE = {
  route: "/",
};

export default function route(state = INIT_STATE, action) {
  switch (action.type) {
    case FETCH_ROUTE:
      return {
        ...state,
        route: action.route,
      };
    default:
      return state;
  }
}
