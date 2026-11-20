interface GithubConfig {
  username: string;
  repository: string;
  branch: string;
  token: string;
}

interface GithubContentResponse {
  path: string;
  sha: string;
}

// client
function getClientConfig(): GithubConfig {
  const username = process.env.NEXT_PUBLIC_GITHUB_USERNAME;
  const repository = process.env.NEXT_PUBLIC_GITHUB_REPOSITORY;
  const branch = process.env.NEXT_PUBLIC_GITHUB_BRANCH ?? "main";
  const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN;

  if (!username || !repository || !token) {
    throw new Error("Konfigurasi GitHub storage di .env belum lengkap.");
  }

  return { username, repository, branch, token };
}

function apiUrl(path: string) {
  const config = getClientConfig();
  return `https://api.github.com/repos/${config.username}/${config.repository}/contents/${path}`;
}

function githubHeaders() {
  const config = getClientConfig();
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${config.token}`,
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  };
}

export function createGithubFilename(originalName: string): string {
  const extension = originalName.split(".").pop()?.toLowerCase();
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  const random = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return `${Date.now()}_${random}${extension ? `.${extension}` : ""}`;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      if (!base64) {
        reject(new Error("Gagal mengonversi file ke base64."));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Gagal membaca file gambar."));
    reader.readAsDataURL(file);
  });
}

export async function uploadFileToGithub(
  file: File,
  directory = "news",
): Promise<string> {
  const config = getClientConfig();
  const filename = createGithubFilename(file.name);
  const cleanDir = directory.replace(/^\/+|\/+$/g, "");
  const path = cleanDir ? `${cleanDir}/${filename}` : filename;
  const base64Content = await fileToBase64(file);

  const response = await fetch(apiUrl(path), {
    method: "PUT",
    headers: githubHeaders(),
    body: JSON.stringify({
      message: `Upload ${filename}`,
      content: base64Content,
      branch: config.branch,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub upload failed: ${response.status} ${body}`);
  }

  return `https://cdn.jsdelivr.net/gh/${config.username}/${config.repository}@${config.branch}/${path}`;
}

export async function deleteFileFromGithub(imageUrl: string): Promise<void> {
  const config = getClientConfig();
  const prefix = `https://cdn.jsdelivr.net/gh/${config.username}/${config.repository}@${config.branch}/`;

  if (!imageUrl.startsWith(prefix)) return;

  const path = decodeURIComponent(imageUrl.slice(prefix.length));
  if (!path) return;

  const response = await fetch(apiUrl(path), {
    method: "GET",
    headers: githubHeaders(),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to get GitHub file: ${response.status} ${body}`);
  }

  const content = (await response.json()) as GithubContentResponse;
  if (!content.sha) return;

  const deleteResponse = await fetch(apiUrl(path), {
    method: "DELETE",
    headers: githubHeaders(),
    body: JSON.stringify({
      message: `Delete ${path}`,
      sha: content.sha,
      branch: config.branch,
    }),
  });

  if (!deleteResponse.ok && deleteResponse.status !== 404) {
    const body = await deleteResponse.text();
    throw new Error(`GitHub delete failed: ${deleteResponse.status} ${body}`);
  }
}
