import { store } from "./common";
import * as functions from 'firebase-functions';

// Will be executed when user registered from app
exports.onUserJoined = functions.auth.user().onCreate((user) => {
    let userRef = store.collection('user').doc(user.uid);

    userRef.create({
        last_played_at: 0,
        likes: []
    });
});