import React from "react";
import { Switch, Route } from "react-router-dom";
import FeedBackForm from "./FeedBackForm";
import ThankYou from "./ThankYou";
import ViewForm from "./ViewForm";

function Forms() {
  return (
    <div className="main_wrapper">
      <Switch>
        <Route path="/user-form/thankyou" component={ThankYou}  />
        <Route path="/user-form/view-form/:userId/:formId" component={ViewForm} />
        <Route exact path="/user-form/:formId" component={FeedBackForm} />
        <Route path="*" component={() => "404 NOT FOUND"} />
      </Switch>
    </div>
  );
}

export default Forms;
