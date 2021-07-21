import { makeStyles, withStyles } from '@material-ui/core/styles';
import { Button, Divider, Grid } from '@material-ui/core/';

// icons
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import { useEffect, useState } from 'react';


const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: "lightgray",
        borderRadius: "10px",
        padding: theme.spacing(3, 4),
    },
    flexEnd: {
        [theme.breakpoints.up('sm')]: {
            marginLeft: "auto",
        },
        display: "flex",
        alignItems: "center",
    },
    margin_horizontal2: {
        margin: theme.spacing(2, 'auto')
    },
    innerVerticalPadding: {
        '& div': {
            padding: theme.spacing(1, 0)
        }
    },
    innerHeight: {
        '& div': {
            display: "flex",
            height: "34px",
            alignItems: 'center'
        }
    },
    margin_innerLeft: {
        display: 'flex',
        '& > button:not(:first-child)': {
            marginLeft: "16px" 
        }
    },
    divider: {
        background: "black"
    },
    info: {
        marginBottom: "10px"
    },
    width: {
        width: '100%',
    },
    marginRight: {
        marginRight: "16px" 
    },
    running: {
        color: "#77e94e"
    },
    creating: {
        color: "#ebc334"
    },
    terminated: {
        color: "#9c9c9c"
    }
}))

const SmallOutlinedButton = (props) => {
    const {children, ...others} = props;
    return (
        <Button size="small" variant="outlined" {...others}>
            {children}
        </Button>
    )
};
const DefaultButton = withStyles((theme) => ({
    root: {
        borderRadius: 5, 
        padding: theme.spacing(0.5, 1),
    },
}))(SmallOutlinedButton);


export default function Room(props) {
    const classes = useStyles();
    const {
        roomName,
        description,
        region,
        size,
        frequency,
        buffer,
        status,
        ipAddress,
        serverId,
        handleTerminate
    } = props

    
    /* there are three connection status
    * running    === room connected and running
    * creating   === room in process of being created/connected
    * terminated === no connection to room, most likely been terminated
    * */
    const [connectionStyle, setConnectionStyle] = useState(classes.terminated);

    useEffect(()=> {
        if (status === 'running') {
            setConnectionStyle(classes.running)
        } else if ((status === 'creating')||(status === undefined)||(status === 'terminating')) {
            setConnectionStyle(classes.creating)
        } else {
            setConnectionStyle(classes.terminated)
        }
    }, [status])


    return (
        <Grid container alignContent="flex-start" className={classes.root}>
            <Grid container item alignItems="center">
                <div>{roomName}</div>
                <div className={`${classes.flexEnd}`}>
                    { 
                        (status === "running" && <span>7 users active</span>) ||
                        ((status === "creating" || status === undefined) && <span>In Creation</span>)
                    }
                    <FiberManualRecordIcon className={connectionStyle}/>
                </div>
            </Grid>
            <Grid item xs={12} className={classes.margin_horizontal2}>
                <Divider className={classes.divider}/>
            </Grid>
            <Grid container direction="row" className={classes.info}>
                {!!description && 
                    <Grid item className={classes.innerVerticalPadding}>
                        <div>
                            Description: {description}
                        </div>
                    </Grid>
                }
                <Grid container item direction="row">
                    <Grid item sm={12} md={5} className={`${classes.width}`}>
                        <Grid item className={classes.innerHeight}>
                            <div>
                                <span className={classes.marginRight}>IP Address: {!!ipAddress ? ipAddress : "N/A"}</span>
                                {
                                    !!ipAddress && 
                                    <DefaultButton>Copy</DefaultButton>
                                }
                            </div>
                            <div>Region: {region}</div>
                            <div>Capacity: {size}</div>
                        </Grid>
                    </Grid>
                    <Grid item className={classes.innerHeight}>
                        <div>Sampling Frequency: {frequency}</div>
                        <div>Buffer Size: {buffer}</div> 
                    </Grid>
                </Grid>
            </Grid>
            <Grid container item alignItems="center">
                <div className={`${classes.flexEnd} ${classes.margin_innerLeft}`}>
                    <DefaultButton >Test Latency</DefaultButton>
                    <DefaultButton >Setting</DefaultButton>
                    { status === 'terminated' && 
                        <DefaultButton disabled={true}>Start</DefaultButton>
                    }
                    { status !== 'terminated' && 
                        <DefaultButton 
                            disabled={status==='terminating' || !status || status === 'creating'}
                            onClick={()=>handleTerminate(serverId)}
                        >
                            { (status==='terminating') ? "Stopping..." : 
                                        (!status || status === 'creating') ? "Starting..." : "Stop" }
                        </DefaultButton>
                    }
                </div>
            </Grid>
        </Grid>
    )
};