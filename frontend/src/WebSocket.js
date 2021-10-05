import React, { useEffect, useCallback, useRef } from 'react';
import { useDispatch } from "react-redux";

// aws
import { Auth } from "aws-amplify";

// internal imports
import { updateRoomStatus } from './Actions/roomActions';


function WebSocketProvider (props) {
  const {currentState, children} = props;
  const dispatch = useDispatch();

  const clientWebSocket = useRef(null);

  useEffect(() => {
    (async () => {
      if (currentState === 'signedIn') {
        connectWS();
      }
    })();

    return () => {
      if (clientWebSocket.current) {
        clientWebSocket.current.close();
        clientWebSocket.current = null;
      }
    };
  }, [currentState]);

  const heartbeat = useCallback(() => {
    // check if websocket is still alive
    if (!clientWebSocket.current) return;
    if (clientWebSocket.current.readyState !== 1) return;
    // send messages to server to keep socket alive
    clientWebSocket.current.send(JSON.stringify({
      route: "heartbeat"
    }))
    // repeat every ~10 min
    setTimeout(heartbeat, 550000);
  }, [clientWebSocket]);

  const connectWS = async () => {
    if (!clientWebSocket.current) {

      await Auth.currentAuthenticatedUser()
        .then(async (user) => {
          await user.getSession((err, session) => {
            if (err) {
              return false;
            }

            if (session.isValid()) {
              const userId = user.username;
              const token = session.getIdToken().getJwtToken();
              const ws = new WebSocket(`${process.env.REACT_APP_WS_BASE}?Authorization=${token}&user=${userId}`);
              clientWebSocket.current = ws;
              return true;
            }
            return false;
          });

        })
    }
    // listening for open connection
    clientWebSocket.current.onopen = (event) => {
      heartbeat();
    }

    // listening for closed connection
    clientWebSocket.current.onclose = (event) => {
      clientWebSocket.current = null;
      // // reconnect to websocket, onclose might be triggered by backend integrations
      // setTimeout(connectWS(), 1000);
    }

    // listening for messages from ws 
    clientWebSocket.current.onmessage = (event) => {
      if (JSON.parse(event.data) && JSON.parse(event.data).message === "__thump__") {
        // listen for heartbeats from server
      } else {
        onWebSocketMessage(event.data);
      }
      return false;
    }

    // listening for error
    clientWebSocket.current.onerror = (error) => {
        console.log("Error")
    }
  };

  const onWebSocketMessage = useCallback((data) => {
    const message = JSON.parse(data);
    console.log(message)
    dispatch(updateRoomStatus(message));
  }, []);

  return (
    <div>
        { children }
    </div>
  );
}

export default WebSocketProvider;
