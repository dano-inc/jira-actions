import * as core from "@actions/core";
import got from "got";

let jiraHostname: string;
let username: string;
let password: string;

const updateIssueFixVersions = async (issueId: string, versionId: number) => {
  const url = new URL(`/rest/api/2/issue/${issueId}`, jiraHostname).toString();

  return got.put(url, {
    username,
    password,
    json: {
      update: { fixVersions: [{ set: [{ id: versionId }] }] },
    },
  });
};

interface VersionResult {
  project: string;
  version: {
    id: number;
    name: string;
  };
}

async function main() {
  jiraHostname = core.getInput("jira-hostname");
  username = core.getInput("jira-username");
  password = core.getInput("jira-password");

  const tickets = core.getInput("tickets").split(",");
  const versionResult = JSON.parse(
    core.getInput("version-result")
  ) as VersionResult[];

  await Promise.all(
    versionResult.flatMap(({ project, version }) => {
      const affectedTickets = tickets.filter((t) =>
        t.match(new RegExp(`^${project}-`))
      );

      return affectedTickets.map((ticket) =>
        updateIssueFixVersions(ticket, version.id)
      );
    })
  );
}

main();
