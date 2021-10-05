import React, { useEffect, useState } from 'react';
import { API } from 'aws-amplify';


// materialUI
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Alert from '@material-ui/lab/Alert';
import { Button, Divider, Grid } from '@material-ui/core/';

// internal imports
import Navbar from '../Components/Navbar';

// icons
import FileCopyIcon from '@material-ui/icons/FileCopy';


const useStyles = makeStyles((theme) => ({
  root: {
    minWidth: '80vw',
    maxWidth: '80vw',
    minHeight: 273,
    maxHeight: 273,
    '& > .MuiButtonBase-root': {
        minWidth: '80vw',
        maxWidth: '80vw',
        minHeight: 273,
        maxHeight: 273,
    }
  },
  flexEnd: {
    marginLeft: "auto",
  },
  margin_vertical2: {
    margin: theme.spacing(2, 'auto')
  },
  margin_vertical3: {
    margin: theme.spacing(3, 'auto')
  },
  underlineText: {
    textDecoration: "underline",
    textUnderlineOffset: "0.1em"
  },
  navBar: {
    height: '50px',
    background: '#c4c4c4',
    padding: theme.spacing(0, 2)
  },
  flex: {
    display: 'flex'
  },
  alignCenter: {
    alignItems: 'center'
  },
  columnTitle: {
    width: 130,
  },
  full: {
    height: '100vh'
  },
  textCenter: {
    textAlign: 'center'
  }
}))

const SmallOutlinedButton = (props) => {
	const { children, ...others } = props;
	return (
		<Button size="small" variant="outlined" {...others}>
			{children}
		</Button>
	);
};
const DefaultButton = withStyles((theme) => ({
	root: {
		borderRadius: 5,
		padding: theme.spacing(0.5, 1),
    margin: theme.spacing(0, 2),
	},
}))(SmallOutlinedButton);


function PublicRoom(props) {
  const classes = useStyles();
  const [alert, handleAlert] = useState(false);
  const [loading, handleLoading] = useState(true);
  const [room, setRoom] = useState("");
  const [emptyRoom, handleEmptyRoom] = useState(false);

  useEffect(() => {
    (async () => {
      // remove the "/" in the pathname to get the userLinkID
      const roomId = new URLSearchParams(props.location.search).get("room");
      console.log(window.location.href, new URLSearchParams(props.location.search), new URLSearchParams(props.location.search).get("room"))
      
      if (roomId) {
        await API.get('getOneRoom', `/room/${roomId}`)
          .then((response) => {
            const data = JSON.parse(response.body);
            updateRoom(data);
          })
          .catch((error) => {
            handleEmptyRoom(true);
            console.log('Error in querying room', error);
          });
      }
    })();
  }, []);

  const updateRoom = (room) => {
    if (JSON.stringify(room) === '{}') {
      handleEmptyRoom(true);
    } else {
      setRoom(room)
      handleLoading(false);
    }
  }

  const handleAlertOpen = () => {
    navigator.clipboard.writeText(room.ipAddress)
    handleAlert(true)
  }

  const handleAlertClose = () => {
    handleAlert(false);
  };


  return (
    <Grid container justifyContent="center">
      <Navbar/>
      { !!loading &&
        <Grid container alignItems="center" justifyContent="center" className={classes.full}>
          {!emptyRoom ? <h1>Loading...</h1> : (
            <div className={classes.textCenter}>
              <h1>Invalid Room</h1>
              <h3>Please check if you entered the correct link</h3>
            </div>
          )}
        </Grid>
      }
      {!loading &&
        <Grid item xs={11} sm={10}>
        <Grid container item direction="row" alignItems="center" className={classes.margin_vertical2}>
          <div className={`${classes.flex} ${classes.alignCenter}`}>
            <h2>SHARE ROOM: {room.roomName}</h2>
          </div>
        </Grid>
        <Grid>
          <div key={`room-${room.roomName}`} className={classes.margin_vertical2}>
            <Grid container item direction="row" alignItems="flex-start">
              <Grid item xs={2}><p>DESCRIPTION:</p></Grid>
              <Grid item xs={10}><p>{room.description}</p></Grid>
            </Grid>
            <Divider />
            <Grid container item direction="row" alignItems="center">
              <Grid item xs={2}><p>IP ADDRESS:</p></Grid>
              <Grid container item xs={10} direction="row" alignItems="center">
                <p>{room.ipAddress}</p>
                {!!room.ipAddress && (
                  <Grid container item xs direction="row" alignItems="center">
									  <DefaultButton 
                      onClick={handleAlertOpen}
                      startIcon={<FileCopyIcon/>}
                      color="primary"
                      variant="contained"
                    >
                      Copy
                    </DefaultButton>
                    { alert && setTimeout(() => {
                      handleAlertClose()
                    }, 2500) && 
                      (
                        <Alert severity="success" sx={{ width: '100%' }}>
                          Successfully copied ip address!
                        </Alert>
                      )
                    }
                  </Grid>
							  )}
              </Grid>
            </Grid>
            <Divider />
            <Grid container item direction="row" alignItems="center">
              <Grid item xs={2}><p>REGION:</p></Grid>
              <Grid item xs={10}><p>{room.region}</p></Grid>
            </Grid>
            <Divider />
            <Grid container item direction="row" alignItems="center">
              <Grid item xs={2}><p>BUFFER:</p></Grid>
              <Grid item xs={10}><p>{room.buffer}</p></Grid>
            </Grid>
            <Divider />
            <Grid container item direction="row" alignItems="center">
              <Grid item xs={2}><p>FREQUENCY:</p></Grid>
              <Grid item xs={10}><p>{room.frequency}</p></Grid>
            </Grid>
            <Divider />
            <Grid container item direction="row" alignItems="center">
              <Grid item xs={2}><p>STATUS:</p></Grid>
              <Grid item xs={10}><p>{room.status}</p></Grid>
            </Grid>
          </div>
        </Grid>
      </Grid>
    }
    </Grid>
  );
}

export default PublicRoom;
