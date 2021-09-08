//materialUI
import { Button, CircularProgress, Grid, makeStyles, } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
    progress: {
        padding: theme.spacing(0, 1)
    },
    center: {
        display: "flex",
        alignItems: "center",
    }
}));


export const LoadingButton = (props) => {
    const { loading, defaultName, loadingName, ...others } = props;
    const classes = useStyles();

    return (
        <Button 
            variant="contained" 
            disabled={!!loading}
            {...others}
        >
            {!loading && <span className={classes.progress}>{ defaultName }</span>}
            {!!loading && 
                <Grid className={classes.center}>
                    <span className={classes.progress}>{ loadingName }</span>
                    <CircularProgress size={15}/>
                </Grid>
            }
        </Button>
    )
}