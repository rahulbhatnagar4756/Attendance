import React from "react";
import { Switch, Route } from "react-router-dom";
import Sidebar from "../dashboard/Sidebar";
import LeaveHistory from "./components/LeaveHistory";
import LeaveRequest from "./components/LeaveRequest";

function App() {
  return (
    <div className="main_wrapper">
      <Sidebar />
      <Switch>
        <Route path="/leaves/apply" component={LeaveRequest} />
        <Route path="/leaves/list" component={LeaveHistory} />
        {/* <Route path="/list" component={Leaves} /> */}
        <Route path="*" component={() => "404 NOT FOUND"} />
      </Switch>
    </div>
  );
}

export default App;
