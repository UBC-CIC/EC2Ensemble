import React, { useState, useEffect } from 'react';
import { connect, useDispatch } from "react-redux";

// aws
import { Auth } from "aws-amplify";


// materialUI
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { Button, Grid } from '@material-ui/core/';

// internal imports
import Room from './Room';
import CreateEditRoomForm from './CreateEditRoomForm';
import { SearchBar } from '../Components';

// actions
import { createRoom, queryRooms } from '../Actions/roomActions';

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

function Home(props) {
  const {loginState, roomList} = props;

  const classes = useStyles();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currUser, setCurrUser] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      await Auth.currentAuthenticatedUser()
        .then((user) => {
          setCurrUser(user)

          // query rooms from db
          dispatch(queryRooms(user));
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

    setLoading(true);
    await dispatch(createRoom(currUser, roomFormInfo))
    // let the buttons stop loading
    setLoading(false);
    // close the modal
    setOpen(false);
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
            <CreateEditRoomForm 
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
          {/* <ArrowBackIosIcon fontSize="small"/><span className={classes.underlineText}>1</span><ForwardIcon fontSize="small"/> */}
        </Grid>

        {/* load rooms in reverse order, showing the most recent one first*/}
        <Grid>
          {Object.values(roomList).map((room, index) => {
            return (
              <div key={`room-${index}`} className={classes.margin_vertical2}>
                <Room currUser={currUser} {...room}/>
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
      roomList: state.roomsState
  };
};

export default connect(mapStateToProps, null)(Home);
