import type { TooltipProps } from 'recharts'

/** Shared Sharp Edged Plasma tooltip for every Recharts chart. */
export default function PlasmaTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-black border border-red-900/60 p-3 shadow-void text-sm">
      <p className="text-neutral-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-semibold" style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}
