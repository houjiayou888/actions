export interface IGitSourceSettings {
    repository: string;
    refType: string;
    ref: string;
    targetPath: string;
    submoduleInit:  boolean;
    isDepth:  boolean;
    depth: number;
    lfs: boolean;
}
