import React from "react";
import { Switch, Route, Redirect, useRouteMatch } from "react-router-dom";
import Sidebar from "../dashboard/Sidebar";
import LeaveHistory from "../teams/components/AttendenceComponent/LeaveHistory";
import AttendenceDetails from "../teams/components/AttendenceDetails";
import EmployeeDetails from "./components/EmployeeDetails";


import MyTeamList from "./components/MyTeamList";

function TeamList() {
  const { path } = useRouteMatch();
  return (
    <div className="main_wrapper">
      <Sidebar />
      <Switch>
        <Redirect exact from={`${path}`} to={`${path}`} />
        <Route path="/teamlist/my-team-list" component={MyTeamList} />
        <Route
          path="/teams/attendence-detail/:userId"
          component={AttendenceDetails}
        />
        <Route
          exact
          path="/teams/leave-history/:userId"
          component={LeaveHistory}
        />
        <Route exact 
        path="/teamlist/employeedetails/:userId" 
        component={EmployeeDetails} />
        <Route path="*" component={() => "404 NOT FOUND"} />
      </Switch>
    </div>
  );
}

export default TeamList;
