import { FieldValue, DocumentReference } from '@google-cloud/firestore';
import { onHttpsCall, store } from './common';
import { ModApp } from './modapp';
import * as moment from 'moment';
import { User } from './user';
import { NotAuthorizedError } from './error';

/*  createApp
      * name(Required): Application's nickname
 */
exports.createApp = onHttpsCall(async (data, ctx) => {
    if (ctx.auth == null)
        throw new NotAuthorizedError();

    const app = await ModApp.create(
        ctx.auth.uid, data.name);

    return {
        app_id: app.id
    };
});
/*  setPreviewImages
       * app_id(Required): Target app id to modify
       * preview_urls(Required): comma(',') seperated urls
 */
exports.setPreviewImages = onHttpsCall(async (data, ctx) => {
    if (ctx.auth == null)
        throw new NotAuthorizedError();

    const app = ModApp.get(data.app_id);
    // Since firestore does not support deep queries,
    //   it's fairly efficient to do like this
    await app.update(ctx.auth.uid, {
        // A list of urls which is comma(',') seperated string
        preview_urls: data.preview_urls
    });

    return {
    };
});
/*  setThumbnail
      * app_id(Required): Target app id to modify
      * thumbnail_url(Required): thumbnail's url 
 */
exports.setThumbnail = onHttpsCall(async (data, ctx) => {
    if (ctx.auth == null)
        throw new NotAuthorizedError();

    const app = ModApp.get(data.app_id);
    await app.update(ctx.auth.uid, {
        thumbnail_url: data.thumbnail_url
    });

    return {
    };
});
/*  addBuild
      * app_id(Required): Target app id to modify
      * title(Required): build's name
      * version(Required): version string which may carry alphabetical version codes.
      * scene_url(Required): scene asset's url
      * script_url(Required): script asset's url
      * description: A short comment that describes release notes such as new features, changes and fixes.
 */
exports.addBuild = onHttpsCall(async (data, ctx) => {
    if (ctx.auth == null)
        throw new NotAuthorizedError();

    const app = ModApp.get(data.app_id);
    await app.addBuild(ctx.auth.uid, {
        title: data.title,
        version: data.version,
        description: data.description,
        scene_url: data.scene_url,
        script_url: data.script_url,

        created_at: FieldValue.serverTimestamp()
    });

    return {
    };
});
/*  getApps
      * owner: filters by owner uid if specified
 */
exports.getApps = onHttpsCall(async (data, ctx) => {
    const apps = await ModApp.query({
        owner: data.owner
    });

    return {
        apps
    };
});
/*  getTopApps
 */
exports.getTopApps = onHttpsCall(async (data, ctx) => {
    const apps = await ModApp.query({
        orderBy: 'playcount'
    });

    return {
        apps
    };
});

/*  createPlayHistory
      * app_id(Required): Target app id to modify
 */
exports.createPlayHistory = onHttpsCall(async (data, ctx) => {
    if (ctx.auth == null)
        throw new NotAuthorizedError();

    const app = ModApp.get(data.app_id);
    const user = User.get(ctx.auth.uid);
    await user.ensureDataExistInLocal();

    // Playcount can be increased once every 10 mins.
    const diff = moment.duration(
        moment().diff(user.data.last_played_at));
    if (diff.asMinutes() >= 10) {
        await Promise.all([
            user.update({
                last_played_at: moment()
            }),
            app.addPlaycount()
        ]);
    }

    return {
    };
});
/*  like
      * app_id(Required): Target app id to modify
 */
exports.like = onHttpsCall(async (data, ctx) => {
    if (ctx.auth == null)
        throw new NotAuthorizedError();

    const app = ModApp.get(data.app_id);
    const user = User.get(ctx.auth.uid);

    if (await app.addLike(ctx.auth.uid)) {
        await user.addLike(data.app_id);
    }

    return {
    };
});