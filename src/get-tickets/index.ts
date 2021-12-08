import * as github from '@actions/github';
import * as core from '@actions/core';

async function main() {
    const GITHUB_TOKEN = core.getInput('github-token');

    const commits = await github.getOctokit(GITHUB_TOKEN).rest.repos.listCommits({
        owner: github.context.payload.repository!.owner.login,
        repo: github.context.payload.repository!.name,
    });

    console.log(commits);
}

main();
