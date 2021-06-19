import { useState, useEffect, useMemo, createContext } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head'

import firebase from "firebase/app";
import "firebase/auth";

import AppBar from '@material-ui/core/AppBar';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import { HelpOutline, SaveOutlined, ExitToAppOutlined, PowerSettingsNewOutlined } from '@material-ui/icons';
import Paper from '@material-ui/core/Paper';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';

import { ToastContainer, toast } from 'react-toastify';
import { useCookies } from 'react-cookie';
import ReactGA from 'react-ga';

import moment from 'moment'

import { HelpDialog } from "../components/helpDialog";
import { LoginDialog } from "../components/loginDialog";

import styles from '../styles/Home.module.css'

import {
    FirebaseAuthConsumer,
} from "@react-firebase/auth";

import { Calendar } from '../components/calendar'

export default function Home(props) {

    ReactGA.initialize('G-6LHZTNJPFD');
    ReactGA.pageview('/');

    const [openHelpDialog, setOpenHelpDialog] = useState(false);
    const [openLoginDialog, setOpenLoginDialog] = useState(false);
    const [cookies, setCookie, removeCookie] = useCookies(['agree-terms']);

    useEffect(() => {
        if(!cookies["agree-terms"]) {
            setOpenHelpDialog(true);
        }
    }, [cookies]);

    const onHelp = () => {
        setOpenHelpDialog(true);
    }

    const onHelpClose = () => {
        setOpenHelpDialog(false);
        setCookie("agree-terms", "1", { expires: moment().add(1, "year").toDate() });
    }

    const onLogin = () => {
        setOpenLoginDialog(true);
    }

    const onLoginClose = () => {
        setOpenLoginDialog(false);
    }

    const onLogout = () => {
        firebase.auth().signOut();
    }

    return <FirebaseAuthConsumer>
        {({ isSignedIn, user, providerId }) => {
            return <>
                <Head>
                    <title>Schengen Viss Free Stay Calculator</title>
                    <link rel="icon" href="/favicon.ico" />
                    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
                    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
                    <meta name="keywords" content="schengen,visa,calculator,eu" />
                    <meta name="author" content="John Dudmesh" />
                    <meta name="description" content="Visa Free Schengen Stay Calculator" />
                    <meta charSet="UTF-8" />
                </Head>

                <div>
                    <AppBar className={styles.appBar}>
                        <Typography variant="h6">Schengen Calculator - Plan your stay in the Schengen Area</Typography>
                        <div className={styles.grow}></div>
                        <div className={styles.appBarButtons}>
                            <Tooltip title="Help"><IconButton color="inherit" edge="end" onClick={onHelp}><HelpOutline></HelpOutline></IconButton></Tooltip>
                            { isSignedIn
                                ? <Tooltip title="Logout"><IconButton color="inherit" edge="end" onClick={onLogout}><PowerSettingsNewOutlined></PowerSettingsNewOutlined></IconButton></Tooltip>
                                : <Tooltip title="Login or Sign-up"><IconButton color="inherit" edge="end" onClick={onLogin}><ExitToAppOutlined></ExitToAppOutlined></IconButton></Tooltip>
                            }
                        </div>
                    </AppBar>
                    <div className="container">
                        <div className="colSpacer"></div>
                        <div className="mainContent">
                            <Paper>
                                <Calendar user={user}></Calendar>
                            </Paper>
                        </div>
                        <div className="colSpacer"></div>
                    </div>
                </div>

                <div className={styles.footer}>
                    &copy; John Dudmesh 2021 {props.environment === "DEV" ? "DEV" : "" }
                </div>

                <HelpDialog openDialog={openHelpDialog} onClose={onHelpClose}></HelpDialog>
                <LoginDialog openDialog={openLoginDialog} onClose={onLoginClose} user={user}></LoginDialog>

                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={true}
                    newestOnTop={true}
                    closeOnClick
                />

            </>}}
    </FirebaseAuthConsumer>

}