import { makeStyles, withStyles } from '@material-ui/core/styles';
import { CircularProgress, Divider, Grid, Snackbar } from '@material-ui/core/';
import Alert from '@material-ui/lab/Alert';

// react
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

// icons
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
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
		borderColor: theme.palette.primary.main,
		padding: theme.spacing(3, 4),
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
	},
	smallScreen: {
		[theme.breakpoints.down('xs')]: {
			flexDirection: 'column',
			width: '100%',
			'& > button': {
				width: '100%',
				padding: theme.spacing(1, 0)
			},
		},
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
	},
	block: {
		display: 'block'
	},
	italic: {
		fontStyle: 'italic'
	}
}));

const SmallOutlinedButton = (props) => {
	const { children, ...others } = props;
	return (
		<DisabledButton size="small" variant="contained" color="primary" {...others}>
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
		},
		minWidth: '94px',
		margin: theme.spacing(1, 0)
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
	const [alert, handleAlert] = useState(false);
	const [disableButtons, handleDisableButtons] = useState(false);

	const dispatch = useDispatch();

	useEffect(() => {
		(async () => {
			if (status === 'running' || type === 'External Setup') {
				handleDisableButtons(false);
				setConnectionStyle(classes.running);
			} else if (status === 'terminated') {
				setConnectionStyle(classes.terminated);
				if (regionChangeInfo) {
					// if regionChangeInfo is not empty, which means the region param is changed
					await dispatch(changeRoomParams(currUser, serverId, regionChangeInfo, "region"));
					// reset regionChangeInfo
					setRegionChangeInfo('');
				}
				if (deletionStatus) {
					await dispatch(deleteRoom(currUser, serverId))
					handleDisableButtons(false);
				}
				handleDisableButtons(false);
			} else if (!!status && status.includes('fail')) {
				setConnectionStyle(classes.error);
			} else {
				setConnectionStyle(classes.creating);
			}
		})();
	}, [status]);

	const handleRoomTermination = async () => {
		handleDisableButtons(true);
		await dispatch(terminateRoom(currUser, region, serverId));
	};

	const handleRoomRestart = async () => {
		handleDisableButtons(true);
		await dispatch(restartRoom(currUser, region, serverId));
	};

	const handleJacktripRestart = async () => {
		handleDisableButtons(true);
		await dispatch(restartJackTrip(currUser, region, serverId));
	};
	
	const handleRoomDeletion = async () => {
		if ((status !== 'terminated') && 
			(status !== 'fail_create') &&
			(type !== 'External Setup')
		) {
			// need to terminate the room first if it is running
			setDeletionStatus(true);
			await handleRoomTermination();
		} else {
			handleDisableButtons(true);
			await dispatch(deleteRoom(currUser, serverId));
			handleDisableButtons(false);
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
				await handleRoomTermination();
			}
			setRegionChangeInfo(roomFormInfo)
		} else if (	((roomFormInfo.type ===  "AWS") && 
						((roomFormInfo.roomName !== roomName) || 
						(roomFormInfo.description !== description) ||
						(roomFormInfo.buffer !== buffer) ||
						(roomFormInfo.frequency !== frequency))
					) ||
					((roomFormInfo.type ===  "External Setup") && 
					((roomFormInfo.roomName !== roomName) || 
					(roomFormInfo.ipAddress !== ipAddress))) )
		{
			// check if buffer or frequency is changed
			handleDisableButtons(true);
			const bufFreqChange = roomFormInfo.buffer !== buffer || roomFormInfo.frequency !== frequency;
			await dispatch(changeRoomParams(currUser, serverId, roomFormInfo, bufFreqChange))
			handleDisableButtons(false);
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
				</div>
				<div className={`${classes.flexEnd} ${classes.block}`}>
					<div className={classes.alignCenter}>
						<span>STATUS:&nbsp;</span>
						{
							(status === 'running' && 
							<span>
								Running
							</span>) ||
							((type === "AWS") && (status === 'creating' || status === undefined) && (
								<span>In Creation</span>
							)) ||
							((type === "AWS") && (status === 'terminating') && <span>Stopping...</span>) ||
							((status === 'updating') && <span>Updating Settings...</span>) ||
							((status === 'restart_jacktrip') && <span>Restarting Jacktrip</span>) ||
							((status === 'terminated') && <span>Terminated</span>) ||
							((type === 'External Setup' ) && <span>External Room Server</span>)
						}
						{
							(type === "AWS") && (status !== 'running' && status !== 'terminated') ? 
							<div className={classes.progress}>
								<CircularProgress className={connectionStyle} size={15}/>
							</div>
							:
							<FiberManualRecordIcon className={connectionStyle} />
						}
					</div>
					{status === 'running' && 
						<div>
							<span className={classes.italic}>
								{userCount ? userCount : 0} user{!!userCount && userCount > 1 && "s"} connected
							</span>
						</div>
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
										variant="outlined"
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
				{(status === 'running') &&
					<div className={classes.smallScreen}>
						<DefaultButton
							onClick={handleShareModalOpen}
							startIcon={<ShareIcon fontSize="small"/>}
							disabled={ disableButtons }
						>
							Share
						</DefaultButton>
					</div>
				}
				<ShareRoomModal 
					open={shareModalOpen}
					handleClose={handleShareModalClose}
					id={serverId}
				/>
				<div
					className={`${classes.flexEnd} ${classes.margin_innerLeft} ${classes.smallScreen}`}
				>
					<DefaultButton
						disabled={
							(connectionStyle === classes.creating) ||
							(!!status && status.includes('fail')) ||
							disableButtons
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
							disabled={ disableButtons }
						>
							Restart Jacktrip
						</DefaultButton>
					}
					<DefaultButton
						disabled={
							(connectionStyle !== classes.terminated &&
							connectionStyle !== classes.running) ||
							disableButtons
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
							disabled={ disableButtons }
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
								(connectionStyle !== classes.terminated &&
								connectionStyle !== classes.running) ||
								disableButtons
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
