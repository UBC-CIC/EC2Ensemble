import {Grid} from '@material-ui/core';
import {ThemeProvider} from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline'

import './App.css';
import theme from "./themes";

import Login from "./Views/Authentication/Login";
import Home from './Views/Home';
import { Hub } from "aws-amplify";

import React, {useEffect} from "react";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import {updateLoginState} from "./Actions/loginActions";
import WebSocketClient from './WebSocket';
import PublicRoom from './Views/PublicRoom';


function App(props) {
    const {loginState, updateLoginState} = props;

    useEffect(() => {
        setAuthListener();
    }, []);

    function setAuthListener() {
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
            <ThemeProvider theme={theme}>
                {
                    <BrowserRouter>
                        <Switch>
                            <Route  exact path="/" 
                                    render={() =>(
                                        loginState !== "signedIn" ? (
                                            <Route render={() =>
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
                                                <Login  logo={"custom"} type={"image"} themeColor={"standard"} animateTitle={true}
                                                        title={"PCMA CIC"} darkMode={true}
                                                        disableSignUp={false}
                                                />
                                            } />
                                            ) : (
                                            <Route render={props => 
                                                <WebSocketClient currentState={loginState}>
                                                    <Home {...props}/>
                                                </WebSocketClient>
                                            }/>
                                        )
                                    )} 
                            />
                            <Route 
                                exact
                                path={"/share"} 
                                render={props => 
                                    <PublicRoom {...props}/>
                                }
                            />
                            <Redirect to="/" />
                        </Switch>
                    </BrowserRouter>
                }
            </ThemeProvider>
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
