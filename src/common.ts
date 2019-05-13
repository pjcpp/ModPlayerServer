import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { CallableContext } from "firebase-functions/lib/providers/https";

admin.initializeApp();
export let store = admin.firestore();

// Creates a wrapped https trigger 
export async function onHttpsCall(func: (data: any, ctx: CallableContext) => any) {
    return functions.https.onCall(async (data, ctx) => {
        try {
            let result = await func(data, ctx);
            return {
                success: true,
                ...result
            };
        }
        catch (e) {
            let message = null;
            if (e instanceof Error)
                message = e.message;
            return {
                success: false,
                message
            };
        }
    });
}