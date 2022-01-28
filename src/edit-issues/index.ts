import * as core from '@actions/core';
import got, { HTTPError } from 'got';

interface VersionResult {
  project: string;
  version: {
    id: number;
    name: string;
  };
}

async function main() {
  const jiraHostname = core.getInput('jira-hostname');
  const username = core.getInput('jira-username');
  const password = core.getInput('jira-password');

  const tickets = core.getInput('tickets').split(',');
  const versionResult = JSON.parse(
    core.getInput('version-result'),
  ) as VersionResult[];

  await Promise.allSettled(
    versionResult.flatMap(({ project, version }) => {
      const affectedTickets = tickets.filter((t) => t.match(new RegExp(`^${project}-`)));

      return affectedTickets.map((ticket) => updateIssueFixVersions(ticket, version.id));
    }),
  );

  async function updateIssueFixVersions(issueId: string, versionId: number) {
    const url = new URL(
      `/rest/api/2/issue/${issueId}`,
      jiraHostname,
    ).toString();

    return got.put(url, {
      username,
      password,
      json: {
        update: {
          fixVersions: [{ set: [{ id: versionId }] }],
          resolution: [{ set: [{ id: 10000 }] }],
        },
      },
    });
  }
}

main().catch(e => {
  if (e instanceof HTTPError) {
    console.error(e.message);
    console.error(e.request.options.headers);
    console.error(e.request.options.url);
    console.error(e.response.body);
  }
});
