//materialUI
import { Button, withStyles } from "@material-ui/core";


export const DisabledButton = withStyles((theme) => ({
    root: {
        '&.Mui-disabled': {
            background: '#c4c4c4',
            cursor: 'not-allowed',
        }
    },
}))(Button);