const GITLAB_TOKEN =
  process.env.NEXT_PUBLIC_GITLAB_TOKEN;

const PROJECT_ID =
  process.env.NEXT_PUBLIC_GITLAB_PROJECT_ID;

export async function createGitLabIssue(
  title: string,
  description: string
) {

  try {

    const response = await fetch(
      `https://gitlab.com/api/v4/projects/${PROJECT_ID}/issues`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "PRIVATE-TOKEN": GITLAB_TOKEN || "",
        },

        body: JSON.stringify({
          title,
          description,
        }),
      }
    );

    return await response.json();

  } catch (error) {

    console.error(error);

    return null;
  }
}