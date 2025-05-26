import * as core from '@actions/core';

export async function stop(): Promise<void> {
    core.info('setup-php 停止钩子触发（可用于清理操作）');
}
