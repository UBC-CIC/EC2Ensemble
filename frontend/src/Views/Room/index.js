import { makeStyles, withStyles } from '@material-ui/core/styles';
import { Button, CircularProgress, Divider, Grid, Snackbar } from '@material-ui/core/';
import Alert from '@material-ui/lab/Alert';

// react
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

// icons
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import IconButton from '@material-ui/core/IconButton';
import ShareIcon from '@material-ui/icons/Share';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import StopIcon from '@material-ui/icons/Stop';
import RefreshIcon from '@material-ui/icons/Refresh';

// actions
import { changeRoomParams, deleteRoom, restartJackTrip, restartRoom, terminateRoom } from '../../Actions/roomActions';

// components
import CreateEditRoomForm from '../CreateEditRoomForm';
import ShareRoomModal from '../ShareRooms'
import { DisabledButton } from '../../Components/Buttons';

const useStyles = makeStyles((theme) => ({
	root: {
		backgroundColor: theme.palette.quaternary.main,
		borderStyle: 'solid',
		borderRadius: '10px',
		borderWidth: '2px',
		padding: theme.spacing(3, 4),
		color: theme.palette.getContrastText(theme.palette.quaternary.main)
	},
	flexEnd: {
		marginLeft: 'auto',
		display: 'flex',
		alignItems: 'center',
	},
	margin_horizontal2: {
		margin: theme.spacing(2, 'auto'),
	},
	innerVerticalPadding: {
		'& div': {
			padding: theme.spacing(1, 0),
		},
	},
	innerHeight: {
		'& div': {
			display: 'flex',
			height: '34px',
			alignItems: 'center',
		},
	},
	margin_innerLeft: {
		display: 'flex',
		[theme.breakpoints.up('sm')]: {
			'& > button:not(:first-child)': {
				marginLeft: '16px',
			},
		},
		[theme.breakpoints.down('xs')]: {
			flexDirection: 'column',
			width: '100%',
			'& > button': {
				width: '100%',
				margin: theme.spacing(1, 0),
				padding: theme.spacing(1, 0)
			},
		},
	},
	divider: {
		background: '#a88843',
	},
	info: {
		marginBottom: '10px',
	},
	width: {
		width: '100%',
	},
	marginRight: {
		marginRight: '16px',
	},
	running: {
		color: '#77e94e',
	},
	creating: {
		color: '#ebc334',
	},
	terminated: {
		color: '#9c9c9c',
	},
	error: {
		color: 'red'
	},
	alignCenter: {
		display: 'flex',
		alignItems: 'center'
	},
	progress: {
		display: "flex",
		padding: theme.spacing(0, 1)
	}
}));

const SmallOutlinedButton = (props) => {
	const { children, ...others } = props;
	return (
		<DisabledButton size="small" variant="contained" color="secondary" {...others}>
			{children}
		</DisabledButton>
	);
};
const DefaultButton = withStyles((theme) => ({
	root: {
		borderRadius: 5,
		padding: theme.spacing(0.5, 1),
		'&:hover': {
			background: theme.palette.tertiary.main
		}
	},
}))(SmallOutlinedButton);

function Room(props) {
	const classes = useStyles();
	const {
		roomName,
		description,
		region,
		frequency,
		buffer,
		status,
		ipAddress,
		serverId,
		currUser,
		userCount,
		type
	} = props;

	/* there are three connection status
	 * running    === room connected and running
	 * creating   === room in process of being created/connected
	 * terminated === no connection to room, most likely been terminated
	 * */
	const [connectionStyle, setConnectionStyle] = useState(classes.terminated);
	const [regionChangeInfo, setRegionChangeInfo] = useState('');
	const [deletionStatus, setDeletionStatus] = useState(false);
	const [shareModalOpen, setShareModalOpen] = useState(false);
	const [alert, handleAlert] = useState(false)

	useEffect(() => {
		if (status === 'running' || type === 'External Setup') {
			setConnectionStyle(classes.running);
		} else if (status === 'terminated') {
			setConnectionStyle(classes.terminated);
			if (regionChangeInfo) {
				// if regionChangeInfo is not empty, which means the region param is changed
				dispatch(changeRoomParams(currUser, serverId, regionChangeInfo, "region"));
				// reset regionChangeInfo
				setRegionChangeInfo('');
			}
			if (deletionStatus) {
				dispatch(deleteRoom(currUser, serverId))
				setDeletionStatus(false)
			}
		} else if (!!status && status.includes('fail')) {
			setConnectionStyle(classes.error);
		} else {
			setConnectionStyle(classes.creating);
		}
	}, [status, regionChangeInfo, deletionStatus]);

	const dispatch = useDispatch();

	const handleRoomTermination = () => {
		dispatch(terminateRoom(currUser, region, serverId));
	};

	const handleRoomRestart = () => {
		dispatch(restartRoom(currUser, region, serverId));
	};

	const handleJacktripRestart = () => {
		dispatch(restartJackTrip(currUser, region, serverId));
	};
	
	const handleRoomDeletion = () => {
		if ((status !== 'terminated') && 
			(status !== 'fail_create') &&
			(type !== 'External Setup')
		) {
			// need to terminate the room first if it is running
			handleRoomTermination();
			setDeletionStatus(true)
		} else {
			dispatch(deleteRoom(currUser, serverId))
		}
	};

	const handleShareModalOpen = () => {
		setShareModalOpen(true);
	};
	
	const handleShareModalClose = () => {
		setShareModalOpen(false);
	};

	// modal
	const [modalOpen, setModalOpen] = useState(false);
	const [modalLoading, setModalLoading] = useState(false);

	const handleModalClose = () => {
		setModalOpen(false);
	};

	const handleFormSubmit = async (event, roomFormInfo) => {
		event.preventDefault();

		setModalLoading(true);
		// change room params
		if (roomFormInfo.region !== region) {
			// if room is not terminated, terminate the room first
			if (status !== 'terminated') {
				handleRoomTermination();
			}
			setRegionChangeInfo(roomFormInfo)
		} else if (	((roomFormInfo.type ===  "AWS") && 
						((roomFormInfo.roomName !== roomName) || 
						(roomFormInfo.description !== description) ||
						(roomFormInfo.buffer !== buffer) ||
						(roomFormInfo.frequency !== frequency))
					) ||
					((roomFormInfo.type ===  "External Setup") && (roomFormInfo.ipAddress !== ipAddress)))
		{
			await dispatch(changeRoomParams(currUser, serverId, roomFormInfo))
		}
		// let the buttons stop loading
		setModalLoading(false);
		// close the modal
		handleModalClose();
	};

	const handleAlertOpen = () => {
		navigator.clipboard.writeText(ipAddress)
		handleAlert(true)
	}
	
	const handleAlertClose = () => {
		handleAlert(false);
	};

	return (
		<Grid container alignContent="flex-start" className={classes.root}>
			<Grid container item alignItems="center">
				<div className={classes.alignCenter}>
					<div>{roomName}</div>
					{(status === 'running') &&
						<IconButton 
							fontSize="small" 
							variant="contained"
							color="secondary"
							className={classes.margin_horizontal}
							onClick={handleShareModalOpen}
						>
							<ShareIcon fontSize="small"/>
						</IconButton>
					}
					<ShareRoomModal 
						open={shareModalOpen}
						handleClose={handleShareModalClose}
						id={serverId}
					/>
				</div>
				<div className={`${classes.flexEnd}`}>
					{
						(status === 'running' && 
						<span>
							{userCount ? userCount : 0} user{!!userCount && userCount > 1 && "s"} connected
						</span>) ||
						((type === "AWS") && (status === 'creating' || status === undefined) && (
							<span>In Creation
							</span>
						)) ||
						((type === "AWS") && (status === 'terminating') && <span>Stopping...</span>) ||
						((status === 'updating') && <span>Updating Settings...</span>) ||
						((status === 'restart_jacktrip') && <span>Restarting Jacktrip</span>)
					}
					{
						(type === "AWS") && (status === 'creating' || status === undefined) ? 
						<div className={classes.progress}>
							<CircularProgress className={connectionStyle} size={15}/>
						</div>
						:
						<FiberManualRecordIcon className={connectionStyle} />
					}
				</div>
			</Grid>
			<Grid item xs={12} className={classes.margin_horizontal2}>
				<Divider className={classes.divider} />
			</Grid>
			<Grid container direction="row" className={classes.info}>
				{!!description && (
					<Grid item className={classes.innerVerticalPadding}>
						<div>Description: {description}</div>
					</Grid>
				)}
				<Grid container item direction="row">
					<Grid item sm={12} md={5} className={`${classes.width}`}>
						<Grid item className={classes.innerHeight}>
							<div>
								<span className={classes.marginRight}>
									IP Address:{' '}
									{!!ipAddress ? ipAddress : 'N/A'}
								</span>
								{!!ipAddress && (
									<DefaultButton 
										onClick={handleAlertOpen}
										startIcon={<FileCopyIcon/>}
									>
										Copy
									</DefaultButton>
							  	)}
							  	<Snackbar 
								  	anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
									open={alert} 
									autoHideDuration={2500} 
									onClose={handleAlertClose}
								>
									<Alert severity="success" sx={{ width: '100%' }}>
										Successfully copied ip address for room {roomName}!
									</Alert>
								</Snackbar>
							</div>
							{
								(type === "AWS") &&
								<>
									<div>Region: {region}</div>
									{/* <div>Capacity: {size}</div> */}
								</>
							}
						</Grid>
					</Grid>

					{
						(type === "AWS") &&
						<Grid item className={classes.innerHeight}>
							<div>Sampling Frequency: {frequency}</div>
							<div>Buffer Size: {buffer}</div>
						</Grid>
					}
				</Grid>
			</Grid>
			<Grid container item alignItems="center">
				<div
					className={`${classes.flexEnd} ${classes.margin_innerLeft}`}
				>
					<DefaultButton
						disabled={
							(connectionStyle === classes.creating) ||
							(!!status && status.includes('fail'))
						}
						onClick={handleRoomDeletion}
						startIcon={<DeleteIcon />}
					>
						Delete
					</DefaultButton>
					{/* <DefaultButton
						disabled={
							connectionStyle !== classes.terminated &&
							connectionStyle !== classes.running
						}
						// onClick={testInstanceLatency}
					>
						Test Latency {latency && `:${latency}`}
					</DefaultButton> */}
					{(status === 'running') &&
						<DefaultButton 
							onClick={handleJacktripRestart}
							startIcon={<RefreshIcon/>}
						>
							Restart Jacktrip
						</DefaultButton>
					}
					<DefaultButton
						disabled={
							connectionStyle !== classes.terminated &&
							connectionStyle !== classes.running
						}
						onClick={() => {
							setModalOpen(true)
						}}
						startIcon={<EditIcon/>}
					>
						Edit Settings
					</DefaultButton>
					<CreateEditRoomForm
						open={modalOpen}
						handleClose={handleModalClose}
						handleSubmit={handleFormSubmit}
						loading={modalLoading}
						roomInfo={!!modalOpen && props}
					/>
					{((status === 'terminated') || (status === 'fail_create')) && (
						<DefaultButton
							onClick={handleRoomRestart}
							startIcon={<PlayArrowIcon/>}
						>
							{status === 'terminated' ? 'Start' : 'Retry'}
						</DefaultButton>
					)}
					{(status !== 'terminated') && 
					(type !== 'External Setup') && 
					(!!status && !status.includes('fail')) && 
					(
						<DefaultButton
							disabled={
								connectionStyle !== classes.terminated &&
								connectionStyle !== classes.running
							}
							onClick={handleRoomTermination}
							startIcon={
								(connectionStyle === classes.running)
									? 
									<StopIcon/>
									:
									<CircularProgress size={15}/>
							}
						>
							{status === 'terminating'
								? 'Stopping...'
								: connectionStyle !== classes.running
								? 'Starting...'
								: 'Stop'}
						</DefaultButton>
					)}
				</div>
			</Grid>
		</Grid>
	);
}


export default Room;
