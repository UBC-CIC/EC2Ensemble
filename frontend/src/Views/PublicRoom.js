import React, { useEffect, useState } from 'react';
import AWS from 'aws-sdk';
import awsExports from '../aws-exports';


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
  },
  marginLeft: {
    [theme.breakpoints.down('xs')]: {
      marginLeft: '16px'
    }
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
    [theme.breakpoints.down('sm')]: {
      margin: theme.spacing(0, 1)
    },
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
      const roomId = props.match.params.roomId;
      
      if (roomId) {
        await getRoom(roomId)
          .then((data) => {
            if (data.Items.length === 1) {
              const info = data.Items[0];
              updateRoom(
                {
                  buffer: info.buffer,
                  ipAddress: info.ipAddress,
                  frequency: info.frequency,
                  status: info.status,
                  roomName: info.roomName,
                  region: info.region,
                  description: info.description,
                  type: info.type
                }
              );
            } else throw new Error();
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
              <Grid item xs={4} sm={3} md={2}><p>DESCRIPTION:</p></Grid>
              <Grid item className={classes.marginLeft}><p>{room.description}</p></Grid>
            </Grid>
            <Divider />
            <Grid container item direction="row" alignItems="center">
              <Grid item xs={4} sm={3} md={2}><p>IP ADDRESS:</p></Grid>
              <Grid container item xs={8} sm={9} md={10} direction="row" alignItems="center">
                <p>{room.ipAddress}</p>
                {!!room.ipAddress && (
									  <DefaultButton 
                      onClick={handleAlertOpen}
                      startIcon={<FileCopyIcon/>}
                      color="primary"
                      variant="contained"
                    >
                      Copy
                    </DefaultButton>
							  )}
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
            </Grid>
            <Divider />
            <Grid container item direction="row" alignItems="center">
              <Grid item xs={4} sm={3} md={2}><p>REGION:</p></Grid>
              <Grid item><p>{room.region}</p></Grid>
            </Grid>
            <Divider />
            <Grid container item direction="row" alignItems="center">
              <Grid item xs={4} sm={3} md={2}><p>BUFFER:</p></Grid>
              <Grid item><p>{room.buffer}</p></Grid>
            </Grid>
            <Divider />
            <Grid container item direction="row" alignItems="center">
              <Grid item xs={4} sm={3} md={2}><p>FREQUENCY:</p></Grid>
              <Grid item><p>{room.frequency}</p></Grid>
            </Grid>
            <Divider />
            <Grid container item direction="row" alignItems="center">
              <Grid item xs={4} sm={3} md={2}><p>STATUS:</p></Grid>
              <Grid item><p>{room.status}</p></Grid>
            </Grid>
          </div>
        </Grid>
      </Grid>
    }
    </Grid>
  );
}

export default PublicRoom;


// function to query room
const getRoom = async (roomId) => {
  AWS.config.update({
    region: awsExports.aws_cognito_region,
    credentials: new AWS.CognitoIdentityCredentials({
      IdentityPoolId: awsExports.aws_cognito_identity_pool_id,
    }),
  });

  const dynamodb = new AWS.DynamoDB.DocumentClient();

  let queryParams = {
    TableName: process.env.REACT_APP_USERSERVERTABLENAME,
    FilterExpression: `#serverId = :serverId`,
    ExpressionAttributeNames: {
      "#serverId": "serverId",
    },
    ExpressionAttributeValues: {
      ":serverId": roomId
    }
  }

  return await dynamodb.scan(queryParams).promise();
}