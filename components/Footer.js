export default function Footer() {
  // AGPL-3 "Appropriate Legal Notices" (§0): copyright, no-warranty, license link,
  // and the Corresponding Source (§13) for the network-served version — Fruitful
  // (this frontend) + Agrinet (the backend) — plus the upstream it derives from.
  // Plus a Network & Governance section (P3-011 v2): name the protocol and the
  // steward, and surface the paths — front-end standing/exit and rule contestation.
  const link = { fontSize: 12, color: 'rgba(255,255,255,.5)', textDecoration: 'none' };
  const gov = { fontSize: 12, color: 'rgba(255,255,255,.7)', textDecoration: 'underline' };
  const strong = { color: 'rgba(255,255,255,.85)' };
  return (
    <footer style={{ background: 'var(--soil2)', padding: 'var(--space-md) var(--page-pad)', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 700, color: 'var(--cream)' }}>Fruitful</div>
        <div className="flex flex-wrap gap-x-8 gap-y-1">
          <a href="https://www.gnu.org/licenses/agpl-3.0.html" target="_blank" rel="noreferrer" style={link}>AGPL-3.0</a>
          <a href="https://github.com/NTARI-RAND/fruitful" target="_blank" rel="noreferrer" style={link}>Source: Fruitful</a>
          <a href="https://github.com/NTARI-RAND/Agrinet" target="_blank" rel="noreferrer" style={link}>Source: Agrinet</a>
          <a href="https://github.com/carloszambonii/agrinet-brazil" target="_blank" rel="noreferrer" style={link}>Upstream</a>
          <a href="https://docs.theagri.net" target="_blank" rel="noreferrer" style={link}>Docs</a>
        </div>
      </div>

      {/* ── Network & Governance ── */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,.1)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.55)' }}>
          Network &amp; Governance
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', maxWidth: 760, lineHeight: 1.6 }}>
          The marketplace, your reputation, and the immutable transaction ledger live in the <strong style={strong}>Agrinet</strong> protocol — not in this front end. Your record and the market are portable: if a front end declines, read its standing and leave on the trend — your reputation and counterparties come with you. The protocol is stewarded by the <strong style={strong}>Network Theory Applied Research Institute</strong>, a mission-locked 501(c)(3) governed one member, one vote, with its open-source and privacy-first commitments entrenched behind a double supermajority.
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-1" style={{ marginTop: 2 }}>
          <a href="https://ntari.org" target="_blank" rel="noreferrer" style={gov}>NTARI — the steward</a>
          <a href="https://ntari.org" target="_blank" rel="noreferrer" style={gov}>Propose or contest a rule</a>
          <a href="https://github.com/NTARI-RAND/Agrinet" target="_blank" rel="noreferrer" style={gov}>The Agrinet protocol</a>
        </div>
      </div>

      <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', maxWidth: 520 }}>
        © 2025 Network Theory Applied Research Institute. Fruitful is free software (AGPL-3.0) provided with NO WARRANTY; its source is linked above.
      </div>
    </footer>
  );
}
