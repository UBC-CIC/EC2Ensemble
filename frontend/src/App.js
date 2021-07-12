import React, { useState } from 'react';

// materialUI
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { Button, Grid, InputAdornment, IconButton, TextField } from '@material-ui/core/';

// internal imports
import './App.css';
import Room from './Views/Room';
import CreateRoomForm from './Views/CreateRoomForm';

// icons
import SearchIcon from '@material-ui/icons/Search';
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

// https://github.com/mui-org/material-ui/issues/13570
const BorderTextField = withStyles({
  root: {
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderRadius: "50px",
      },
    },
  },
})(TextField);

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


function App() {
  const classes = useStyles();

  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = (event, roomFormInfo) => {
    event.preventDefault();
    console.log(roomFormInfo)
    // websocket & send info to backend

    // close the modal
    setOpen(false);
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
              onClick={handleOpen}
            >
              Create Room
            </DefaultButton>
            <CreateRoomForm 
              open={open} 
              handleClose={handleClose} 
              handleSubmit={handleSubmit}
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
          <Room/>
        </Grid>
      </Grid>

    </Grid>
  );
}

function SearchBar() {
  return (
    <BorderTextField
        fullWidth={true}
        placeholder="Search"
        variant="outlined"
        size="small"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
                <IconButton type="submit" size="small" aria-label="search-button">
                    <SearchIcon />
                </IconButton>
            </InputAdornment>
          ),
        }}
    />
  )
}

export default App;
