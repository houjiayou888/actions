import * as core from '@actions/core';
import { runMavenBuild } from './maven-utils';
import {getInputs} from "./input-helper";

export async  function run(): Promise<void> {
    try {
        const sourceSettings = await getInputs();
        await runMavenBuild(sourceSettings);
        core.setOutput('status', 'success');

    } catch (error) {
        core.setFailed(error instanceof Error ? error.message : 'Unknown error occurred');
    }
}

run();
