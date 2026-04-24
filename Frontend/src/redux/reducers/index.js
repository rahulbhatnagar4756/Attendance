import { combineReducers } from "redux";
import auth from "./AuthReducer";
import timing from "./TimingReducer";
import route from "./RouterReducer";
import date from "./DateReducer";

const reducers = combineReducers({
  user: auth,
  time: timing,
  today: date,
  route: route,
});

export default reducers;
