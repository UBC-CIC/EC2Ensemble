
const roomReducer = (currentState = {}, action) => {
    switch(action.type) {
        case "QUERY_ROOMS": {
            // change data structures from arr to obj for easier filtering access
            const roomObjs = convertArrayToObject(action.payload, 'serverId');
            return roomObjs
        }
        case "CREATE_ROOM" : {
            const serverId = action.payload.serverId;
            return {
                ...currentState, 
                [serverId] : action.payload
            }
        }
        case "DELETE_ROOM" : {
            const { serverId } = action.payload;
            delete currentState[serverId];
            return currentState
        }
        case "UPDATE_ROOM_STATUS": {
            const { serverId, status, ...others } = action.payload;
            const currRoomInfo = currentState[serverId];
            return {
                ...currentState,
                [serverId]: {
                    ...currRoomInfo,
                    ...others,
                    status: status,
                }
            }
        }
        case "UPDATE_ROOM_STATUS_SUCCESS": {
            const { serverId, ipAddress } = action.payload;
            // check if the current room still exists, in case it gets deleted
            if (currentState[serverId]) {
                const currRoomInfo = currentState[serverId];
                return {
                    ...currentState,
                    [serverId]: {
                        ...currRoomInfo,
                        status: 'running',
                        ipAddress: ipAddress,
                    }
                }
            }
            return currentState
        }
        default:
            return currentState
    }
}


// helpers
const convertArrayToObject = (arr, key) => 
  arr.reduce((obj, entry) => ((obj[entry[key]] = entry), obj), {});

export default roomReducer;