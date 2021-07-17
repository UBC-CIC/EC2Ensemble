import React, { useState, useEffect, useCallback } from 'react';
import { connect, useDispatch } from "react-redux";
import { v4 as uuidv4 } from 'uuid';

// aws
import { Auth, Storage } from "aws-amplify";
import { fromSSO } from "@aws-sdk/credential-provider-sso";


// materialUI
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { Button, Grid } from '@material-ui/core/';

// internal imports
import Room from './Room';
import CreateRoomForm from './CreateRoomForm';
import { SearchBar } from '../Components';

// actions
import { createRoom, disconnectRoom, queryRooms } from '../Actions/roomActions';

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
  const {loginState, roomList} = props;

  const classes = useStyles();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  // const [rooms, setRooms] = useState({});
  const [currUser, setCurrUser] = useState("");
  const dispatch = useDispatch();



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
        .then((user) => {
          const userId = user.username;
          setCurrUser(userId)

          // query rooms from db
          dispatch(queryRooms(userId));
        })
    })();
  }, [loginState]);


  const handleFormOpen = () => {
    setOpen(true);
  };

  const handleFormClose = () => {
    setOpen(false);
  };

  const handleFormSubmit = async (event, roomFormInfo) => {
    event.preventDefault();

    const serverId = uuidv4();

    setLoading(true);
    await dispatch(createRoom(currUser, serverId, roomFormInfo));
    // let the buttons stop loading
    setLoading(false);
    // close the modal
    setOpen(false);
  };

  const handleRoomDisconnection = async (serverId) => {
    dispatch(disconnectRoom(currUser, roomList[serverId].region, serverId));
  };

  return (
    <Grid container justifyContent="center">
      <Grid item xs={11} sm={10}>
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
          {Object.values(roomList).map((room, index) => {
            return (
              <div key={`room-${index}`} className={classes.margin_vertical2}>
                <Room handleDisconnect={handleRoomDisconnection} {...room}/>
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
      roomList: state.roomsState,
      loginState: state.loginState.currentState,
  };
};

export default connect(mapStateToProps, null)(Home);
