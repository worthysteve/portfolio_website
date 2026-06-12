const TWEAK_DEFAULTS = {
  name: "Steven Daniel",
  role: "AI Engineer",
  palette: "blue-cyan",
  motion: "moderate"
};
const PALS = {
  "blue-cyan":   { a:"#2563EB", a2:"#06B6D4", glow:"rgba(37,99,235,.18)" },
  "violet-cyan": { a:"#7C3AED", a2:"#22D3EE", glow:"rgba(124,58,237,.18)" },
  "sky-emerald": { a:"#0EA5E9", a2:"#10B981", glow:"rgba(14,165,233,.18)" },
};
function PortfolioTweaks() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  React.useEffect(() => {
    const r = document.documentElement;
    const p = PALS[t.palette] || PALS["blue-cyan"];
    r.style.setProperty("--a",    p.a);
    r.style.setProperty("--a2",   p.a2);
    r.style.setProperty("--glow", p.glow);
    document.querySelectorAll("[data-tweak-name]").forEach(el => { el.textContent = t.name || "Steven Daniel"; });
    document.title = (t.name || "Steven Daniel") + " — AI Engineer & Researcher";
    if (window.__updateRole) window.__updateRole(t.role || "AI Engineer");
  }, [t]);
  return (
    <TweaksPanel>
      <TweakSection label="Identity" />
      <TweakText label="Name" value={t.name} onChange={v => setTweak("name", v)} />
      <TweakText label="Role" value={t.role} onChange={v => setTweak("role", v)} />
      <TweakSection label="Visual" />
      <TweakRadio label="Palette" value={t.palette}
        options={["blue-cyan","violet-cyan","sky-emerald"]}
        onChange={v => setTweak("palette", v)} />
      <TweakSection label="Motion" />
      <TweakRadio label="Animation" value={t.motion}
        options={["subtle","moderate","bold"]}
        onChange={v => setTweak("motion", v)} />
    </TweaksPanel>
  );
}
ReactDOM.createRoot(document.getElementById("tweaks-root")).render(React.createElement(PortfolioTweaks));
