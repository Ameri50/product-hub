import { a as getApp, o as getApps, s as initializeApp } from "../_libs/@firebase/app+[...].mjs";
import { t as getAuth } from "../_libs/firebase__auth.mjs";
import "../_libs/firebase.mjs";
import { c as getFirestore } from "../_libs/@firebase/firestore+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/firebase-BwL9iHXg.js
var firebaseConfig = {
	apiKey: "AIzaSyCn9yWVnz2l-_A41ombelQmXDyA9MC0Lvk",
	authDomain: "miapp-4a216.firebaseapp.com",
	projectId: "miapp-4a216",
	storageBucket: "miapp-4a216.firebasestorage.app",
	messagingSenderId: "553513944411",
	appId: "1:553513944411:web:c4b3592357220c9f63c67e"
};
var _app = null;
var _db = null;
var _auth = null;
function getFirebase() {
	if (typeof window === "undefined") return {
		app: null,
		db: null,
		auth: null
	};
	if (!_app) {
		_app = getApps().length ? getApp() : initializeApp(firebaseConfig);
		_db = getFirestore(_app);
		_auth = getAuth(_app);
	}
	return {
		app: _app,
		db: _db,
		auth: _auth
	};
}
//#endregion
export { getFirebase as t };
