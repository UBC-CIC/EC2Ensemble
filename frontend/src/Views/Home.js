import React, { useState, useEffect, useCallback } from 'react';
import { connect } from "react-redux";
import { v4 as uuidv4 } from 'uuid';

// aws
import { Auth, Storage } from "aws-amplify";
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
  margin_vertical2: {
    margin: theme.spacing(2, 'auto')
  },
  margin_vertical3: {
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
// const AWS = require("aws-sdk");
// (() => {
//   // const credentials = await fromSSO({ profile: "" })();
//   const credentials = new AWS.SharedIniFileCredentials({profile: 'n'});
//   AWS.config.update = credentials;
// })();

function Home(props) {
  const {loginState} = props;

  const classes = useStyles();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [currUser, setCurrUser] = useState("");


  // load dynamodb
  // const docClient = new AWS.DynamoDB.DocumentClient({ 
  //   // credentials: credentials,
  //   region: awsExports.aws_project_region,
  // });

  // useEffect(() => {
  //   // retrieve rooms
    
  //   (async () => {
  //     const currUser = await Auth.currentAuthenticatedUser();

  //     // const params = {
  //     //   TableName : process.env.REACT_APP_ROOM_TABLE,
  //     //   KeyConditionExpression: "user = :user",
  //     //   ExpressionAttributeValues: {
  //     //     ":user": currUser.username
  //     //   },
  //     // };

  //     try {
  //       // const data = await docClient.query(params).promise();
  //       // console.log(data.Items)
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
    (async () => {
      await Auth.currentAuthenticatedUser()
        .then(async (user) => {
          const userId = user.username;
          setCurrUser(userId);
          console.log("start", currUser)

          // load ws
          connectWS(userId);

          // get rooms from db and update
          await fetch(`${process.env.REACT_APP_AWS_USERDB_BASE}?user=${encodeURIComponent(userId)}`)
            .then(response => response.json())
            .then(data => {
              console.log("not called other times",data.Items) 
              setRooms(data.Items)
            })
            .catch(error => {
              console.error('Error in querying room', error);
          });

        })
    })();
  }, [loginState]);


  const connectWS = useCallback((userId) => {
    const ws = new WebSocket(`${process.env.REACT_APP_WS_BASE}?user=${userId}`);

    // listening for open connection
    ws.onopen = () => {
        console.log("ws currently connected")
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
  }, [currUser]);

  const handleFormOpen = () => {
    setOpen(true);
  };

  const handleFormClose = () => {
    setOpen(false);
  };

  const handleFormSubmit = async (event, roomFormInfo) => {
    event.preventDefault();

    const roomFormInfoUser = {
      user: currUser,
      serverId: uuidv4(),
      ...roomFormInfo
    };

    setLoading(true);

    const url = process.env.REACT_APP_AWS_API_BASE;
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(roomFormInfoUser)
    };

    await fetch(url, requestOptions)
      .then(response => response.json())
      .then(data => {
        console.log("successfully created new room")
        // if successful, update the room list
        updateRooms(roomFormInfoUser);

        setLoading(false);
        // close the modal
        setOpen(false);
      })
      .catch(error => {
        setLoading(false);
        console.error('Error in creating room', error);
    });
  };

  // update the room list
  const updateRooms = (newRoomInfo) => {
    setRooms([...rooms, newRoomInfo])
  }

  return (
    <Grid container justifyContent="center">
      <Grid item xs={11} sm={10}>
        {/* https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout/Aligning_Items_in_a_Flex_Container#using_auto_margins_for_main_axis_alignment */}
        <Grid container item justifyContent="center" alignItems="center" className={classes.margin_vertical2}>
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
        <Grid className={classes.margin_vertical2}>
          <SearchBar/>
        </Grid>
        <Grid container item justifyContent="flex-end" alignItems="center" className={classes.margin_vertical3}>
          <ArrowBackIosIcon fontSize="small"/><span className={classes.underlineText}>1</span><ForwardIcon fontSize="small"/>
        </Grid>

        {/* load rooms in reverse order, showing the most recent one first*/}
        <Grid>
          {rooms.map((room, index) => {
            return (
              <div className={classes.margin_vertical2}>
                <Room key={index} data={room}/>
              </div>
            )
          }).reverse()}
        </Grid>
      </Grid>

    </Grid>
  );
}

const mapStateToProps = (state) => {
  return {
      loginState: state.loginState.currentState,
  };
};

export default connect(mapStateToProps, null)(Home);
