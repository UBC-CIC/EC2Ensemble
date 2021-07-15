import React, { useState, useEffect, useRef, useCallback } from 'react';
// aws
import { Auth } from "aws-amplify";
import awsExports from "../aws-exports";
import { fromSSO } from "@aws-sdk/credential-provider-sso";

import WebSocket from 'isomorphic-ws';

// materialUI
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { Button, Grid } from '@material-ui/core/';

// internal imports
import Room from './Room';
import CreateRoomForm from './CreateRoomForm';
import { SearchBar } from '../Components';

// icons
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';


const useStyles = makeStyles((theme) => ({
  flexEnd: {
    marginLeft: "auto",
  },
  margin_horizontal2: {
    margin: theme.spacing(2, 'auto')
  },
  margin_horizontal3: {
    margin: theme.spacing(3, 'auto')
  },
  underlineText: {
    textDecoration: "underline",
    textUnderlineOffset: "0.1em"
  }
}))

const DefaultButton = withStyles((theme) => ({
  root: {
      borderRadius: 5, 
      padding: theme.spacing(1, 3),
  },
}))(Button);


const ForwardIcon = withStyles((theme) => ({
  root: {
    transform: "rotate(-180deg)"
  },
}))(ArrowBackIosIcon);

// get and set up aws service
const AWS = require("aws-sdk");
// (async () => {
//   const credentials = await fromSSO({ profile: "" })();
//   console.log(credentials)
//   AWS.config.credentials = credentials;
// })();

function Home(props) {
  const classes = useStyles();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState([])


  // load dynamodb
  const docClient = new AWS.DynamoDB.DocumentClient({ 
    // credentials: credentials,
    region: awsExports.aws_project_region,
  });

  // useEffect(() => {
  //   // retrieve rooms
    
  //   (async () => {
  //     const currUser = await Auth.currentAuthenticatedUser();

  //     const params = {
  //       TableName : process.env.REACT_APP_ROOM_TABLE,
  //       KeyConditionExpression: "user = :user",
  //       ExpressionAttributeValues: {
  //         ":user": currUser.username
  //       },
  //     };

  //     try {
  //       const data = await docClient.query(params).promise();
  //       console.log(data.Items)
  //       // data.Items.forEach((item) => {
  //         //       console.log(" -", item.year + ": " + item.title
  //         //       + " ... " + item.info.genres
  //         //       + " ... " + item.info.actors[0]);
  //       // });
  //     } catch (err) {
  //       console.log("Unable to query. Error:", JSON.stringify(err, null, 2));
  //     }
  //   })();
  // }, []);


  useEffect(() => {
    const ws = new WebSocket(process.env.REACT_APP_WS_BASE);
    onConnect(ws);
  }, []);

  const onConnect = useCallback((ws) => {
    // listening for open connection
    ws.onopen = (event) => {
        console.log("ws currently connected")
        console.log(event)
    }

    // listening for closed connection
    ws.onclose = (event) => {
        console.log("ws closed", event.reason)
    }

    // *** listening for messages from ws 
    ws.onmessage = (event) => {
        const message = JSON.parse(event.data).message;
        console.log("message given", message)
    }

    // listening for error
    ws.onerror = (error) => {
        console.log("error", error)
    }
  }, []);

  const handleFormOpen = () => {
    setOpen(true);
  };

  const handleFormClose = () => {
    setOpen(false);
  };

  const handleFormSubmit = async (event, roomFormInfo) => {
    event.preventDefault();
    setLoading(true);
    // TODO: websocket & send info to backend

    // PRE-testing
    const apiUrl = process.env.REACT_APP_AWS_API_BASE;
    const requestOptions = {
      method: 'POST',
      // mode: 'no-cors', // disabling cors for testing purposes only
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(roomFormInfo)
    };

    await fetch(apiUrl, requestOptions)
      .then(response => response.json())
      .then(data => {
        console.log(data)
        
        setLoading(false);
        // close the modal
        setOpen(false);
      })
      .catch(error => {
        setLoading(false);
        console.error('Error in creating room', error);
    });
    
  };

  return (
    <Grid container justifyContent="center">
      <Grid item xs={11} sm={10}>
        {/* https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout/Aligning_Items_in_a_Flex_Container#using_auto_margins_for_main_axis_alignment */}
        <Grid container item justifyContent="center" alignItems="center" className={classes.margin_horizontal2}>
          <div><h2>All Rooms</h2></div>
          <div className={`${classes.flexEnd}`}>
            <DefaultButton 
              variant="contained"
              onClick={handleFormOpen}
            >
              Create Room
            </DefaultButton>
            <CreateRoomForm 
              open={open} 
              handleClose={handleFormClose} 
              handleSubmit={handleFormSubmit}
              loading={loading}
            />
          </div>
        </Grid>
        <Grid className={classes.margin_horizontal2}>
          <SearchBar/>
        </Grid>
        <Grid container item justifyContent="flex-end" alignItems="center" className={classes.margin_horizontal3}>
          <ArrowBackIosIcon fontSize="small"/><span className={classes.underlineText}>1</span><ForwardIcon fontSize="small"/>
        </Grid>

        {/* load rooms in db */}
        <Grid>
          {rooms.map((room) => {
            return (
              <Room/>
            )
          })}
        </Grid>
      </Grid>

    </Grid>
  );
}

export default Home;
