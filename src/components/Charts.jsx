import { countBy, avgSalePriceByCity, formatPriceCompact } from '../lib/listings'

/** Vertical bar chart: listing count by property type. Pure SVG, no deps. */
export function TypeChart({ properties }) {
    const data = countBy(properties, 'type')
    if (data.length === 0) return <p className="chart-empty">No data for current filters.</p>

    const max = Math.max(...data.map((d) => d.count))
    const W = 420, H = 180, pad = { t: 14, b: 36, l: 8, r: 8 }
    const innerW = W - pad.l - pad.r
    const innerH = H - pad.t - pad.b
    const band = innerW / data.length
    const barW = Math.min(52, band * 0.6)

    return (
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Listings by property type" className="chart-svg">
            {data.map((d, i) => {
                const h = (d.count / max) * innerH
                const x = pad.l + band * i + (band - barW) / 2
                const y = pad.t + innerH - h
                return (
                    <g key={d.label}>
                        <rect x={x} y={y} width={barW} height={h} rx="5" className="chart-bar" />
                        <text x={x + barW / 2} y={y - 5} textAnchor="middle" className="chart-value">
                            {d.count}
                        </text>
                        <text x={x + barW / 2} y={H - 14} textAnchor="middle" className="chart-label">
                            {d.label}
                        </text>
                    </g>
                )
            })}
        </svg>
    )
}

/** Horizontal bar chart: average for-sale price by city. */
export function CityPriceChart({ properties }) {
    const data = avgSalePriceByCity(properties)
    if (data.length === 0) return <p className="chart-empty">No for-sale listings in current filters.</p>

    const max = Math.max(...data.map((d) => d.avg))
    return (
        <div className="hbar-chart" role="img" aria-label="Average sale price by city">
            {data.map((d) => (
                <div key={d.city} className="hbar-row">
                    <span className="hbar-city">{d.city}</span>
                    <div className="hbar-track">
                        <div className="hbar-fill" style={{ width: `${(d.avg / max) * 100}%` }} />
                    </div>
                    <span className="hbar-value">{formatPriceCompact(d.avg)}</span>
                </div>
            ))}
        </div>
    )
}
