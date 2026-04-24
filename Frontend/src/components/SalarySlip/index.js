import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Sidebar from '../dashboard/Sidebar';
import EmployeeSalarySlip from './components/EmployeeSalarySlip';

function SalarySlip() {
  return (
    <div className="main_wrapper">
      <Sidebar />
      <Switch>
        <Route path="/salary/slip" component={EmployeeSalarySlip} />
        <Route path="*" component={() => '404 NOT FOUND'} />
      </Switch>
    </div>
  );
}

export default SalarySlip;
