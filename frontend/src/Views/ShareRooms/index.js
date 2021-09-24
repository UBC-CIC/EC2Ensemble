import React from 'react';

// materialUI
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { Button, Modal } from '@material-ui/core';

// internal
import { FormInput } from '../../Components';


const useStyles = makeStyles((theme) => ({
  paper: {
    width: 400,
    backgroundColor: "whitesmoke",
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
    marginTop: '16px',
    float: 'right',
    '& button': {
      fontWeight: 'bold'
    }
  },
  description: {
    fontStyle: 'italic',
  }
}));

const DefaultButton = withStyles((theme) => ({
  root: {
      borderRadius: 5, 
      padding: theme.spacing(0.8, 3),
      backgroundColor: "#c4c4c4"
  },
}))(Button);

export default function ShareRoomModal(props) {
    const { open, handleClose, id } = props;

    const classes = useStyles();
    
    const body = (
        <div className={classes.paper}>
            <h2 id="share-modal-title" className={classes.text}>Share Your Rooms</h2>
            <div id="share-modal-body">
                <FormInput
                    id={"share-link"} 
                    value={`${window.location.href.slice(0,-1)}/share?room=${id}`}
                    disabled
                />
                <div id="share-modal-des">
                    <span className={classes.description}>
                        Anyone with the link can view this room.
                    </span>
                </div>
            </div>
            <div className={classes.button}>
                <DefaultButton onClick={handleClose}>Done</DefaultButton>
            </div>
        </div>
    );

    return (
        <div>
            <Modal
                className={classes.modal}
                open={open}
                aria-labelledby="share-modal-title"
                aria-describedby="share-modal-des"
            >
                {body}
            </Modal>
        </div>
    );
}
