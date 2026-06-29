export default function Footer() {
  // AGPL-3 "Appropriate Legal Notices" (§0): copyright, no-warranty, license link,
  // and the Corresponding Source (§13) for the network-served version — Fruitful
  // (this frontend) + Agrinet (the backend) — plus the upstream it derives from.
  const link = { fontSize: 12, color: 'rgba(255,255,255,.5)', textDecoration: 'none' };
  return (
    <footer style={{ background: 'var(--soil2)', padding: 'var(--space-md) var(--page-pad)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 700, color: 'var(--cream)' }}>Fruitful</div>
      <div className="flex flex-wrap gap-x-8 gap-y-1">
        <a href="https://www.gnu.org/licenses/agpl-3.0.html" target="_blank" rel="noreferrer" style={link}>AGPL-3.0</a>
        <a href="https://github.com/NTARI-RAND/fruitful" target="_blank" rel="noreferrer" style={link}>Source: Fruitful</a>
        <a href="https://github.com/NTARI-RAND/Agrinet" target="_blank" rel="noreferrer" style={link}>Source: Agrinet</a>
        <a href="https://github.com/carloszambonii/agrinet-brazil" target="_blank" rel="noreferrer" style={link}>Upstream</a>
        <a href="https://docs.theagri.net" target="_blank" rel="noreferrer" style={link}>Docs</a>
      </div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', maxWidth: 380 }}>
        © 2025 Network Theory Applied Research Institute. Fruitful is free software (AGPL-3.0) provided with NO WARRANTY; its source is linked above.
      </div>
    </footer>
  );
}
