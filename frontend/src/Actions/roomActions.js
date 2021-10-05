/* get rooms from db and update */
export const queryUserRooms = (user) => async (dispatch) => {
	const url = process.env.REACT_APP_AWS_USERDB_BASE;
	const { userId, token } = getUserIdAndToken(user);

	const requestOptions = {
		method: 'GET',
		credentials: 'include',
		headers: {
			Authorization: token,
		},
	};

	await fetch(
		`${url}/user?user=${encodeURIComponent(userId)}`,
		requestOptions
	)
		.then((response) => response.json())
		.then((data) => {
			dispatch({
				type: 'QUERY_ROOMS',
				payload: data.Items,
			});
		})
		.catch((error) => {
			console.log('Error in querying room', error);
		});
};

/* create a room server */
export const createRoom = (user, roomFormInfo) => async (dispatch) => {
		const url = process.env.REACT_APP_AWS_API_BASE;
		const dbURL=process.env.REACT_APP_AWS_USERDB_BASE;
		const { userId, token } = getUserIdAndToken(user);

		const roomFormInfoUser = {
			user: userId,
			...roomFormInfo,
		};

		const requestOptions = {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
				Authorization: token,
			}
		};

		let res;

		if (roomFormInfo.type === 'AWS') {
			res = fetch(url, {
					...requestOptions, 
					body: JSON.stringify({
						...roomFormInfoUser,
						action: 'create'
					})
				}
			)
		} else {
			res = fetch(`${dbURL}/external`, 
				{
					...requestOptions, 
					body: JSON.stringify({
						...roomFormInfoUser,
					})
				}
			)
		}
		await res
			.then((response) => response.json())
			.then((data) => {
				// if successful, update the room list
				dispatch({
					type: 'CREATE_ROOM',
					payload: {
						...roomFormInfoUser,
						status: roomFormInfo.type === 'AWS' ? 'creating' : undefined
					}
				});
			})
			.catch((error) => {
				console.log('Error in creating room', error);
			});
};

/* delete a room server */
export const deleteRoom = (user, serverId) => async (dispatch) => {
	const url = process.env.REACT_APP_AWS_USERDB_BASE;
	const { userId, token } = getUserIdAndToken(user);

	const requestOptions = {
		method: 'DELETE',
		credentials: 'include',
		headers: { 
			'Content-Type': 'application/json',
			Authorization: token,
		},
	};

	await fetch(`${url}/user/${userId}/room/${encodeURI(serverId)}`, requestOptions)
		.then((response) => response.json())
		.then((data) => {
			// if successful, delete the room from the list
			dispatch({
				type: 'DELETE_ROOM',
				payload: {
					serverId: serverId,
				},
			});
		})
		.catch((error) => {
			console.log('Error in deleting the room', error);
		});
};

/* terminate the room server session when pressed on Stop button */
export const terminateRoom = (user, region, serverId) => async (dispatch) => {
		const url = process.env.REACT_APP_AWS_API_BASE;
		const { userId, token } = getUserIdAndToken(user);

		const requestOptions = {
			method: 'POST',
			credentials: 'include',
			headers: { 
				'Content-Type': 'application/json',
				Authorization: token,
			},
			body: JSON.stringify({
				user: userId,
				region: region,
				serverId: serverId,
				action: 'terminate',
			}),
		};

		await fetch(url, requestOptions)
			.then((response) => response.json())
			.then((data) => {
				// if successful posted, change room state to in process of "terminating" the session
				dispatch({
					type: 'UPDATE_ROOM_INFO',
					payload: {
						serverId: serverId,
						status: 'terminating',
						ipAddress: undefined,
					},
				});
			})
			.catch((error) => {
				console.log('Error in terminating the room', error);
			});
};

/* restart the room server session */
export const restartRoom = (user, region, serverId) => async (dispatch) => {
	const url = process.env.REACT_APP_AWS_API_BASE;
	const { userId, token } = getUserIdAndToken(user);


	const requestOptions = {
		method: 'POST',
		credentials: 'include',
		headers: { 
			'Content-Type': 'application/json',
			Authorization: token,
		},
		body: JSON.stringify({
			user: userId,
			region: region,
			serverId: serverId,
			action: 'restart',
		}),
	};

	await fetch(url, requestOptions)
		.then((response) => response.json())
		.then((data) => {
			// if successful, restart the room
			dispatch({
				type: 'UPDATE_ROOM_INFO',
				payload: {
					serverId: serverId,
					status: undefined,
				},
			});
		})
		.catch((error) => {
			console.log('Error in restarting the room', error);
		});
};

/* change room info */
export const changeRoomParams = (user, serverId, updatedRoomParams, updateType="param", bufFreqChange=false) => async (dispatch) => {
	const url = process.env.REACT_APP_AWS_API_BASE;
	const dbURL=process.env.REACT_APP_AWS_USERDB_BASE;

	const { userId, token } = getUserIdAndToken(user);

	const requestOptions = {
		method: updatedRoomParams.type === 'AWS' ? 'POST' : 'PUT',
		credentials: 'include',
		headers: { 
			'Content-Type': 'application/json',
			Authorization: token,
		}
	};

	let res;
	if (updatedRoomParams.type === 'AWS') {
		res = fetch(url, 
			{
				...requestOptions, 
				body: JSON.stringify({
					user: userId,
					serverId: serverId,
					action: updateType === 'param' ? 'param_change' : 'region_change',
					region: updatedRoomParams.region,
					buffer: updatedRoomParams.buffer,
					frequency: updatedRoomParams.frequency,
					roomName: updatedRoomParams.roomName,
					description: updatedRoomParams.description
				})
			}
		)
	} else {
		res = fetch(`${dbURL}/user/${userId}/external/${encodeURI(serverId)}`, 
				{
					...requestOptions, 
					body: JSON.stringify({
						roomName: updatedRoomParams.roomName,
						description: updatedRoomParams.description,
						ipAddress: updatedRoomParams.ipAddress
					})
				}
			)
	}
	await res
		.then((response) => response.json())
		.then((data) => {
			// if successful, update the params in the room
			/* if bufFreqChange === true, change room status, 
			* because we would be receiving a status update from ws,
			*
			* if bufFreqChange === false, or change external room server's ipaddress,
			* status remains the same
			*/
			dispatch({
				type: 'UPDATE_ROOM_INFO',
				payload: {
					...updatedRoomParams,
					serverId: serverId,
					status: (updatedRoomParams.type === 'AWS') && (bufFreqChange || updateType !== 'param') ? 'updating' : undefined
				},
			});
		})
		.catch((error) => {
			console.log('Error in changing room params', error);
		});
};

/* restart the jacktrip server */
export const restartJackTrip = (user, region, serverId) => async (dispatch) => {
	const url = process.env.REACT_APP_AWS_API_BASE;
	const { userId, token } = getUserIdAndToken(user);


	const requestOptions = {
		method: 'POST',
		credentials: 'include',
		headers: { 
			'Content-Type': 'application/json',
			Authorization: token,
		},
		body: JSON.stringify({
			user: userId,
			region: region,
			serverId: serverId,
			action: 'restart_jacktrip',
		}),
	};

	await fetch(url, requestOptions)
		.then((response) => response.json())
		.then((data) => {
			// if successful, restart jacktrip
			dispatch({
				type: 'UPDATE_ROOM_INFO',
				payload: {
					serverId: serverId,
					status: 'restart_jacktrip',
				},
			});
		})
		.catch((error) => {
			console.log('Error in restarting jacktrip', error);
		});
};

/* get messages from websocket and update the room status */
export const updateRoomStatus = (message) => (dispatch) => {
	switch(message.action) {
		case "create": {
			if (message.success === true) {
				dispatch({
					type: 'UPDATE_ROOM_INFO',
					payload: {
						serverId: message.serverId,
						ipAddress: message.ipAddress,
						status: 'running'
					},
				});
			}
			break;
		}
		case "terminate": {
			if (message.success === true) {
				dispatch({
					type: 'UPDATE_ROOM_INFO',
					payload: {
						serverId: message.serverId,
						status: 'terminated',
					},
				});
			}
			break;
		}
		case "connection_count": {
			dispatch({
				type: 'UPDATE_ROOM_INFO',
				payload: {
					serverId: message.serverId,
					userCount: parseInt(message.count),
				},
			});
			break;
		}
		case "param_change":
		case "restart_jacktrip":
		{
			if (message.success === true) {
				dispatch({
					type: 'UPDATE_ROOM_INFO',
					payload: {
						serverId: message.serverId,
						status: 'running'
					},
				});
			}
			break;
		}
		default: {
			break
		}
	}
	
};

// helper get userId and token
const getUserIdAndToken = (user) => {
	return { 
		userId: user.username, 
		token : user.getSignInUserSession().getIdToken().getJwtToken()
	}
}