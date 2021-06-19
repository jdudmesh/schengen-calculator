import React, { useEffect, useState, useRef } from "react";

import firebase from "firebase/app";
import "firebase/auth";

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { FormControl, TextField, Button, Card, Paper, Typography, Link } from "@material-ui/core";

import styles from './login.module.scss'

export function LoginDialog({ openDialog, onClose, user }) {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState("");

    const [usernameError, setUsernameError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);

    useEffect(() => {
        if(user) {
            onClose();
        }
    }, [user]);

    const onChangeUsername = (ev) => {
        setUsername(ev.target.value);
        if(ev.target.value.length > 0) {
            setUsernameError(false);
            setLoginError("");
        }
    }

    const onChangePassword = (ev) => {
        setPassword(ev.target.value);
        if(ev.target.value.length > 0) {
            setPasswordError(false);
            setLoginError("");
        }
    }

    const onSubmit = () => {
        setUsernameError(username.length === 0);
        setPasswordError(password.length === 0);
        if(!(username.length === 0 || password.length === 0)) {
            //dispatch(loginUser({username, password}));
            console.log({username, password});
        } else {
            setLoginError("You must enter a username and password");
        }
    }

    const onGoogleClick = () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth()
            .signInWithPopup(provider)
            .then(res => {
                console.log(res);
            });
    }

    return <Dialog open={openDialog} onClose={onClose}>
        <DialogTitle id="alert-dialog-title">{"Login or Sign-up"}</DialogTitle>
        <DialogContent>
            <div className={styles.loginButton} onClick={onGoogleClick}>
                <img src="/google_login.png"></img>
            </div>
            {/* <div className={styles.loginButton}>
                <img src="/facebook_login.png"></img>
            </div> */}

            {/* <form noValidate autoComplete="off">
                <Typography variant="h5" color="textSecondary" gutterBottom>Login</Typography>
                <FormControl fullWidth className={styles.formControl}>
                    <TextField error={usernameError} fullWidth required id="username" label="Username" value={username} onChange={onChangeUsername} inputProps={{"data-test-id":"username"}}/>
                </FormControl>
                <FormControl fullWidth className={styles.formControl}>
                    <TextField error={passwordError} fullWidth required id="password" label="Password" type="password" value={password} onChange={onChangePassword} inputProps={{"data-test-id":"password"}}/>
                </FormControl>
                <div className={styles.loginButtonContainer}>
                    <Button variant="contained" type="button" color="primary" onClick={onSubmit} data-test-id="login-button">Login</Button>
                </div>
                <div className={styles.errorContainer}>
                    { loginError ? (<Alert severity="error">{loginError}</Alert>) : (<></>)}
                </div>
                <div>
                    <Link href="/forgotpassword">I've forgotten my password...</Link>
                </div>
            </form> */}



        </DialogContent>
        <DialogActions>
            <Button onClick={onClose} color="primary" autoFocus>
                Cancel
            </Button>
        </DialogActions>
    </Dialog>

}