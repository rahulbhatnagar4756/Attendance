import React from "react";
import { Switch, Route } from "react-router-dom";
import Sidebar from "../dashboard/Sidebar";
import WfhRequest from "./components/WfhRequest";

function App() {
  return (
    <div className="main_wrapper">
      <Sidebar />
      <Switch>
        <Route path="/work-from-home/apply" component={WfhRequest} />
        <Route path="*" component={() => "404 NOT FOUND"} />
      </Switch>
    </div>
  );
}

export default App;