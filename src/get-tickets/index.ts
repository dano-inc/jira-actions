import * as github from "@actions/github";
import * as core from "@actions/core";

const ticketRegExp = /([A-Z0-9]+-(?!0)\d+)/g;

async function main() {
  const repoToken = core.getInput("repo-token");

  const commits = await github.getOctokit(repoToken).rest.repos.listCommits({
    owner: github.context.payload.repository!.owner.login,
    repo: github.context.payload.repository!.name,
  });

  const tickets = commits.data
    .map((data) => data.commit.message.match(ticketRegExp)?.[0])
    .filter(Boolean)
    .join(",");

  core.setOutput("tickets", tickets);

  console.log("Result:", tickets);
}

main();
