import React from "react";
import { Switch, Route, Redirect, useRouteMatch } from "react-router-dom";
import Sidebar from "../dashboard/Sidebar";
import { MainPage } from "./components/MainPage";

function Docs() {
  const { path } = useRouteMatch();
  return (
    <div className="main_wrapper">
            <Sidebar />
      <Switch>
        <Redirect exact from={`${path}`} to={`${path}`} />
        <Route path="/docs/main-page" component={MainPage} />
        <Route path="*" component={() => "404 NOT FOUND"} />
      </Switch>
    </div>
  );
}

export default Docs;
