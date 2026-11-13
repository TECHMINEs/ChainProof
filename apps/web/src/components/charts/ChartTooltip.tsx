import type { TooltipProps } from 'recharts'

/** Shared tooltip for every Recharts chart. */
export default function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-black border border-line p-3 shadow-void text-sm">
      <p className="text-neutral-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-semibold" style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}
