import { makeStyles, withStyles } from '@material-ui/core/styles';
import { Button, Divider, Grid } from '@material-ui/core/';

// icons
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import { useCallback, useEffect, useRef, useState } from 'react';

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: "lightgray",
        borderRadius: "10px",
        padding: theme.spacing(3, 4),
    },
    flexEnd: {
        [theme.breakpoints.up('sm')]: {
            marginLeft: "auto",
        }
    },
    margin_horizontal2: {
        margin: theme.spacing(2, 'auto')
    },
    innerVerticalPadding: {
        '& div': {
            padding: theme.spacing(1, 0)
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
    connect: {
        color: "#77e94e"
    },
    close: {
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


export default function Room(ws) {
    const classes = useStyles();

    const [connection, setConnection] = useState(false);

    return (
        <Grid container alignContent="flex-start" className={classes.root}>
            <Grid container item alignItems="center">
                <div>PCMA's room</div>
                <div className={`${classes.flexEnd}`}>
                    <span>7 users active</span>
                    <FiberManualRecordIcon className={connection ? classes.connect : classes.close}/>
                </div>
            </Grid>
            <Grid item xs={12} className={classes.margin_horizontal2}>
                <Divider className={classes.divider}/>
            </Grid>
            <Grid container direction="row" className={classes.info}>
                <Grid item className={classes.innerVerticalPadding}>
                    <div>
                        Description: Consequat duis autem vel: eum iriure dolor in hendrerit?
                    </div>
                </Grid>
                <Grid container item direction="row">
                    <Grid item sm={12} md={5} className={`${classes.width}`}>
                        <div>
                            <span className={classes.marginRight}>IP Address: 123.123.1.1</span>
                            <DefaultButton 
                                // onClick={handleCopy}
                            >
                                Copy
                            </DefaultButton>
                        </div>
                        <Grid item className={classes.innerVerticalPadding}>
                            <div>Region: ca-central-1</div>
                            <div>Capacity: 10</div>
                        </Grid>
                    </Grid>
                    <Grid item className={classes.innerVerticalPadding}>
                        <div>Sampling Frequency: 48000</div>
                        <div>Buffer Size: 256</div>
                    </Grid>
                </Grid>
            </Grid>
            <Grid container item alignItems="center">
                <div className={`${classes.flexEnd} ${classes.margin_innerLeft}`}>
                    <DefaultButton >Test Latency</DefaultButton>
                    <DefaultButton >Setting</DefaultButton>
                    <DefaultButton >Delete Room</DefaultButton>
                </div>
            </Grid>
        </Grid>
    )
};