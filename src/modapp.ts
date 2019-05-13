import { DocumentReference, FieldValue } from "@google-cloud/firestore";
import { ModAppModel, ModAppQueryCondition, ModBuildModel } from "./model";
import { store } from "./common";

export class ModApp {
    public data?: ModAppModel;

    public get id() {
        return this.ref.id;
    }
    private get likeRef() {
        return this.ref.collection('like');
    }
    private get buildRef() {
        return this.ref.collection('build');
    }

    static async create(owner: string, name: string) {
        let ref = await store
            .collection('app')
            .add({
                owner, name,

                playcount: 0,
                likes: 0
            });
        return new ModApp(ref);
    }
    static get(id: string) {
        let app = new ModApp(
            store.collection('app').doc(id)
        );
        return app;
    }
    static async query(conditions: ModAppQueryCondition, limit: number = 10) {
        let app = store.collection('app');
        let query = app.limit(limit);

        if (conditions.owner !== undefined)
            query = query.where('owner', '==', conditions.owner);
        if (conditions.orderBy !== undefined)
            query = query.orderBy(conditions.orderBy, 'desc');

        let apps = await query.get();
        let appsData = [];

        for (let app of apps.docs) {
            appsData.push({
                ...app.data(),
                id: app.id,
                build: (await app.ref.collection('build')
                    .orderBy('created_at')
                    .get()).docs.map(x => x.data())
            })
        }
    }

    constructor(private ref: DocumentReference) {
    }

    async addBuild(uid: string, build: ModBuildModel) {
        await this.buildRef.add({
            ...build,
            created_at: FieldValue.serverTimestamp()
        });
    }
    async addLike(uid: string) {
        let doc = await this.likeRef
            .doc(uid)
            .get();

        if (doc.exists == false) {
            await Promise.all([
                this.likeRef.doc(uid).create({}),
                this.ref.update({
                    likes: FieldValue.increment(1)
                })
            ]);
        }

        return !doc.exists;
    }
    async addPlaycount() {
        await this.ref.update({
            playcount: FieldValue.increment(1)
        });
    }
    async update(uid: string, data: any) {
        await this.ensureDataExistInLocal();

        if (this.data === undefined)
            throw new Error('app does not exist');
        if (this.data.owner !== uid)
            throw new Error('not an owner');
        
        await this.ref.update(data);
    }
    async ensureDataExistInLocal() {
        if (this.data) return;
        this.data = (await this.ref.get()).data() as any;
    }
}