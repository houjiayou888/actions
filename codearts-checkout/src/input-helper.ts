import {IGitSourceSettings} from "./IGitSourceSettings";
import core = require('@actions/core');

export async function getInputs(): Promise<IGitSourceSettings> {
    const result = {} as unknown as IGitSourceSettings
    result.repository = core.getInput('repository');
    result.refType = core.getInput('ref_type');
    result.ref = core.getInput('ref');
    result.targetPath = core.getInput('target_path');
    result.submoduleInit = Boolean(core.getInput('submodule_init'));
    result.isDepth = Boolean(core.getInput('is_depth'));
    result.depth = Number(core.getInput('depth'));
    result.lfs = Boolean(core.getInput('lfs'));
    return result
}
