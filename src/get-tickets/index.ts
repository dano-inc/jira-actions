import * as core from '@actions/core';
import { $ } from 'zx';

$.verbose = false;

const ticketRegExp = /([A-Z0-9]+-(?!0)\d+)/g;

async function main() {
  const to = core.getInput('to-revision');
  const from = core.getInput('from-revision');
  const commits = await $`git log --format="%s %b" ${from}..${to}`.pipe(
    $`grep -v '^Merge'`
  );

  const tickets = commits.stdout
    .trim()
    .split('\n')
    .flatMap((commit) => commit.match(ticketRegExp))
    .filter(Boolean);

  const projects = tickets.reduce((acc, ticket) => {
    const project = ticket!.split('-')[0];

    if (!acc.includes(project)) {
      acc.push(project);
    }

    return acc;
  }, [] as string[]);

  core.setOutput('tickets', tickets.join(','));
  core.setOutput('projects', projects.join(','));
}

main();
