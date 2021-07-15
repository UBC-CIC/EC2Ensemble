import {Grid} from '@material-ui/core';
import './App.css';
import Login from "./Views/Authentication/Login";
import Home from "./Views/Home";
import { Hub } from "aws-amplify";
import React, {useState, useEffect} from "react";
import { BrowserRouter, Route } from "react-router-dom";
import { connect } from "react-redux";
import {updateLoginState} from "./Actions/loginActions";


function App(props) {
    const {loginState, updateLoginState} = props;

    const [currentLoginState, updateCurrentLoginState] = useState(loginState);

    useEffect(() => {
        setAuthListener();
    }, []);

    useEffect(() => {
        updateCurrentLoginState(loginState);
    }, [loginState]);

    async function setAuthListener() {
        Hub.listen('auth', (data)=> {
            switch(data.payload.event) {
                case "signOut":
                    updateLoginState("signIn");
                    break;
                default:
                    break;
            }
        })
    }

    return (
      <Grid container>
          <Grid item xs={12}>
              {
                  currentLoginState !== "signedIn" && (
                      /* Login component options:
                      *
                      * [logo: "custom", "none"]
                      * [type: "video", "image", "static"]
                      * [themeColor: "standard", "#012144" (color hex value in quotes) ]
                      *  Suggested alternative theme colors: #037dad, #5f8696, #495c4e, #4f2828, #ba8106, #965f94
                      * [animateTitle: true, false]
                      * [title: string]
                      * [darkMode (changes font/logo color): true, false]
                      * [disableSignUp: true, false]
                      * */
                      <Login logo={"custom"} type={"image"} themeColor={"standard"} animateTitle={true}
                             title={"PCMA CIC"} darkMode={true}
                             disableSignUp={false}
                      />
                  )
              }
              {
                  currentLoginState === "signedIn" && (
                    <BrowserRouter>
                        <Route path="/" render={props => <Home {...props}/>} />
                    </BrowserRouter>
                  )
              }
          </Grid>
      </Grid>
  );
}

const mapStateToProps = (state) => {
    return {
        loginState: state.loginState.currentState,
    };
};

const mapDispatchToProps = {
    updateLoginState,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);