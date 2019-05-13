import { DocumentReference } from "@google-cloud/firestore";
import { UserModel } from "./model";
import { store } from "./common";

export class User {
    public data?: UserModel;

    private get likeRef() {
        return this.ref.collection('like');
    }

    static get(uid: string) {
        let user = new User(
            store.collection('user').doc(uid)
        );
        return user;
    }

    constructor(private ref: DocumentReference) {
    }

    async addLike(appId: string) {
        await this.likeRef.doc(appId).create({});
    }
    async update(data: any) {
        await this.ref.update(data);
    }
    async ensureDataExistInLocal() {
        if (this.data) return;
        this.data = (await this.ref.get()).data() as any;
    }
}