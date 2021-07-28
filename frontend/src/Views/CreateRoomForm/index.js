import React, { useEffect, useState, useCallback, useMemo } from 'react';

// materialUI
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { Button, CircularProgress, Modal } from '@material-ui/core';
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


export default function CreateRoomForm(props) {
  const { open, loading } = props;
  const classes = useStyles();

  const initFormValues = {
    roomName: '',
    description: '',
    type: FormOptions.type[0],
    region: FormOptions.region[0],
    size: FormOptions.size[0],
    frequency: FormOptions.frequency[0],
    buffer: FormOptions.buffer[0],
  }
  const [roomFormInfo, setRoomFormInfo] = useState(initFormValues);
  const [recommendRegion, setRecommendRegion] = useState([]);

  useEffect(() => {
    // when the form's is closed, reset the roomFormInfo state
    if (!open) resetFormInfo()
    else {
      (async () => {
        setRecommendRegion(await recommendRegionList);
      })();
    }
  }, [open])

  const checkLatency = useCallback(async (regions)=> {
    return Promise.all(
      regions.map(async (region_name) => {
        const endpoint = `https://dynamodb.${region_name}.amazonaws.com`;
        const startTime = Date.now();
        
        return await fetch(endpoint)
          .then(response => {
            const stopTime = Date.now();
            if (response.status === 200) {
              console.log(region_name, stopTime-startTime)
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
    returnValue = [`${regions[index]} (Recommend)`, ...regions.filter((ele, idx) => idx !== index)]
    
    return returnValue;
  }, []);

  const handleChange = (event) => {
    setRoomFormInfo({...roomFormInfo, [event.target.name]: event.target.value});
  }

  // reset the roomFormInfo state
  const resetFormInfo = () => {
    setRoomFormInfo(initFormValues)
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
              options={recommendRegion}
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
            <DefaultButton disabled={!!loading} onClick={props.handleClose}>Cancel</DefaultButton>
            <DefaultButton type="submit" disabled={!!loading}>
              Submit
              {/* if it is loading, show the loading indicator */}
              {!!loading && <div className={classes.progress}><CircularProgress size={15}/></div>}
            </DefaultButton>
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
  region: ["us-west-2", "ca-central-1", "us-west-1"],
  size: Array.from(Array(9), (_,i)=>i+2).concat([15,20]),
  frequency: [44100, 48000, 256000],
  buffer: [32, 64, 128, 256]
}
