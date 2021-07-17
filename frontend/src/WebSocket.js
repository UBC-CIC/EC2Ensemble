import React, { useState, useEffect, useCallback } from 'react';
import { connect, useDispatch } from "react-redux";

import WebSocket from 'isomorphic-ws';

// aws
import { Auth } from "aws-amplify";

// internal imports
import Home from './Views/Home';
import { updateRoomStatus } from './Actions/roomActions';

function WebSocketClient(props) {
  const {loginState} = props;
  const dispatch = useDispatch();

  const [websocket, setWebsocket] = useState(null);

  useEffect(() => {
    (async () => {
      await Auth.currentAuthenticatedUser()
        .then(async (user) => {
          const userId = user.username;

          // load ws
          connectWS(userId);
        })
    })();
  }, [loginState]);


  const connectWS = useCallback((userId) => {
    const ws = new WebSocket(`${process.env.REACT_APP_WS_BASE}?user=${userId}`);

    // listening for open connection
    ws.onopen = () => {
        setWebsocket(ws)
        console.log("ws currently connected")
    }

    // listening for closed connection
    ws.onclose = (event) => {
        setWebsocket(null)
        console.log("ws closed", event.reason)
    }

    // *** listening for messages from ws 
    ws.onmessage = (event) => {
        onWebSocketMessage(event.data);
    }

    // listening for error
    ws.onerror = (error) => {
        console.log("error", error)
    }
  }, []);

  const onWebSocketMessage = useCallback((data) => {
    const message = JSON.parse(data);
    dispatch(updateRoomStatus(message));
  }, []);

  return (
      <Home ws={websocket} {...props}/>
    );
}

const mapStateToProps = (state) => {
  return {
      loginState: state.loginState.currentState,
  };
};

export default connect(mapStateToProps, null)(WebSocketClient);
