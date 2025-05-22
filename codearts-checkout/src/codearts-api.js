const axios = require('axios');
const core = require('@actions/core');

// 配置 CodeArts API 基础信息（根据实际文档调整）
const CODEARTS_API_BASE = 'https://codearts.example.com/api/v3';
const CODEARTS_TOKEN = core.getInput('codearts-token') || process.env.CODEARTS_TOKEN;

const apiClient = axios.create({
    baseURL: CODEARTS_API_BASE,
    headers: {
        'Authorization': `Bearer ${CODEARTS_TOKEN}`,
        'Content-Type': 'application/json'
    }
});

// 获取仓库列表
async function fetchRepositories() {
    try {
        const response = await apiClient.get('/repositories');
        return response.data.map(repo => ({
            name: repo.name,
            id: repo.id,
            url: repo.ssh_url || repo.http_url
        }));
    } catch (error) {
        throw new Error(`获取仓库列表失败: ${error.message}`);
    }
}

// 获取分支/tag/commit 列表
async function fetchRefs(repoId, refType) {
    try {
        let endpoint;
        switch (refType) {
            case 'branch':
                endpoint = `/repositories/${repoId}/branches`;
                break;
            case 'tag':
                endpoint = `/repositories/${repoId}/tags`;
                break;
            case 'commit':
                endpoint = `/repositories/${repoId}/commits?per_page=50`; // 获取最近 50 条 commit
                break;
            default:
                throw new Error('无效的 ref 类型');
        }
        const response = await apiClient.get(endpoint);
        return response.data.map(item => ({
            name: refType === 'commit' ? item.id.substring(0, 7) : item.name,
            value: refType === 'commit' ? item.id : item.name
        }));
    } catch (error) {
        throw new Error(`获取 ${refType} 列表失败: ${error.message}`);
    }
}

module.exports = { fetchRepositories, fetchRefs };
