import * as core from "@actions/core";
import { $ } from 'zx';

$.verbose = false;

const ticketRegExp = /([A-Z0-9]+-(?!0)\d+)/g;

async function main() {
  const commits =await $`git log --format=%s HEAD~1..HEAD`.pipe(
    $`grep -v '^Merge'`
  );

  const tickets = commits.stdout.trim().split('\n')
    .map((commit) => commit.match(ticketRegExp)?.[0])
    .filter(Boolean)
    .join(",");

  core.setOutput("tickets", tickets);

  console.log("Result:", tickets);
}

main();
