import * as core from '@actions/core'
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
        if (error instanceof Error) {
            core.setFailed(`❌ 错误: ${error.message}`);
        } else {
            core.setFailed(`❌ 检出失败，未知错误`);
        }
    }
}
