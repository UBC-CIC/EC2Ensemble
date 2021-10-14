import React, { useState } from 'react';

// materialUI
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { Button, Modal } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';

// internal
import { FormInput } from '../../Components';

// icons
import FileCopyIcon from '@material-ui/icons/FileCopy';


const useStyles = makeStyles((theme) => ({
  paper: {
    width: '70vw',
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
  },
  shareColumn: {
    display: 'flex',
    width: '100%',
    alignItems: 'center'
  }
}));

const DefaultButton = withStyles((theme) => ({
  root: {
      borderRadius: 5, 
      padding: theme.spacing(0.8, 3),
      margin: theme.spacing(0, 0, 0, 2)
  },
}))(Button);

const SubmitButton = withStyles((theme) => ({
  root: {
    '&:hover': {
      background: theme.palette.secondaryHover.main
    }
  },
}))(DefaultButton);

export default function ShareRoomModal(props) {
    const { open, handleClose, id } = props;
    const [alert, handleAlert] = useState(false)

    const classes = useStyles();

    const handleAlertOpen = () => {
      navigator.clipboard.writeText(`${window.location.href}share/${id}`)
      handleAlert(true)
    }
    
    const handleAlertClose = () => {
      handleAlert(false);
    };
    
    const body = (
        <div className={classes.paper}>
            <h2 id="share-modal-title" className={classes.text}>Share Your Room</h2>
            <div id="share-modal-body">
                { alert && setTimeout(() => {
                      handleAlertClose()
                    }, 2500) && 
                      (
                        <Alert severity="success" sx={{ width: '100%' }}>
                          Successfully copied shared link!
                        </Alert>
                      )
                }
                <div className={classes.shareColumn}>
                  <FormInput
                      id={"share-link"} 
                      value={`${window.location.href}share/${id}`}
                      disabled
                  />
                  <DefaultButton 
                    onClick={handleAlertOpen} 
                    variant="contained" 
                    color="secondary"
                    startIcon={<FileCopyIcon/>}
                  >
                    Copy
                  </DefaultButton>
                </div>
                <div id="share-modal-des">
                    <span className={classes.description}>
                        Anyone with the link can view this room.
                    </span>
                </div>
            </div>
            <div className={classes.button}>
                <SubmitButton onClick={handleClose} variant="contained" color="secondary">
                  Done
                </SubmitButton>
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
