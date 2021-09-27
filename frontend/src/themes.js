import { createTheme } from '@material-ui/core/styles';
import orange from '@material-ui/core/colors/orange';

const theme = createTheme({
    palette: {
        primary: {
            main: "#082032"
        },
        secondary: {
            main: "#E69F00"
        },
        tertiary: {
            main: "#ffcd61"
        },
        quaternary: {
            main: "#334756"
        },
        orange: {
            main: orange[500]
        },
        black: {
            main: "#000"
        },
        darkTheme: {
            main: "#282c34",
            card: "#4a4f59",
        }
    },
});

export default theme;