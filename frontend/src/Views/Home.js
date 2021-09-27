import React, { useState, useEffect } from 'react';
import { connect, useDispatch } from "react-redux";

// aws
import { Auth } from 'aws-amplify';


// materialUI
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { Button, Grid } from '@material-ui/core/';

// internal imports
import Room from './Room';
import CreateEditRoomForm from './CreateEditRoomForm';
import SearchBar from '../Components/SearchBar';
import Navbar from '../Components/Navbar';

// actions
import { createRoom, queryUserRooms } from '../Actions/roomActions';

// icons
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';


const useStyles = makeStyles((theme) => ({
  flexEnd: {
    marginLeft: "auto",
    // [theme.breakpoints.up('sm')]: {
		// 	marginLeft: 'auto',
		// 	width: '100%',
		// 	flexDirection: 'column',
		// },
		// alignItems: 'center',
  },
  margin_vertical2: {
    margin: theme.spacing(2, 'auto')
  },
  margin_vertical3: {
    margin: theme.spacing(3, 'auto')
  },
  margin_horizontal: {
    margin: theme.spacing(0, 1),
    background: "#c4c4c4"
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
  }
}))

const DefaultButton = withStyles((theme) => ({
  root: {
      borderRadius: 5, 
      padding: theme.spacing(1, 3),
  },
}))(Button);

function Home(props) {
  const {roomList} = props;

  const classes = useStyles();

  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currUser, setCurrUser] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const filteredRoomList = updateSearchInput(roomList, searchInput, searchCategory);
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      await Auth.currentAuthenticatedUser()
        .then((user) => {
          setCurrUser(user)

          // query rooms from db
          dispatch(queryUserRooms(user));
        })
    })();
  }, []);

  const handleFormOpen = () => {
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
  };

  const handleFormSubmit = async (event, roomFormInfo) => {
    event.preventDefault();

    setLoading(true);
    await dispatch(createRoom(currUser, roomFormInfo));
    // let the buttons stop loading
    setLoading(false);
    // close the modal
    handleFormClose();
  };

  const handleSearch = (input, category) => {
    // updateSearchInput(input, category)
    setSearchInput(input);
    setSearchCategory(category)
  }

  return (
    <Grid container justifyContent="center">
      <Navbar/>
      <Grid item xs={11} sm={10}>
        <Grid container item direction="row" alignItems="center" className={classes.margin_vertical2}>
          <div className={`${classes.flex} ${classes.alignCenter}`}>
            <h2>All Rooms</h2>
          </div>
          <div className={classes.flexEnd}>
            <DefaultButton 
              variant="contained"
              onClick={handleFormOpen}
            >
              Create Room
            </DefaultButton>
            <CreateEditRoomForm 
              open={formOpen} 
              handleClose={handleFormClose} 
              handleSubmit={handleFormSubmit}
              loading={loading}
            />
          </div>
        </Grid>
        <Grid item>
          <SearchBar
            input={searchInput}
            handleSearch={handleSearch}
            options={["All", ...Object.keys(RoomInfoCategory)]}
          />
        </Grid>
        <Grid container item justifyContent="flex-end" alignItems="center" className={classes.margin_vertical3}>
          {/* <ArrowBackIosIcon fontSize="small"/><span className={classes.underlineText}>1</span><ForwardIcon fontSize="small"/> */}
        </Grid>

        {/* load rooms in reverse order, showing the most recent one first*/}
        <Grid>
          {filteredRoomList.map((room, index) => {
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

const updateSearchInput = (roomList, input, category) => {
  if (!input) {
    return Object.values(roomList);
  }

  if (category === "All") {
    const categories = Object.values(RoomInfoCategory);
    return Object.values(roomList).filter(room => {
      return !!categories.filter((c) => room[c].toString().toLowerCase().includes(input.toLowerCase())).length
     })
  } else {
    const mappedCategory = RoomInfoCategory[category];
    return Object.values(roomList).filter(room => {
      return room[mappedCategory].toString().toLowerCase().includes(input.toLowerCase())
     })
  }

}

const RoomInfoCategory = {
  "Room Name": "roomName", 
  "Description": "description",
  "IP Address": "ipAddress", 
  "Region": "region", 
  "Frequency": "frequency",
  "Buffer Size": "buffer"
};

const mapStateToProps = (state) => {
  return {
      roomList: state.roomsState
  };
};

export default connect(mapStateToProps, null)(Home);
