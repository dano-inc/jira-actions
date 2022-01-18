import * as core from "@actions/core";
import { $ } from "zx";

$.verbose = true;

const ticketRegExp = /([A-Z0-9]+-(?!0)\d+)/g;

async function main() {
  const previous = core.getInput('previous-tag');
  console.log(previous);
  const latest = core.getInput('latest-tag');
  console.log(latest);
  const commits = await $`git log --format="%s %b" ${previous}..${latest}`.pipe(
    $`grep -v '^Merge'`
  );

  const tickets = commits.stdout
    .trim()
    .split("\n")
    .flatMap((commit) => commit.match(ticketRegExp))
    .filter(Boolean);

  const projects = tickets.reduce((acc, ticket) => {
    const project = ticket!.split("-")[0];

    if (!acc.includes(project)) {
      acc.push(project);
    }

    return acc;
  }, [] as string[]);

  core.setOutput("tickets", tickets.join(","));
  core.setOutput("projects", projects.join(","));

  console.log(tickets);
  console.log(projects);
}

main();
