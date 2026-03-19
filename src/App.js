import React, { useState, useEffect, useRef } from "react";

const STAR_COUNT = 60;

function Stars() {
  const stars = Array.from({ length: STAR_COUNT }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 2.5 + 0.5, delay: Math.random() * 4, duration: Math.random() * 3 + 2,
  }));
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
      {stars.map((s) => (
        <div key={s.id} style={{
          position: "absolute", left: `${s.x}%`, top: `${s.y}%`,
          width: s.size, height: s.size, borderRadius: "50%", background: "white", opacity: 0.7,
          animation: `twinkle ${s.duration}s ${s.delay}s ease-in-out infinite alternate`,
        }} />
      ))}
    </div>
  );
}

const PAGE = { FORM: "form", LOADING: "loading", STORY: "story" };

const themes = [
  { id: "forest", label: "🌲 Enchanted Forest" },
  { id: "space", label: "🚀 Outer Space" },
  { id: "ocean", label: "🌊 Underwater Kingdom" },
  { id: "castle", label: "🏰 Magical Castle" },
  { id: "jungle", label: "🦁 Jungle Adventure" },
  { id: "cloud", label: "☁️ Cloud Kingdom" },
];

const moods = [
  { id: "funny", label: "😄 Funny & Silly" },
  { id: "brave", label: "🦸 Brave & Bold" },
  { id: "cozy", label: "🧸 Cozy & Calm" },
  { id: "magical", label: "✨ Magical & Wondrous" },
];

const illustrationStyles = [
  { id: "watercolor", label: "🎨 Watercolor", prompt: "soft watercolor children's book illustration, gentle pastel colors, dreamy" },
  { id: "cartoon", label: "🖍️ Cartoon", prompt: "cute cartoon children's book illustration, bright colors, bold outlines, fun" },
  { id: "storybook", label: "📚 Storybook", prompt: "classic children's storybook illustration, warm colors, detailed, whimsical" },
  { id: "dreamy", label: "✨ Dreamy", prompt: "magical dreamy children's book illustration, glowing light, ethereal, enchanted" },
];

// This component fetches the image from our serverless proxy
function IllustrationImage({ prompt, stylePrompt }) {
  const [src, setSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const fetchedRef = useRef(false);

  useEffect(() => {
    // Only fetch once
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const fullPrompt = `${prompt}, ${stylePrompt}, children's book art, safe for children, no text`;

    fetch("/api/image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: fullPrompt }),
    })
      .then(res => {
        if (!res.ok) return res.text().then(t => { throw new Error(t); });
        return res.blob();
      })
      .then(blob => {
        setSrc(URL.createObjectURL(blob));
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ width: "100%", borderRadius: 14, marginBottom: 12, background: "rgba(255,255,255,0.04)", minHeight: 180, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(253,230,138,0.4)", fontSize: 13, fontStyle: "italic" }}>
        🎨 Painting illustration...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ width: "100%", borderRadius: 14, marginBottom: 12, background: "rgba(255,0,0,0.05)", padding: "8px 12px", color: "#fb7185", fontSize: 11 }}>
        ⚠️ {error.slice(0, 100)}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt="Story illustration"
      style={{ width: "100%", display: "block", borderRadius: 14, marginBottom: 12 }}
    />
  );
}

const isVercelEnv = typeof window !== "undefined" &&
  !window.location.hostname.includes("claude") &&
  !window.location.hostname.includes("localhost") &&
  !window.location.hostname.includes("stackblitz");

export default function App() {
  const [page, setPage] = useState(PAGE.FORM);
  const [childName, setChildName] = useState("");
  const [theme, setTheme] = useState("");
  const [mood, setMood] = useState("");
  const [sidekick, setSidekick] = useState("");
  const [illustrationStyle, setIllustrationStyle] = useState("");
  const [photoBase64, setPhotoBase64] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoDescription, setPhotoDescription] = useState("");
  const [storyTitle, setStoryTitle] = useState("");
  const [paragraphs, setParagraphs] = useState([]);
  const [imagePrompts, setImagePrompts] = useState([]);
  const [error, setError] = useState("");
  const [dots, setDots] = useState(1);
  const storyRef = useRef(null);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=Quicksand:wght@500;700&display=swap');
      @keyframes twinkle { from { opacity:0.2; transform:scale(0.8); } to { opacity:1; transform:scale(1.2); } }
      @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }
      @keyframes fadeSlideUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
      @keyframes shimmer { 0% { background-position:-200% center; } 100% { background-position:200% center; } }
      @keyframes pulse-glow { 0%,100% { box-shadow:0 0 20px rgba(253,186,116,0.3); } 50% { box-shadow:0 0 40px rgba(253,186,116,0.7); } }
      input::placeholder { color:rgba(253,230,138,0.4); } input:focus { outline:none; }
      ::-webkit-scrollbar { width:6px; } ::-webkit-scrollbar-track { background:transparent; } ::-webkit-scrollbar-thumb { background:rgba(253,186,116,0.4); border-radius:3px; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    if (page !== PAGE.LOADING) return;
    const iv = setInterval(() => setDots(d => (d % 3) + 1), 500);
    return () => clearInterval(iv);
  }, [page]);

  const generateStory = async () => {
    if (!childName.trim()) { setError("Please enter a name ✨"); return; }
    if (!theme) { setError("Pick a world to explore! 🌍"); return; }
    if (!mood) { setError("Choose a story mood 💫"); return; }
    if (!illustrationStyle) { setError("Pick an illustration style 🎨"); return; }
    setError("");
    setPage(PAGE.LOADING);

    const themeLabel = themes.find(t => t.id === theme)?.label || theme;
    const moodLabel = moods.find(m => m.id === mood)?.label || mood;
    const sidekickLine = sidekick.trim() ? ` Their magical sidekick is a ${sidekick}.` : "";

    // If photo uploaded, first get character description from it
    let characterDesc = "";
    if (photoBase64) {
      try {
        let descRes;
        const descBody = {
          model: "claude-sonnet-4-20250514",
          max_tokens: 100,
          messages: [{
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: "image/jpeg", data: photoBase64 } },
              { type: "text", text: "Describe this person's appearance in max 10 words focusing on hair color, eye color, and clothing. Be specific and concise. Example: 'brown curly hair, blue eyes, red striped shirt'" }
            ]
          }]
        };
        if (isVercelEnv) {
          descRes = await fetch("/api/story", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(descBody) });
        } else {
          descRes = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json", "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" }, body: JSON.stringify(descBody) });
        }
        const descData = await descRes.json();
        characterDesc = descData.content?.map(c => c.text || "").join("") || "";
        setPhotoDescription(characterDesc);
      } catch (e) {
        console.error("Photo description failed:", e);
      }
    }

    const prompt = `You are a children's bedtime story writer. Write a warm imaginative story for a child named ${childName} set in a ${themeLabel} world with a ${moodLabel} tone.${sidekickLine} The child is the hero. Write exactly 5 paragraphs, age-appropriate (4-8 years), with a gentle sleepy ending.

${characterDesc ? `The main character looks like this: ${characterDesc}. Use this exact description in every image prompt.` : `First create a brief consistent character description for ${childName} (hair color, eye color, clothing - max 10 words).`}
For each paragraph write a short image prompt (max 12 words) describing the scene. ALWAYS start each image prompt with the character description so the character looks consistent.

Respond ONLY with valid JSON, no markdown, no backticks:
{"title":"story title","character":"${characterDesc || 'brief character description max 10 words'}","paragraphs":[{"text":"paragraph text","image":"character description + scene description"},{"text":"...","image":"..."},{"text":"...","image":"..."},{"text":"...","image":"..."},{"text":"...","image":"..."}]}`;

    try {
      let res;
      if (isVercelEnv) {
        res = await fetch("/api/story", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 2000,
            messages: [{ role: "user", content: prompt }],
          }),
        });
      } else {
        res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "anthropic-version": "2023-06-01",
            "anthropic-dangerous-direct-browser-access": "true",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 2000,
            messages: [{ role: "user", content: prompt }],
          }),
        });
      }

      const data = await res.json();
      const text = data.content?.map(c => c.text || "").join("") || "";
      if (!text) throw new Error("API error: " + JSON.stringify(data));

      let parsed;
      try {
        const clean = text.replace(/^```[a-z]*\n?/gm, "").replace(/```$/gm, "").trim();
        const match = clean.match(/\{[\s\S]*\}/);
        if (!match) throw new Error("No JSON found");
        parsed = JSON.parse(match[0]);
      } catch (e) {
        const titleM = text.match(/"title"\s*:\s*"([^"]+)"/);
        const paraMs = [...text.matchAll(/"text"\s*:\s*"((?:[^"\\]|\\.)*)"/g)].map(m => m[1]);
        const imgMs = [...text.matchAll(/"image"\s*:\s*"((?:[^"\\]|\\.)*)"/g)].map(m => m[1]);
        if (paraMs.length === 0) throw new Error("Could not parse story");
        parsed = {
          title: titleM ? titleM[1] : "A Magical Adventure",
          paragraphs: paraMs.map((t, i) => ({ text: t, image: imgMs[i] || "" }))
        };
      }

      const clean = s => s ? s.replace(/\\'/g, "'").replace(/\\"/g, '"') : s;
      const title = clean(parsed.title) || `${childName}'s Magical Adventure`;
      const character = clean(parsed.character) || `young child with bright eyes and colorful clothes`;
      const paras = (parsed.paragraphs || []).map(p => clean(p.text)).filter(Boolean);
      // Prepend character description to every image prompt for consistency
      const imgs = (parsed.paragraphs || []).map(p => {
        const scene = clean(p.image) || "";
        return `${character}, ${scene}`;
      });

      setStoryTitle(title);
      setParagraphs(paras);
      setImagePrompts(imgs);
      setPage(PAGE.STORY);
      setTimeout(() => storyRef.current?.scrollTo({ top: 0 }), 100);
    } catch (e) {
      setError(e.message || "Something went wrong. Try again!");
      setPage(PAGE.FORM);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result.split(",")[1];
      setPhotoBase64(base64);
      setPhotoPreview(ev.target.result);
      setPhotoDescription(""); // reset previous description
    };
    reader.readAsDataURL(file);
  };

  const stylePrompt = illustrationStyles.find(s => s.id === illustrationStyle)?.prompt || "";

  const inputStyle = {
    width: "100%", background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(253,186,116,0.3)",
    borderRadius: 14, padding: "14px 18px", color: "#fde68a",
    fontFamily: "'Quicksand', sans-serif", fontSize: 16, fontWeight: 500, boxSizing: "border-box",
  };

  const btnPrimary = {
    background: "linear-gradient(135deg, #f59e0b, #fb923c)", border: "none", borderRadius: 50,
    padding: "16px 44px", color: "#1a0a3d", fontFamily: "'Quicksand', sans-serif",
    fontSize: 18, fontWeight: 700, cursor: "pointer", animation: "pulse-glow 2.5s ease-in-out infinite",
    letterSpacing: 0.5, transition: "transform 0.15s",
  };

  const sectionLabel = {
    color: "#fde68a", fontWeight: 700, fontSize: 13, letterSpacing: 1.5,
    textTransform: "uppercase", marginBottom: 10, marginTop: 24, width: "100%", opacity: 0.7,
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(170deg, #0a0520 0%, #12082e 40%, #1a0a3d 70%, #0d1535 100%)", fontFamily: "'Quicksand', sans-serif", position: "relative", overflow: "hidden" }}>
      <Stars />
      <div style={{ position: "fixed", top: 32, right: 60, width: 80, height: 80, borderRadius: "50%", background: "radial-gradient(circle at 35% 35%, #fff8c2, #fde68a 60%, #f59e0b)", boxShadow: "0 0 40px 12px rgba(253,230,138,0.35)", zIndex: 0, pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 560, margin: "0 auto", padding: "40px 24px 60px", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 8, animation: "fadeSlideUp 0.7s ease both" }}>
          <div style={{ fontSize: 52, animation: "float 4s ease-in-out infinite", display: "inline-block" }}>🌙</div>
          <h1 style={{ fontFamily: "'Lora', serif", fontSize: "clamp(26px,6vw,36px)", fontWeight: 600, margin: "8px 0 4px", lineHeight: 1.2, background: "linear-gradient(90deg, #fde68a, #fb923c, #fde68a)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "shimmer 4s linear infinite" }}>Dreamweaver</h1>
          <p style={{ color: "rgba(253,230,138,0.6)", fontSize: 14, margin: 0, fontStyle: "italic" }}>A magical bedtime story, just for you</p>
        </div>

        {/* FORM */}
        {page === PAGE.FORM && (
          <div style={{ width: "100%", animation: "fadeSlideUp 0.6s 0.1s ease both", opacity: 0 }}>
            <p style={sectionLabel}>Who is the hero?</p>
            <input style={inputStyle} placeholder="Enter the child's name..." value={childName} onChange={e => setChildName(e.target.value)} onKeyDown={e => e.key === "Enter" && generateStory()} />

            <p style={sectionLabel}>Choose a world</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, width: "100%" }}>
              {themes.map(t => (
                <button key={t.id} onClick={() => setTheme(t.id)} style={{ background: theme === t.id ? "rgba(253,186,116,0.2)" : "rgba(255,255,255,0.04)", border: `1.5px solid ${theme === t.id ? "rgba(253,186,116,0.7)" : "rgba(255,255,255,0.1)"}`, borderRadius: 12, padding: "12px 10px", color: theme === t.id ? "#fde68a" : "rgba(253,230,138,0.5)", fontFamily: "'Quicksand', sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s", textAlign: "left" }}>{t.label}</button>
              ))}
            </div>

            <p style={sectionLabel}>Story mood</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, width: "100%" }}>
              {moods.map(m => (
                <button key={m.id} onClick={() => setMood(m.id)} style={{ background: mood === m.id ? "rgba(253,186,116,0.2)" : "rgba(255,255,255,0.04)", border: `1.5px solid ${mood === m.id ? "rgba(253,186,116,0.7)" : "rgba(255,255,255,0.1)"}`, borderRadius: 12, padding: "12px 10px", color: mood === m.id ? "#fde68a" : "rgba(253,230,138,0.5)", fontFamily: "'Quicksand', sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s", textAlign: "left" }}>{m.label}</button>
              ))}
            </div>

            <p style={sectionLabel}>Illustration style</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, width: "100%" }}>
              {illustrationStyles.map(s => (
                <button key={s.id} onClick={() => setIllustrationStyle(s.id)} style={{ background: illustrationStyle === s.id ? "rgba(253,186,116,0.2)" : "rgba(255,255,255,0.04)", border: `1.5px solid ${illustrationStyle === s.id ? "rgba(253,186,116,0.7)" : "rgba(255,255,255,0.1)"}`, borderRadius: 12, padding: "12px 10px", color: illustrationStyle === s.id ? "#fde68a" : "rgba(253,230,138,0.5)", fontFamily: "'Quicksand', sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s", textAlign: "left" }}>{s.label}</button>
              ))}
            </div>

            <p style={sectionLabel}>Magical sidekick <span style={{ opacity: 0.5, textTransform: "none", fontWeight: 400 }}>(optional)</span></p>
            <input style={inputStyle} placeholder="e.g. a tiny dragon, a talking fox..." value={sidekick} onChange={e => setSidekick(e.target.value)} />

            <p style={sectionLabel}>Hero photo <span style={{ opacity: 0.5, textTransform: "none", fontWeight: 400 }}>(optional — makes illustrations look like them!)</span></p>
            <label style={{ width: "100%", display: "block", cursor: "pointer", boxSizing: "border-box" }}>
              <div style={{ ...inputStyle, display: "flex", alignItems: "center", gap: 12, cursor: "pointer", padding: "12px 18px" }}>
                <span style={{ fontSize: 20 }}>📸</span>
                <span style={{ color: photoPreview ? "#fde68a" : "rgba(253,230,138,0.4)", fontSize: 14 }}>
                  {photoPreview ? "Photo uploaded ✓ tap to change" : "Upload a photo of the child..."}
                </span>
              </div>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: "none" }} />
            </label>
            {photoPreview && (
              <div style={{ marginTop: 10, position: "relative", display: "inline-block", width: "100%" }}>
                <img src={photoPreview} alt="Uploaded" style={{ width: "100%", maxHeight: 160, objectFit: "cover", borderRadius: 12, border: "1.5px solid rgba(253,186,116,0.3)" }} />
                <button onClick={() => { setPhotoBase64(""); setPhotoPreview(""); setPhotoDescription(""); }} style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.6)", border: "none", borderRadius: 50, width: 28, height: 28, color: "white", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
              </div>
            )}

            {error && <p style={{ color: "#fb7185", fontSize: 13, marginTop: 12, textAlign: "center" }}>{error}</p>}

            <div style={{ display: "flex", justifyContent: "center", marginTop: 32 }}>
              <button style={btnPrimary} onClick={generateStory} onMouseEnter={e => e.target.style.transform = "scale(1.05)"} onMouseLeave={e => e.target.style.transform = "scale(1)"}>✨ Weave My Story</button>
            </div>
          </div>
        )}

        {/* LOADING */}
        {page === PAGE.LOADING && (
          <div style={{ textAlign: "center", marginTop: 80 }}>
            <div style={{ fontSize: 64, animation: "float 2s ease-in-out infinite" }}>🧚</div>
            <p style={{ color: "#fde68a", fontSize: 20, fontWeight: 700, marginTop: 20 }}>Conjuring your story{".".repeat(dots)}</p>
            <p style={{ color: "rgba(253,230,138,0.45)", fontSize: 14, fontStyle: "italic" }}>The dream fairies are painting your world</p>
          </div>
        )}

        {/* STORY */}
        {page === PAGE.STORY && (
          <div ref={storyRef} style={{ width: "100%" }}>
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(253,186,116,0.2)", borderRadius: 20, padding: "30px 26px", marginTop: 14 }}>
              <div style={{ textAlign: "center", marginBottom: 28 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📖</div>
                <h2 style={{ fontFamily: "'Lora', serif", fontSize: "clamp(18px,5vw,24px)", fontWeight: 600, color: "#fde68a", margin: 0, fontStyle: "italic", lineHeight: 1.3 }}>{storyTitle}</h2>
                <div style={{ height: 1, background: "rgba(253,186,116,0.2)", margin: "16px 0" }} />
              </div>

              {paragraphs.map((para, i) => (
                <div key={i} style={{ marginBottom: 28 }}>
                  {isVercelEnv && imagePrompts[i] && (
                    <IllustrationImage prompt={imagePrompts[i]} stylePrompt={stylePrompt} />
                  )}
                  <p style={{ fontFamily: "'Lora', serif", fontSize: 16, lineHeight: 1.85, color: "rgba(253,230,138,0.85)", margin: 0 }}>{para}</p>
                </div>
              ))}
              <div style={{ textAlign: "center", marginTop: 20, fontSize: 22 }}>🌙 ✨ 🌙</div>
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24, flexWrap: "wrap" }}>
              <button onClick={generateStory} style={{ ...btnPrimary, padding: "13px 28px", fontSize: 15 }} onMouseEnter={e => e.target.style.transform = "scale(1.05)"} onMouseLeave={e => e.target.style.transform = "scale(1)"}>✨ New Story</button>
              <button onClick={() => setPage(PAGE.FORM)} style={{ background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(253,186,116,0.3)", borderRadius: 50, padding: "13px 28px", color: "#fde68a", fontFamily: "'Quicksand', sans-serif", fontSize: 15, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e => e.target.style.background = "rgba(255,255,255,0.1)"} onMouseLeave={e => e.target.style.background = "rgba(255,255,255,0.06)"}>Change Story</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
