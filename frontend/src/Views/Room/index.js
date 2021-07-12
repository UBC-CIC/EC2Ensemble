import { makeStyles, withStyles } from '@material-ui/core/styles';
import { Button, Divider, Grid } from '@material-ui/core/';

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: "lightgray",
        borderRadius: "10px",
        padding: theme.spacing(3, 4),
    },
    flex: {
        display: "flex",
    },
    flexEnd: {
        marginLeft: "auto",
    },
    margin_horizontal2: {
        margin: theme.spacing(2, 'auto')
    },
    innerVerticalPadding: {
        '& div': {
            padding: theme.spacing(0.5, 0)
        }
    },
    margin_innerLeft: {
        '& > button': {
            marginLeft: "16px" 
        }
    },
    divider: {
        background: "black"
    },
    info: {
        marginBottom: "10px"
    }
    
}))

const DefaultButton = withStyles((theme) => ({
    root: {
        borderRadius: 5, 
        padding: theme.spacing(0.5, 1),
    },
}))(Button);


export default function Room() {
    const classes = useStyles();

    return (
        <Grid container alignContent="flex-start" className={classes.root}>
            <Grid container item alignItems="center">
                <div>PCMA's room</div>
                <div className={`${classes.flexEnd}`}>
                    7 users active
                </div>
            </Grid>
            <Grid item xs={12} className={classes.margin_horizontal2}>
                <Divider className={classes.divider}/>
            </Grid>
            <Grid container direction="row" className={classes.info}>
                <Grid item className={classes.innerVerticalPadding}>
                    <div>
                        Description: Musician Together Apart
                    </div>
                </Grid>
                <Grid container item direction="row">
                    <Grid item xs={4} className={classes.innerVerticalPadding}>
                        <div>IP Address: 123.123.1.1</div>
                        <div>Region: ca-central-1</div>
                        <div>Capacity: 10</div>
                    </Grid>
                    <Grid item className={classes.innerVerticalPadding}>
                        <div>Sampling Frequency: 48000</div>
                        <div>Buffer Size: 256</div>
                    </Grid>
                </Grid>
            </Grid>
            <Grid container item alignItems="center">
                <div className={`${classes.flexEnd} ${classes.margin_innerLeft}`}>
                    <DefaultButton size="small" variant="outlined">Test Latency</DefaultButton>
                    <DefaultButton size="small" variant="outlined">Setting</DefaultButton>
                    <DefaultButton size="small" variant="outlined">Delete Room</DefaultButton>
                </div>
            </Grid>
        </Grid>
    )
};