import { run } from '../src/main';
import * as core from '@actions/core';

jest.mock('@actions/core');

describe('Maven Installer Action', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('run handles installation', async () => {
        (core.getInput as jest.Mock).mockReturnValue('3.9.6');
        await run();
        expect(core.exportVariable).toHaveBeenCalledWith('M2_HOME', 'maven\\apache-maven-3.9.6');
    },30000);
});
