import * as github from "@actions/github";
import * as core from "@actions/core";

async function main() {
  const repoToken = core.getInput("repo-token");

  const commits = await github.getOctokit(repoToken).rest.repos.listCommits({
    owner: github.context.payload.repository!.owner.login,
    repo: github.context.payload.repository!.name,
  });

  commits.data.forEach((commit) => {
    console.log(commit.commit.message);
  });
}

main();
