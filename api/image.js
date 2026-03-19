export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.HUGGINGFACE_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "HUGGINGFACE_KEY not set" });
  }

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "No prompt provided" });

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            width: 512,
            height: 320,
            num_inference_steps: 20,
            guidance_scale: 7.5,
          },
          options: {
            wait_for_model: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      return res.status(500).json({ error: errText });
    }

    const buffer = await response.arrayBuffer();
    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=3600");
    return res.status(200).send(Buffer.from(buffer));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
