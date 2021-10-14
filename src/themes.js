import { createTheme } from '@material-ui/core/styles';
import orange from '@material-ui/core/colors/orange';

const theme = createTheme({
    palette: {
        background: {
            default: "#c3d0db" // grey blue
        },
        primary: {
            main: "#002145" // UBC blue
        },
        secondary: {
            main: orange[500]
        },
        tertiary: {
            main: "#40B4E5"
        },
        quaternary: {
            main: "#fff"
        },
        secondaryHover: {
            main: "#ffba24"
        },
        darkTheme: {
            main: "#282c34",
            card: "#4a4f59",
        },
    },
    typography: {
        fontFamily: `"Open Sans", sans-serif`,
        fontSize: 15
    }
});

export default theme;