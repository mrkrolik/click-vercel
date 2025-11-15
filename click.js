// api/click.js
const GITHUB_TOKEN = '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';
const REPO = 'mrkrolik/clicks';
const FILE_PATH = 'clicks.json';
const API_URL = `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const response = await fetch(API_URL, {
        headers: {
          'User-Agent': 'vercel-click-counter',
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      const data = await response.json();
      const content = JSON.parse(atob(data.content));
      return res.status(200).json({ count: content.count });
    } catch {
      return res.status(200).json({ count: 0 });
    }
  }

  if (req.method === 'POST') {
    try {
      const getRes = await fetch(API_URL, {
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'User-Agent': 'vercel-click-counter',
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!getRes.ok) {
        const err = await getRes.text();
        return res.status(500).json({ error: 'GitHub: ' + getRes.status });
      }

      const fileData = await getRes.json();
      const content = JSON.parse(atob(fileData.content));
      const newCount = content.count + 1;

      const updatedContent = btoa(JSON.stringify({ count: newCount }, null, 2));

      await fetch(API_URL, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'User-Agent': 'vercel-click-counter',
          'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify({
          message: `Клик #${newCount}`,
          content: updatedContent,
          sha: fileData.sha
        })
      });

      return res.status(200).json({ count: newCount });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.status(404).json({ error: 'Not found' });
}
