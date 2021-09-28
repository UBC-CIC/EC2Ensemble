import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';

// materialUI
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { Button, CircularProgress, Modal } from '@material-ui/core';
import { FormButtonGroup, FormInput, FormSelect } from '../../Components';


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
  },
  progress: {
    display: "flex",
    padding: theme.spacing(0, 1)
  }
}));

const DefaultButton = withStyles((theme) => ({
  root: {
      borderRadius: 5, 
      padding: theme.spacing(0.8, 3),
  },
}))(Button);

const SubmitButton = withStyles((theme) => ({
  root: {
      '&:hover': {
        background: '#ffba24'
      }
  },
}))(DefaultButton);

export default function CreateEditRoomForm(props) {
  const { open, loading, ...others } = props;
  const classes = useStyles();

  const initFormValues = {
    roomName: '',
    description: '',
    type: FormOptions.type[0],
    region: FormOptions.region[0],
    // size: FormOptions.size[0],
    frequency: FormOptions.frequency[0],
    buffer: FormOptions.buffer[0],
    ipAddress: '',
  }
  const [roomFormInfo, setRoomFormInfo] = useState(initFormValues);
  const [recommendRegion, setRecommendRegion] = useState([]);

  useEffect(() => {
    // if roomInfo is passed through
    if (!!others.roomInfo) {
      setRoomFormInfo(
        {
          roomName: others.roomInfo.roomName,
          description: others.roomInfo.description,
          type: others.roomInfo.type,
          region: others.roomInfo.region,
          // size: others.roomInfo.size,
          frequency: others.roomInfo.frequency,
          buffer: others.roomInfo.buffer,
          ipAddress: others.roomInfo.ipAddress
        }
      )
    }
    // when the form's is closed, reset the roomFormInfo state
    if (!open) resetFormInfo()
    // when the form is opened time, calculate recommended region to set the server
    else {
      (async () => {
        setRecommendRegion(await recommendRegionList);
      })();
    }
  }, [, open])

  const checkLatency = useCallback(async (regions)=> {
    return Promise.all(
      regions.map(async (region_name) => {
        const endpoint = `https://dynamodb.${region_name}.amazonaws.com`;
        const startTime = Date.now();
        
        return await fetch(endpoint)
          .then(response => {
            const stopTime = Date.now();
            if (response.status === 200) {
              return stopTime-startTime;
            }
          })
          .catch(error => {
            console.log('Error in checking latency', error);
            return Infinity;
          });
      })
    )
  }, [])

  const recommendRegionList = useMemo(async () => {
    let returnValue = [];
    const regions = FormOptions.region;

    /*
    * checkLatencies 4 times
    * ignore the first call to checkLatency 
    * because first ping to site is usually high
    */
    await checkLatency(regions);
    let tempLatencies = Array(3).fill(0);
    for (let i = 0; i < 3; i++) {
      const newLatencies = await checkLatency(regions);
      tempLatencies = tempLatencies.map((elem, idx) => elem + newLatencies[idx]);
    }

    const minLatency = Math.min.apply(null, tempLatencies);
    const index = tempLatencies.indexOf(minLatency);
    returnValue = [`${regions[index]} (Recommended)`, ...regions.filter((ele, idx) => idx !== index)]
    
    return returnValue;
  }, []);

  const handleChange = (event, type=null) => {
    // check if type is passed through
    if (!!type) setRoomFormInfo({...roomFormInfo, type: type});
    else setRoomFormInfo({...roomFormInfo, [event.target.name]: event.target.value});
  }

  // reset the roomFormInfo state
  const resetFormInfo = () => {
    setRoomFormInfo(initFormValues)
  }

  const submitForm = (event) => {
    let roomForm;
    const serverId = uuidv4();

    if (roomFormInfo.type === "AWS") {
      // remove the ip address
      delete roomFormInfo.ipAddress;
      
      roomForm = {
        roomName: roomFormInfo.roomName.trim(),
        description: roomFormInfo.description.trim(),
        type: roomFormInfo.type,
        // size: roomFormInfo.size,
        frequency: roomFormInfo.frequency,
        buffer: roomFormInfo.buffer,
        serverId: serverId,
        region: roomFormInfo.region.split(' ')[0], // remove "Recommended" text
      }
    } else {
      roomForm = {
        roomName: roomFormInfo.roomName.trim(),
        description: roomFormInfo.description.trim(),
        type: roomFormInfo.type,
        ipAddress: roomFormInfo.ipAddress.trim(),
        serverId: serverId
      }
    }
    
    props.handleSubmit(event, roomForm)
  }

  const body = (
    <div className={classes.paper}>
        <h2 id="modal-title" className={classes.text}>{!others.roomInfo ? "Create" : "Settings: Edit"} Room</h2>
        <form id="modal-form" onSubmit={submitForm}>
          <FormInput
              id={"roomName"} 
              inputLabel={"Room Name"} 
              required={true}
              onChange={handleChange}
              value={roomFormInfo.roomName}
          /> 
          <FormInput
              id={"description"} 
              inputLabel={"Description"} 
              required={false}
              multiline
              rows={4}
              onChange={handleChange}
              value={roomFormInfo.description}
          />
          <FormButtonGroup
              id={"type"} 
              inputLabel={"Type"} 
              options={FormOptions.type}
              onChange={handleChange}
              value={roomFormInfo.type}
              disabled={!!others.roomInfo}
          />
          {
            roomFormInfo.type === "AWS" && 
            <>
              <FormSelect
                  id={"region"} 
                  inputLabel={"Region"} 
                  required={true}
                  options={recommendRegion}
                  onChange={handleChange}
                  value={roomFormInfo.region}
              /> 
              {/* <FormSelect
                  id={"size"} 
                  inputLabel={"Room Size"} 
                  required={true}
                  options={FormOptions.size}
                  onChange={handleChange}
                  value={roomFormInfo.size}
                  disabled={!!others.roomInfo}
              />  */}
              <FormSelect
                  id={"frequency"} 
                  inputLabel={"Sampling Frequency (Hz)"} 
                  required={true}
                  options={FormOptions.frequency}
                  onChange={handleChange}
                  value={roomFormInfo.frequency}
              /> 
              <FormSelect
                  id={"buffer"} 
                  inputLabel={"Buffer Size (Frames per Period)"} 
                  required={true}
                  options={FormOptions.buffer}
                  onChange={handleChange}
                  value={roomFormInfo.buffer}
              />
            </>
          }
          {
            roomFormInfo.type !== "AWS" && 
            <>
              <FormInput
                id={"ipAddress"} 
                inputLabel={"IP Address"} 
                required={true}
                onChange={handleChange}
                value={roomFormInfo.ipAddress}
              />
            </>
          }
          <div className={classes.button}>
            <DefaultButton disabled={!!loading} onClick={props.handleClose}>Cancel</DefaultButton>
            <SubmitButton type="submit" disabled={!!loading} variant={"contained"} color="secondary">
              Submit
              {/* if it is loading, show the loading indicator */}
              {!!loading && <div className={classes.progress}><CircularProgress size={15}/></div>}
            </SubmitButton>
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
  type: ["AWS", "External Setup"],
  region: ["us-west-2", "ca-central-1", "us-west-1"],
  size: [2,3,4,5],
  frequency: [44100, 48000, 256000],
  buffer: [32, 64, 128, 256]
}
