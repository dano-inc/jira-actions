import * as core from '@actions/core';
import got, { HTTPError } from 'got';

async function main() {
  const jiraHostname = core.getInput('jira-hostname');
  const username = core.getInput('jira-username');
  const password = core.getInput('jira-password');
  const ticketId = core.getInput('ticket-id');
  const actionId = core.getInput('action-id');

  await transitionTickets(ticketId, actionId);

  async function transitionTickets(ticketId: string, actionId: string) {
    const url = new URL(
      `/rest/api/2/issue/${ticketId}/transitions`,
      jiraHostname,
    ).toString();

    return got.post(url, {
      username,
      password,
      json: {
        transition: { id: actionId },
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
