import React from "react";
import { Switch, Route, Redirect, useRouteMatch } from "react-router-dom";
import Sidebar from "../dashboard/Sidebar";
import LeaveHistory from "./components/AttendenceComponent/LeaveHistory";
import AttendenceDetails from "./components/AttendenceDetails";
import MyTeam from "./components/MyTeam";

function Teams() {
  const { path } = useRouteMatch();
  return (
    <div className="main_wrapper">
      <Sidebar />
      <Switch>
        <Redirect exact from={`${path}`} to={`${path}`} />
        <Route path="/teams/my-team" component={MyTeam} />
        <Route
          path="/teams/attendence-detail/:userId"
          component={AttendenceDetails}
        />
        <Route
          exact
          path="/teams/leave-history/:userId"
          component={LeaveHistory}
        />
        <Route path="*" component={() => "404 NOT FOUND"} />
      </Switch>
    </div>
  );
}

export default Teams;
