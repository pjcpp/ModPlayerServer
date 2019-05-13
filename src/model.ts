export interface ModAppQueryCondition {
    owner?: string;

    orderBy?: string;
}
export interface ModBuildModel {
    title: string;
    version: string,
    description: string;
    scene_url: string;
    script_url: string;

    created_at: any;
}
export interface ModAppModel {
    owner: string;

    build: ModBuildModel[];
}

export interface UserModel {
    name: string;

    last_played_at: number;
    likes: string[];
}