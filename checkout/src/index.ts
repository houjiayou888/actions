import * as core from '@actions/core'
import {fetchRefs} from './codearts-api.js';
import {checkoutCode} from './git-utils';
import {getInputs} from "./input-helper";

export async function main() {
    try {
        const sourceSettings = await getInputs();
        // 执行 checkout
        await checkoutCode(sourceSettings);

        core.info('代码检出成功');
        // 设置输出
    } catch (error) {
        core.setFailed(`❌ 错误: ${error.message}`);
    }
}

