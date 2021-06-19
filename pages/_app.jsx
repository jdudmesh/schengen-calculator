import "react-toastify/dist/ReactToastify.css";
import firebase from "firebase/app";
import "firebase/auth";

import { firebaseConfig } from "../firebaseConfig";

import {
    FirebaseAuthProvider,
    FirebaseAuthConsumer,
    IfFirebaseAuthed,
    IfFirebaseAuthedAnd
  } from "@react-firebase/auth";

import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
    return <FirebaseAuthProvider firebase={firebase} {...firebaseConfig}>
        <Component {...pageProps} />
    </FirebaseAuthProvider>
}

export default MyApp
