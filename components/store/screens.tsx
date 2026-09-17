export function HomeScreen() {
  return (
    <div className="flex h-full flex-col bg-white">
      <Status />
      <div className="flex items-center justify-between px-3.5 py-2">
        <div className="flex items-center gap-1.5">
          <span className="h-5 w-5 rounded-full bg-[#2563EB]" />
          <p className="text-[10px] font-bold tracking-[0.12em] text-[#111]">MES POCHES</p>
        </div>
        <div className="flex gap-1.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F2F4F5] text-[9px] text-[#111]">
            ⌂
          </span>
          <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-[#F2F4F5] text-[9px]">
            ●
            <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-[#2563EB]" />
          </span>
        </div>
      </div>
      <div className="px-3.5">
        <div className="relative overflow-hidden rounded-[1.15rem] bg-gradient-to-br from-[#1B3A7A] via-[#163066] to-[#0E1F45] p-3.5 text-white">
          <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/[0.07]" />
          <div className="pointer-events-none absolute -bottom-8 -left-5 h-24 w-24 rounded-full bg-black/10" />
          <p className="text-[8px] font-semibold tracking-wide text-white/80">Plan Premium</p>
          <p className="mt-2.5 text-[8px] text-white/55">Solde disponible</p>
          <p className="mt-0.5 text-[21px] font-bold leading-none">248 500 F</p>
          <div className="mt-3 flex gap-3 text-[8px]">
            <span className="text-[#7DFFB3]">↓ Entrées 82 000</span>
            <span className="text-[#FFB4AE]">↑ Sorties 41 200</span>
          </div>
          <div className="mt-3 flex items-end justify-between">
            <p className="text-[7px] tracking-widest text-white/70">CHARLES LUCIANO</p>
            <div className="h-4 w-6 rounded-[2px] bg-gradient-to-br from-[#F8E7B0] to-[#C9A227]" />
          </div>
        </div>
        <div className="mt-2.5 grid grid-cols-4 gap-1.5">
          {[
            ['Dépense', '#FDECEC'],
            ['Revenu', '#E8F8EF'],
            ['Scanner', '#FFF6E5'],
            ['Virement', '#EEF4FF'],
          ].map(([l, bg]) => (
            <div key={l} className="rounded-xl bg-[#F8F9FA] py-1.5 text-center">
              <div className="mx-auto mb-1 h-5 w-5 rounded-full" style={{ background: bg }} />
              <p className="text-[7px] font-medium text-[#111]">{l}</p>
            </div>
          ))}
        </div>
        <p className="mb-0.5 mt-2.5 text-[9px] font-semibold text-[#111]">Récent</p>
        {[
          ['Transport', '−1 500 F', true],
          ['Salaire', '+180 000 F', false],
          ['Marché', '−8 400 F', true],
        ].map(([n, a, out]) => (
          <div key={n as string} className="flex items-center gap-2 py-1">
            <div className={`h-6 w-6 rounded-full ${out ? 'bg-[#FDECEC]' : 'bg-[#E8F8EF]'}`} />
            <div className="flex-1">
              <p className="text-[9px] font-medium text-[#111]">{n}</p>
              <p className="text-[7px] text-[#9A9A9A]">Aujourd’hui</p>
            </div>
            <p className={`text-[9px] font-semibold ${out ? 'text-[#F04438]' : 'text-[#12B76A]'}`}>{a}</p>
          </div>
        ))}
      </div>
      <AtelierNav active="home" />
    </div>
  )
}

export function PendingScreen() {
  return (
    <div className="flex h-full flex-col bg-white">
      <Status />
      <div className="px-3.5">
        <p className="py-1.5 text-[14px] font-bold text-[#111]">À valider</p>
        <p className="text-[8px] leading-snug text-[#707070]">SMS, tickets et dictées arrivent ici.</p>
        <div className="mt-2.5 border-t border-[#E7E7E7] pt-2.5">
          <div className="flex items-center justify-between">
            <p className="text-[7px] font-semibold uppercase tracking-wider text-[#2563EB]">SMS · Orange</p>
            <span className="rounded-full bg-[#E8F8EF] px-1.5 py-0.5 text-[7px] font-semibold text-[#12B76A]">
              92 %
            </span>
          </div>
          <p className="mt-1 text-[18px] font-bold text-[#F04438]">−25 000 F</p>
          <p className="text-[10px] font-medium text-[#111]">Transfert vers 07 XX XX XX</p>
          <div className="mt-2 flex gap-1">
            <span className="flex-1 rounded-full bg-[#EEF4FF] py-1 text-center text-[7px] font-semibold text-[#2563EB]">
              Orange Money
            </span>
            <span className="flex-1 rounded-full bg-[#EEF4FF] py-1 text-center text-[7px] font-semibold text-[#2563EB]">
              Transfert
            </span>
          </div>
          <div className="mt-1.5 flex gap-1">
            {['Modifier', 'Valider', 'Ignorer'].map((b, i) => (
              <span
                key={b}
                className={`flex-1 rounded-full py-1.5 text-center text-[7px] font-semibold ${
                  i === 1 ? 'bg-[#2563EB] text-white' : 'border border-[#2563EB] text-[#2563EB]'
                }`}
              >
                {b}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-3 border-t border-[#E7E7E7] pt-2.5">
          <p className="text-[7px] font-semibold uppercase tracking-wider text-[#2563EB]">Note vocale</p>
          <p className="mt-1 text-[18px] font-bold text-[#F04438]">−2 000 F</p>
          <p className="text-[10px] text-[#111]">Transport</p>
        </div>
      </div>
      <AtelierNav active="plus" />
    </div>
  )
}

export function WalletsScreen() {
  return (
    <div className="flex h-full flex-col bg-white">
      <Status />
      <div className="px-3.5">
        <p className="py-1.5 text-[14px] font-bold text-[#111]">Poches</p>
        {[
          ['Cash', '42 000 F'],
          ['Orange Money', '86 500 F'],
          ['MTN MoMo', '31 200 F'],
          ['UBA', '88 800 F'],
        ].map(([n, a]) => (
          <div key={n} className="mb-1.5 flex items-center gap-2 rounded-2xl bg-[#F8F9FA] p-2">
            <div className="h-8 w-8 rounded-full bg-[#2563EB]/15" />
            <div className="flex-1">
              <p className="text-[10px] font-semibold text-[#111]">{n}</p>
              <p className="text-[7px] text-[#9A9A9A]">Solde actuel</p>
            </div>
            <p className="text-[10px] font-bold text-[#111]">{a}</p>
          </div>
        ))}
        <div className="mt-1 rounded-full bg-[#2563EB] py-2 text-center text-[10px] font-semibold text-white">
          + Nouvelle poche
        </div>
      </div>
      <AtelierNav active="wallets" />
    </div>
  )
}

export function AnalyticsScreen() {
  return (
    <div className="flex h-full flex-col bg-white">
      <Status />
      <div className="px-3.5">
        <p className="py-1 text-center text-[12px] font-semibold text-[#2563EB]">Septembre 2026 ▾</p>
        <p className="text-[24px] font-bold text-[#111]">+41 300 F</p>
        <p className="text-[8px] text-[#707070]">Solde du mois (entrées − sorties)</p>
        <div className="mt-2.5 flex gap-2">
          <div className="flex-1 rounded-xl bg-[#E8F8EF] p-2">
            <p className="text-[7px] text-[#12B76A]">Entrées</p>
            <p className="text-[11px] font-bold text-[#12B76A]">82 000</p>
          </div>
          <div className="flex-1 rounded-xl bg-[#FDECEC] p-2">
            <p className="text-[7px] text-[#F04438]">Sorties</p>
            <p className="text-[11px] font-bold text-[#F04438]">40 700</p>
          </div>
        </div>
        <p className="mb-0.5 mt-2.5 text-[9px] font-semibold">Vs août 2026 ▾</p>
        {['Revenus +12 %', 'Dépenses −8 %', 'Solde +19 %'].map((l) => (
          <div key={l} className="flex justify-between border-b border-[#E7E7E7] py-1 text-[8px]">
            <span className="text-[#111]">{l.split(' ')[0]}</span>
            <span className="font-semibold text-[#12B76A]">{l.split(' ').slice(1).join(' ')}</span>
          </div>
        ))}
        <div className="mt-2.5 rounded-xl bg-[#EEF4FF] p-2">
          <p className="text-[8px] font-semibold text-[#2563EB]">Briefing IA</p>
          <p className="mt-1 text-[7px] leading-snug text-[#555]">
            Le transport pèse trop ce mois. Plafonne à 15 000 F.
          </p>
        </div>
      </div>
      <AtelierNav active="analytics" />
    </div>
  )
}

export function JournalScreen() {
  return (
    <div className="flex h-full flex-col bg-white">
      <Status />
      <div className="px-3.5">
        <p className="py-1.5 text-[14px] font-bold text-[#111]">Transactions</p>
        <div className="mb-2 rounded-full bg-[#F2F4F5] px-3 py-1.5 text-[8px] text-[#9A9A9A]">
          Rechercher…
        </div>
        <p className="text-[8px] font-semibold text-[#2563EB]">Aujourd’hui</p>
        {[
          ['Transport', '−1 500'],
          ['Café', '−800'],
          ['Remboursement', '+5 000'],
        ].map(([n, a]) => (
          <div key={n} className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-[#EEF4FF]" />
              <p className="text-[9px] font-medium">{n}</p>
            </div>
            <p className={`text-[9px] font-semibold ${String(a).startsWith('+') ? 'text-[#12B76A]' : 'text-[#F04438]'}`}>
              {a} F
            </p>
          </div>
        ))}
        <p className="mt-2 text-[8px] font-semibold text-[#2563EB]">Hier</p>
        {['Marché −12 400', 'Essence −8 000'].map((l) => (
          <p key={l} className="py-1 text-[9px] text-[#111]">
            {l}
          </p>
        ))}
      </div>
      <AtelierNav active="tx" />
    </div>
  )
}

export function CategoriesScreen() {
  return (
    <div className="flex h-full flex-col bg-white">
      <Status />
      <div className="px-3.5">
        <p className="py-1.5 text-[14px] font-bold text-[#111]">Catégories</p>
        {[
          ['Transport', '12 400 F'],
          ['Alimentation', '38 200 F'],
          ['Salaire', '180 000 F'],
          ['Santé', '6 500 F'],
        ].map(([n, a]) => (
          <div key={n} className="mb-1.5 flex items-center gap-2 rounded-2xl bg-[#F8F9FA] p-2">
            <div className="h-8 w-8 rounded-lg bg-[#EEF4FF]" />
            <p className="flex-1 text-[10px] font-semibold">{n}</p>
            <p className="text-[10px] font-bold">{a}</p>
          </div>
        ))}
      </div>
      <AtelierNav active="cat" />
    </div>
  )
}

export const PREVIEW_SCREENS = [
  { id: 'home', node: <HomeScreen /> },
  { id: 'pending', node: <PendingScreen /> },
  { id: 'wallets', node: <WalletsScreen /> },
  { id: 'analytics', node: <AnalyticsScreen /> },
]

function Status() {
  return (
    <div className="flex items-center justify-between px-5 pb-0.5 pt-6 text-[9px] font-semibold text-[#111]">
      <span>09:41</span>
      <span>5G · 84%</span>
    </div>
  )
}

function AtelierNav({
  active,
}: {
  active: 'home' | 'tx' | 'cat' | 'wallets' | 'analytics' | 'plus'
}) {
  const left = [
    ['home', 'Accueil'],
    ['tx', 'Transac.'],
    ['cat', 'Catég.'],
  ] as const
  const right = [
    ['wallets', 'Poches'],
    ['analytics', 'Analyse'],
    ['plus', 'Plus'],
  ] as const

  return (
    <div className="mt-auto border-t border-[#E7E7E7] bg-white px-0.5 pb-1.5 pt-1.5">
      <div className="flex items-end">
        {left.map(([id, label]) => (
          <NavItem key={id} label={label} on={active === id} />
        ))}
        <div className="flex w-[42px] shrink-0 justify-center pb-1">
          <div className="-mt-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#2563EB] text-[16px] font-light text-white">
            +
          </div>
        </div>
        {right.map(([id, label]) => (
          <NavItem key={id} label={label} on={active === id} />
        ))}
      </div>
    </div>
  )
}

function NavItem({ label, on }: { label: string; on: boolean }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-0.5 py-0.5">
      <span className={`h-1.5 w-1.5 rounded-full ${on ? 'bg-[#2563EB]' : 'bg-[#D0D5DD]'}`} />
      <span className={`text-[6.5px] font-semibold ${on ? 'text-[#2563EB]' : 'text-[#9A9A9A]'}`}>
        {label}
      </span>
    </div>
  )
}
