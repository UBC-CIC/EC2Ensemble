import React, { useEffect, useCallback, useRef } from 'react';
import { useDispatch } from "react-redux";

import WebSocket from 'isomorphic-ws';

// aws
import { Auth } from "aws-amplify";

// internal imports
import { updateRoomStatus } from './Actions/roomActions';

export default function WebSocketProvider (props) {
  const {currentState, children} = props;
  const dispatch = useDispatch();

  const clientWebSocket = useRef(null);

  useEffect(() => {
    (async () => {
      await Auth.currentAuthenticatedUser()
        .then(async (user) => {
          const userId = user.username;

          // load ws
          connectWS(userId);
        })
    })();
  }, [currentState]);

  const heartbeat = useCallback(() => {
    // check if websocket is still alive
    if (!clientWebSocket.current) return;
    if (clientWebSocket.current.readyState !== 1) return;
    // send messages to server to keep socket alive
    clientWebSocket.current.send(JSON.stringify({
      route: "heartbeat"
    }))
    // repeat
    setTimeout(heartbeat, 550000);
  }, [clientWebSocket]);

  const connectWS = useCallback((userId) => {
    if (!clientWebSocket.current) {
      const ws = new WebSocket(`${process.env.REACT_APP_WS_BASE}?user=${userId}`);
      clientWebSocket.current = ws;
    }

    // listening for open connection
    clientWebSocket.current.onopen = (event) => {
      heartbeat();
    }

    // listening for closed connection
    clientWebSocket.current.onclose = (event) => {
        console.log(clientWebSocket.current)
        // reconnect to websocket, onclose might be triggered by backend integrations
        setTimeout(connectWS(userId), 1000);
    }

    // listening for messages from ws 
    clientWebSocket.current.onmessage = (event) => {
      // console.log(JSON.parse(event.data).message)
      if (JSON.parse(event.data).message === "__thump__") {
        // listen for heartbeats from server
      } else {
        onWebSocketMessage(event.data);
      }
      return false;
    }

    // listening for error
    clientWebSocket.current.onerror = (error) => {
        console.log("error", error)
    }
  }, []);

  const onWebSocketMessage = useCallback((data) => {
    const message = JSON.parse(data);
    dispatch(updateRoomStatus(message));
  }, []);

  return (
    <div>
        { children }
    </div>
  );
}