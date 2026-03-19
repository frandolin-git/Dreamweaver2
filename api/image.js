export default async function handler(req, res) {
  const prompt = req.query.prompt || (req.body && req.body.prompt);
  const seed = req.query.seed || Math.floor(Math.random() * 99999);

  if (!prompt) return res.status(400).json({ error: "No prompt provided" });

  try {
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=320&nologo=true&seed=${seed}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Image fetch failed: " + response.status);
    const buffer = await response.arrayBuffer();
    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=3600");
    return res.status(200).send(Buffer.from(buffer));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
