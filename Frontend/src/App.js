import React, { useEffect } from "react";
import "./App.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  useLocation
} from "react-router-dom";
import { useDispatch } from "react-redux";
import { createBrowserHistory } from "history";
import Login from "./components/Login";
import Dashboard from "./components/dashboard/Dashboard";
import Leaves from "./components/leaves";
import WorkFromHome from "./components/work-from-home";
import Profile from "./components/profile";
import Teams from "./components/teams";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { USER } from "./constants/AppConstants";
import { httpClient } from "./constants/Api";
import { SIGNIN_SUCCESS } from "./redux/constants/ActionTypes";
import TeamList from "./components/teamList";
import Projects from "./components/projects";
import { SocketContext, socket } from "./context/socket";
import Forms from "./components/forms";
import Docs from "./components/Docs";
import { PreviewFile } from "./components/Docs/components/PreviewFile";
import SalarySlip from "./components/SalarySlip";
import ForbiddenPage from "./components/ForbiddenPage";

function App() {
  const history = createBrowserHistory();
  const dispatch = useDispatch();
 
  useEffect(() => {
    const token = localStorage.getItem("tokens");
    if (token) {
      const getUser = async () => {
        try {
          await httpClient
            .get(USER.GET_USER)
            .then((res) => {
              if (res.status === 200) {
                dispatch({ type: SIGNIN_SUCCESS, user: res.data });
                localStorage.setItem("tokens", JSON.stringify(res.data.tokens));
                localStorage.setItem("user", JSON.stringify(res.data));
              }
            })
            .catch((err) => {
              if (err.response) {
                toast.error(err.response.data.message);
              } else {
                toast.error("Something went wrong");
              }
            });
        } catch (err) {
          console.log(err);
        }
      };
      getUser();
    }
  },[]);

  return (
    <div>
      <Router history={history}>
        <SocketContext.Provider value={socket}>
          <Switch>
            <Route exact path="/" render={() => <Redirect to="/login" />} />
            <Route exact path="/login" component={Login} />
            <ProtectedRoute path="/dashboard" component={Dashboard} />
            <ProtectedRoute path="/leaves" component={Leaves} />
            <ProtectedRoute path="/work-from-home" component={WorkFromHome} />
            <ProtectedRoute path="/profile" component={Profile} />
            <ProtectedRoute path="/teams" component={Teams} />
            <ProtectedRoute path="/teamlist" component={TeamList} />
            <ProtectedRoute path="/project" component={Projects} />
            <ProtectedRoute path="/user-form" component={Forms} />
            <ProtectedRoute path="/docs" component={Docs} />
            <ProtectedRoute path="/preview/:docId" component={PreviewFile} />
            <ProtectedRoute path="/salary" component={SalarySlip} />
            <ProtectedRoute path="/forbidden" component={ForbiddenPage} />
            <Route path="*" component={() => "404 NOT FOUND"} />
          </Switch>
        </SocketContext.Provider>
      </Router>
      <div>
        <ToastContainer autoClose={4000} />
      </div>
    </div>
  );
}

export default App;
