import React from "react";
import { Switch, Route } from "react-router-dom";
import Sidebar from "../dashboard/Sidebar";
import MyProfile from "./components/MyProfile";

function Profile() {
  return (
    <div className="main_wrapper">
      <Sidebar />
      <Switch>
        <Route path="/profile/my-profile" component={MyProfile} />
        <Route path="*" component={() => "404 NOT FOUND"} />
      </Switch>
    </div>
  );
}

export default Profile;
