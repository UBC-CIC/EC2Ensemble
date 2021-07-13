import React, { useEffect, useState } from 'react';
import { Auth } from "aws-amplify";

// materialUI
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { Button, Modal } from '@material-ui/core';
import { FormInput, FormSelect } from '../../Components';


const useStyles = makeStyles((theme) => ({
  paper: {
    width: 400,
    backgroundColor: "whitesmoke",
    // border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    
  },
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'scroll'
  },
  text: {
    textAlign: 'center'
  },
  button: {
    float: 'right',
    '& button': {
      fontWeight: 'bold'
    }
  }
}));

const DefaultButton = withStyles((theme) => ({
  root: {
      borderRadius: 5, 
      padding: theme.spacing(0.8, 3),
  },
}))(Button);


export default function CreateRoomForm(props) {
  const classes = useStyles();

  const [roomFormInfo, setRoomFormInfo] = useState({
    user: '',
    roomName: '',
    description: '',
    type: FormOptions.type[0],
    region: FormOptions.region[0],
    size: FormOptions.size[0],
    frequency: FormOptions.frequency[0],
    buffer: FormOptions.buffer[0],
    action: 'create'
  })

  useEffect(() => {
    async function retrieveUser() {
      const currUser = await Auth.currentAuthenticatedUser();
      setRoomFormInfo({...roomFormInfo, user: currUser.username}); // current user id
    }
    retrieveUser();
  }, [])

  const handleChange = (event) => {
    setRoomFormInfo({...roomFormInfo, [event.target.name]: event.target.value});
  }

  const body = (
    <div className={classes.paper}>
        <h2 id="modal-title" className={classes.text}>Create Room</h2>
        <form id="modal-form" onSubmit={(event)=>props.handleSubmit(event, roomFormInfo)}>
          <FormInput
              id={"roomName"} 
              inputLabel={"Room Name"} 
              required={true}
              onChange={handleChange}
          /> 
          <FormInput
              id={"description"} 
              inputLabel={"Description"} 
              required={false}
              multiline
              rows={4}
              onChange={handleChange}
          /> 
          <FormSelect
              id={"type"} 
              inputLabel={"Type"} 
              required={true}
              options={FormOptions.type}
              onChange={handleChange}
          /> 
          <FormSelect
              id={"region"} 
              inputLabel={"Region"} 
              required={true}
              options={FormOptions.region}
              onChange={handleChange}
          /> 
          <FormSelect
              id={"size"} 
              inputLabel={"Room Size"} 
              required={true}
              options={FormOptions.size}
              onChange={handleChange}
          /> 
          <FormSelect
              id={"frequency"} 
              inputLabel={"Sampling Frequency (Hz)"} 
              required={true}
              options={FormOptions.frequency}
              onChange={handleChange}
          /> 
          <FormSelect
              id={"buffer"} 
              inputLabel={"Buffer Size (Frames per Period)"} 
              required={true}
              options={FormOptions.buffer}
              onChange={handleChange}
          /> 
          <div className={classes.button}>
            <DefaultButton onClick={props.handleClose}>Cancel</DefaultButton>
            <DefaultButton type="submit">Submit</DefaultButton>
          </div>
        </form>
    </div>
  );

  return (
    <div>
        <Modal
            className={classes.modal}
            open={props.open}
            aria-labelledby="modal-title"
            aria-describedby="modal-form"
        >
            {body}
        </Modal>
    </div>
  );
}


// the options that users can choose from when filling out the form
// the first one in the list is the default value that the user will see
const FormOptions = {
  type: ["AWS"],
  region: ["ca-central-1", "us-west-1"],
  size: Array.from(Array(9), (_,i)=>i+2).concat([15,20]),
  frequency: [44100, 48000, 256000],
  buffer: [32, 64, 128, 256]
}
