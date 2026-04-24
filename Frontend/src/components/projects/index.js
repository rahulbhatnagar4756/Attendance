import React from "react";
import { Switch, Route, Redirect, useRouteMatch } from "react-router-dom";
import Sidebar from "../dashboard/Sidebar";
import DailyStatusUpdates from "./components/DailyStatusUpdate";
import ProjectList from "./components/Project";
import ProjectDetails from "./components/ProjectDetails";
import SalesUpdates from "./components/SalesUpdates";
import SubjectDetails from "./components/SubjectDetails";
import ProjectUpdatedDetails from "./components/ProjectUpdatedDetails";



function Projects() {
  const { path } = useRouteMatch();
  return (
    <div className="main_wrapper">
      <Sidebar />
      <Switch>
        <Redirect exact from={`${path}`} to={`${path}`} />
        <Route path="/project/project-list" component={ProjectList} />
        <Route path="/project/get-project-detail/default-project/:daily_status" component={DailyStatusUpdates} />
        <Route path="/project/get-project-detail/:projectId" component={ProjectDetails} />
        <Route path="/project/project-messages/:subjectId" component={SubjectDetails} />
        <Route path="/project/project-update/all-messages/:projectId/:subjectId" component={ProjectUpdatedDetails} />
        <Route path="/project/get-sales-updates/:sales_status" component={SalesUpdates} />
        <Route path="*" component={() => "404 NOT FOUND"} />
      </Switch>
    </div>
  );
}

export default Projects;
