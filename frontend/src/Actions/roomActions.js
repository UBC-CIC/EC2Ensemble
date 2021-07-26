/* get rooms from db and update */
export const queryRooms = (userId) => async (dispatch) => {
    await fetch(`${process.env.REACT_APP_AWS_USERDB_BASE}?user=${encodeURIComponent(userId)}`)
        .then(response => response.json())
        .then(data => {
            dispatch({
                type: 'QUERY_ROOMS',
                payload: data.Items
            });
        })
        .catch(error => {
            console.log('Error in querying room', error);
        });
};

/* create a room server */
export const createRoom = (currUser, serverId, roomFormInfo) => async (dispatch) => {
    const url = process.env.REACT_APP_AWS_API_BASE;

    const roomFormInfoUser = {
        user: currUser,
        serverId: serverId,
        ...roomFormInfo
    };

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
            ...roomFormInfoUser,
            action: 'create'
      })
    };

    await fetch(url, requestOptions)
      .then(response => response.json())
      .then(data => {
        // if successful, update the room list
        dispatch({
            type: 'CREATE_ROOM',
            payload: {
                serverId: serverId,
                roomInfo: roomFormInfoUser,
            }
        });
      })
      .catch(error => {
        console.log('Error in creating room', error);
    });
};

/* delete a room server */
export const deleteRoom = (currUser, region, serverId) => async (dispatch) => {
    const url = process.env.REACT_APP_AWS_API_BASE;

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: currUser,
        region: region,
        serverId: serverId,
        action: "delete"
      })
    };

    await fetch(url, requestOptions)
      .then(response => response.json())
      .then(data => {
        // if successful, delete the room from the list
        dispatch({
            type: 'DELETE_ROOM',
            payload: {
                serverId: serverId,
            }
        });
      })
      .catch(error => {
        console.log('Error in deleting the room', error);
    });
};

/* terminate the room server session when pressed on Stop button */
export const terminateRoom = (currUser, region, serverId) => async (dispatch) => {
    const url = process.env.REACT_APP_AWS_API_BASE;

    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            user: currUser,
            region: region,
            serverId: serverId,
            action: "terminate"
        })
    };

    await fetch(url, requestOptions)
      .then(response => response.json())
      .then(data => {
        // if successful posted, change room state to in process of "terminating" the session
        dispatch({
            type: 'UPDATE_ROOM_STATUS',
            payload: {
                serverId: serverId,
                status: 'terminating'
            }
        });
      })
      .catch(error => {
        console.log('Error in terminating the room', error);
    });
};

/* restart the room server session */
export const restartRoom = (currUser, region, serverId) => async (dispatch) => {
    const url = process.env.REACT_APP_AWS_API_BASE;

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: currUser,
        region: region,
        serverId: serverId,
        action: "restart"
      })
    };

    await fetch(url, requestOptions)
      .then(response => response.json())
      .then(data => {
        // if successful, restart the room
        dispatch({
            type: 'UPDATE_ROOM_STATUS',
            payload: {
                serverId: serverId,
                status: undefined
            }
        });
      })
      .catch(error => {
        console.log('Error in deleting the room', error);
    });
};


/* get messages from websocket and update the room status */
export const updateRoomStatus = (message) => (dispatch) => {
    if ((message.action === "create") && (message.success === true)) {
        dispatch({ 
            type: "UPDATE_ROOM_STATUS_SUCCESS", 
            payload:{
                serverId: message.serverId,
                ipAddress: message.ipAddress
            } 
        });
    } else if (message.action === "terminate") {
        dispatch({ 
            type: "UPDATE_ROOM_STATUS", 
            payload:{
                serverId: message.serverId,
                status: 'terminated'
            } 
        });
    }
};