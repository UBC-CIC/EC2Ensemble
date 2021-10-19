import React, {useEffect, useState} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useTheme } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import AccountBoxIcon from '@material-ui/icons/AccountBox';
import MoreIcon from '@material-ui/icons/MoreVert';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Auth } from "aws-amplify";
import { connect } from "react-redux";

const useStyles = makeStyles((theme) => ({
    grow: {
        flexGrow: 1,
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        [theme.breakpoints.up('sm')]: {
            display: 'block',
        },
    },
    logo: {
        display: 'none',
        [theme.breakpoints.up('sm')]: {
            display: 'block',
        },
        paddingLeft: '15px',
    },
    sectionDesktop: {
        display: 'none',
        [theme.breakpoints.up('md')]: {
            display: 'flex',
        },
    },
    sectionMobile: {
        display: 'flex',
        [theme.breakpoints.up('md')]: {
            display: 'none',
        },
    },
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
    },
    navbarBg: {
        background: theme.palette.primary.main
    }
}));

function Navbar(props) {
    const {loginState} = props;
    const classes = useStyles();
    const theme = useTheme();
    const history = useHistory();


    const [user, setUser] = useState("");
    const [loadingBackdrop, setLoadingBackdrop] = React.useState(false);


    const [anchorEl, setAnchorEl] = React.useState(null);
    const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);

    const isMenuOpen = Boolean(anchorEl);
    const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMobileMenuClose = () => {
        setMobileMoreAnchorEl(null);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        handleMobileMenuClose();
    };

    const handleLogout = async () => {
        setLoadingBackdrop(true);
        handleMenuClose();
        await new Promise(r => setTimeout(r, 1000));
        await onSignOut();
        setLoadingBackdrop(false);
    }

    const handleMobileMenuOpen = (event) => {
        setMobileMoreAnchorEl(event.currentTarget);
    };

    const menuId = 'primary-search-account-menu';
    const renderMenu = (
        <Menu
            anchorEl={anchorEl}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            id={menuId}
            keepMounted
            transformOrigin={{ vertical: 'top', horizontal: 'center' }}
            open={isMenuOpen}
            onClose={handleMenuClose}
        >
            {!user ? 
                <MenuItem onClick={()=>history.push('/')}><span>Sign in/Sign Up</span></MenuItem>
                :
                <MenuItem onClick={handleLogout}><span>Logout</span><ExitToAppIcon style={{ color: theme.palette.secondary.main }}/></MenuItem>
            }
        </Menu>
    );

    const mobileMenuId = 'primary-search-account-menu-mobile';
    const renderMobileMenu = (
        <Menu
            anchorEl={mobileMoreAnchorEl}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            id={mobileMenuId}
            keepMounted
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={isMobileMenuOpen}
            onClose={handleMobileMenuClose}
        >
            {user ? 
                <MenuItem disabled>
                    <AccountBoxIcon /><Typography variant={"subtitle1"} noWrap>{user}</Typography>
                </MenuItem>
                :
                <MenuItem onClick={()=>history.push('/')}><span>Sign in/Sign Up</span></MenuItem>
            }
            { user &&
                <MenuItem onClick={handleLogout}><span>Logout</span><ExitToAppIcon color={"secondary"}/></MenuItem>
            }

        </Menu>
    );

    useEffect(() => {
        async function retrieveUser() {
            try {
                const returnedUser = await Auth.currentAuthenticatedUser();
                setUser(`${returnedUser.attributes.given_name} ${returnedUser.attributes.family_name}`);
            } catch (e) {
                if (e.includes('not authenticated')) {
                    setUser("")
                }
            }
        }
        retrieveUser();

        // unmount
        return () => setUser("");
    }, [loginState])

    async function onSignOut() {
        await Auth.signOut();
        history.push("/");
    }

    return(
        <Grid item xs={12} className={classes.appBar}>
            <AppBar position="static" className={classes.navbarBg}>
                <Toolbar>
                    <Typography className={classes.title} variant="h6" component={"h1"} noWrap>
                        <span><span>EC2</span><span style={{color: `${theme.palette.secondary.main}`}}>/</span><span>Ensemble</span></span>
                    </Typography>
                    <img className={classes.logo} style={{width: "270px", height: "30px"}} src={'https://'+ window.location.host + '/Assets/Images/logo_inverse.png'} alt="Logo"/>
                    <div className={classes.grow} />
                    <div className={classes.sectionDesktop}>
                        <IconButton
                            edge="end"
                            aria-label="account of current user"
                            aria-controls={menuId}
                            aria-haspopup="true"
                            onClick={handleProfileMenuOpen}
                            color="inherit"
                        >
                            <AccountBoxIcon fontSize={"large"} /><Typography variant={"subtitle1"} noWrap>{user}</Typography>
                        </IconButton>
                    </div>
                    <div className={classes.sectionMobile}>
                        <IconButton
                            aria-label="show more"
                            aria-controls={mobileMenuId}
                            aria-haspopup="true"
                            onClick={handleMobileMenuOpen}
                            color="inherit"
                        >
                            <MoreIcon />
                        </IconButton>
                        {renderMobileMenu}
                        {renderMenu}
                    </div>
                </Toolbar>
            </AppBar>
            <Backdrop className={classes.backdrop} open={loadingBackdrop}>
                <CircularProgress color="inherit" />
            </Backdrop>
        </Grid>
    )

}

const mapStateToProps = (state) => {
    return {
        loginState: state.loginState.currentState,
    };
};


export default connect(mapStateToProps, null)(Navbar);