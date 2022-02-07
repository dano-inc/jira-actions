import * as core from '@actions/core';
import dayjs from 'dayjs';
import got, { HTTPError } from 'got';

process.env.TZ = 'Asia/Seoul';

interface Version {
  id: string;
  name: string;
}

async function main() {
  const jiraHostname = core.getInput('jira-hostname');
  const username = core.getInput('jira-username');
  const password = core.getInput('jira-password');

  const projectsAsString = core.getInput('projects');
  const versionSuffix = core.getInput('suffix');

  const now = dayjs().format('YYYY.MM.DD');
  const versionName = core.getInput('version-name')
    || (versionSuffix ? `v${now} - ${versionSuffix}` : `v${now}`);

  const result = await Promise.all(
    projectsAsString.split(',').map(async (project) => {
      console.log({ project });
      const versions = await getProjectVersions(project);
      const version = findVersionByName(versions, versionName)
        || (await createVersion(
          project,
          versionName,
          core.getBooleanInput('version-released'),
        ));

      return { project, version };
    }),
  );

  core.setOutput('result', result);

  async function getProjectVersions(projectId: string) {
    const url = new URL(
      `/rest/api/2/project/${projectId}/versions`,
      jiraHostname,
    ).toString();

    return got
      .get(url, {
        username,
        password,
      })
      .json<Version[]>();
  }

  async function createVersion(
    projectId: string,
    name: string,
    released: boolean,
  ) {
    const url = new URL('/rest/api/2/version', jiraHostname).toString();

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
  }

  function findVersionByName(versions: Version[], name: string) {
    return versions.find((v) => v.name === name);
  }
}

main().catch(e => {
  if (e instanceof HTTPError) {
    console.error(e.message);
    console.error(e.request.options.headers);
    console.error(e.response.body);
  }
});
