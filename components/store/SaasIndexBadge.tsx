export default function SaasIndexBadge() {
  return (
    <a
      href="https://saas-indexation.com/applications/mes-poches"
      target="_blank"
      rel="noopener"
      data-saas-apk="saas_apk_ImgENDqiwKoZbyrEC85qMFmOqflB1dvxfGOikCia"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 16px',
        background: '#0f172a',
        color: '#ffffff',
        fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
        fontSize: 13,
        fontWeight: 'normal',
        borderRadius: 12,
        textDecoration: 'none',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        border: '1px solid rgba(148,163,184,0.25)',
        flexShrink: 0,
      }}
    >
      <img
        src="https://saas-indexation.com/imgs/logo.webp"
        alt="Saas-Indexation"
        width={22}
        height={22}
        style={{ width: 22, height: 22, objectFit: 'contain' }}
      />
      <span
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          lineHeight: 1.1,
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 'bold', letterSpacing: -0.2, color: '#ffffff' }}>
          MES POCHES
        </span>
        <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 400, fontStyle: 'italic' }}>
          Vérifié & Indexé sur saas-indexation.com
        </span>
      </span>
    </a>
  )
}
