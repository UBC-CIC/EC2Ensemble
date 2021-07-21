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

  // function heartbeat() {
  //   if (!websocket) return;
  //   if (websocket.readyState !== 1) return;
  //   websocket.send("__ping__");
  //   setTimeout(heartbeat, 5000);
  // }


  const connectWS = useCallback((userId) => {
    const ws = new WebSocket(`${process.env.REACT_APP_WS_BASE}?user=${userId}`);
    let timer = 0;

    // listening for open connection
    ws.onopen = () => {
        setWebsocket(ws)
        console.log("ws currently connected")
        setInterval(() => {
          ws.send('__ping__');

          timer = setTimeout(() => {
            // closed connection
          }, 5000);
        }, 30000);
    }

    // listening for closed connection
    ws.onclose = (event) => {
        setWebsocket(null);
        // reconnect to websocket, onclose might be triggered by backend integrations
        setTimeout(connectWS(userId), 1000);
    }

    // *** listening for messages from ws 
    ws.onmessage = (event) => {
      console.log(JSON.parse(event.data))
      if (JSON.parse(event.data).message === '__pong__') {
        // listen for pong
        clearTimeout(timer);
      } else {
        onWebSocketMessage(event.data);
      }
      return false;
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
