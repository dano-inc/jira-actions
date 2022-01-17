import * as core from "@actions/core";
import got from "got";
import dayjs from "dayjs";

process.env.TZ = "Asia/Seoul";

let jiraHostname: string;
let username: string;
let password: string;

interface Version {
  id: string;
  name: string;
}

const getProjectVersions = async (projectId: string) => {
console.log({
  tjiraHostname: typeof jiraHostname,
  tpassword: typeof password,
  tusername : typeof username,
})
console.log(JSON.stringify({ jiraHostname, username, password }));

  const url = new URL(
    `/rest/api/2/project/${projectId}/versions`,
    jiraHostname
  ).toString();

  return got
    .get(url, {
      username,
      password,
    })
    .json<Version[]>();
};

const createVersion = async (
  projectId: string,
  name: string,
  released: boolean
) => {
  const url = new URL("/rest/api/2/version", jiraHostname).toString();

  return got
    .post(url, {
      username,
      password,
      json: {
        name,
        project: projectId,
        released,
      },
    })
    .json<Version>();
};

const findVersionByName = (versions: Version[], name: string) =>
  versions.find((v) => v.name === name);

async function main() {
  jiraHostname = core.getInput("jira-hostname");
  username = core.getInput("jira-username");
  password = core.getInput("jira-password");

  const projectsAsString = core.getInput("projects");
  const versionSuffix = core.getInput("suffix");

  const now = dayjs().format("YYYY.MM.DD");
  const versionName =
    core.getInput("version-name") ||
    (versionSuffix ? `v${now} - ${versionSuffix}` : `v${now}`);

  const result = await Promise.all(
    projectsAsString.split(",").map(async (project) => {
      console.log({ project });
      const versions = await getProjectVersions(project);
      const version =
        findVersionByName(versions, versionName) ||
        (await createVersion(
          project,
          versionName,
          core.getBooleanInput("version-released")
        ));

      return { project, version };
    })
  );

  core.setOutput("result", result);
}

main();
