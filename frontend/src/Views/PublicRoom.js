import React, { useEffect, useState } from 'react';
import { connect, useDispatch } from "react-redux";

// materialUI
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Alert from '@material-ui/lab/Alert';
import { Button, Divider, Grid, Slide, Snackbar } from '@material-ui/core/';

// internal imports
import Navbar from '../Components/Navbar';

// actions
import { queryOneRoom } from '../Actions/roomActions';



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
    margin: theme.spacing(0, 2)
	},
}))(SmallOutlinedButton);


function PublicRoom(props) {
  const { room } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const [copy, handleCopyButton] = useState(false)

  useEffect(() => {
    (async () => {
      // remove the "/" in the pathname to get the userLinkID
      const roomId = new URLSearchParams(props.location.search).get("room");
      if (roomId) {
        await dispatch(queryOneRoom(roomId));
      }
    })();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(room.ipAddress)
    handleCopyButton(true)
  }

  const handleClose = () => {
    handleCopyButton(false);
  };


  return (
    <Grid container justifyContent="center">
      <Navbar/>
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
									  <DefaultButton onClick={handleCopy}>
                      Copy
                    </DefaultButton>
                    { copy && setTimeout(() => {
                      handleClose()
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
    </Grid>
  );
}

const mapStateToProps = (state) => {
  return {
      room: state.roomsState
  };
};

export default connect(mapStateToProps, null)(PublicRoom);
