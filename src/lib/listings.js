// Pure functions for listing logic — no React, no Supabase.
// Keeping these separate makes them trivially unit-testable.

export const initialFilters = {
    search: '',
    type: 'All',
    status: 'All',
    minPrice: '',
    maxPrice: '',
    sort: 'newest',
}

/** Apply search + filters + sort to a list of properties. */
export function applyFilters(properties, filters) {
    const q = filters.search.trim().toLowerCase()
    const min = filters.minPrice === '' ? -Infinity : Number(filters.minPrice)
    const max = filters.maxPrice === '' ? Infinity : Number(filters.maxPrice)

    const list = properties.filter((p) => {
        const matchesSearch =
            !q ||
            [p.title, p.address, p.city, p.state]
                .filter(Boolean)
                .some((field) => field.toLowerCase().includes(q))
        const matchesType = filters.type === 'All' || p.type === filters.type
        const matchesStatus = filters.status === 'All' || p.status === filters.status
        const price = Number(p.price)
        return matchesSearch && matchesType && matchesStatus && price >= min && price <= max
    })

    switch (filters.sort) {
        case 'price-asc':
            return [...list].sort((a, b) => a.price - b.price)
        case 'price-desc':
            return [...list].sort((a, b) => b.price - a.price)
        default: // newest
            return [...list].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    }
}

/** Portfolio-level stats for the KPI cards. */
export function computeStats(list) {
    const forSale = list.filter((p) => p.status === 'For Sale')
    const forRent = list.filter((p) => p.status === 'For Rent')
    const sold = list.filter((p) => p.status === 'Sold')
    const avgSale = forSale.length
        ? forSale.reduce((sum, p) => sum + Number(p.price), 0) / forSale.length
        : null
    return {
        count: list.length,
        forSale: forSale.length,
        forRent: forRent.length,
        sold: sold.length,
        avgSale,
        cities: new Set(list.map((p) => p.city)).size,
    }
}

/** Count of listings grouped by a key, e.g. countBy(list, 'type'). */
export function countBy(list, key) {
    const counts = new Map()
    for (const item of list) {
        const k = item[key] ?? 'Unknown'
        counts.set(k, (counts.get(k) ?? 0) + 1)
    }
    return [...counts.entries()]
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count)
}

/** Average for-sale price grouped by city, highest first (top `limit`). */
export function avgSalePriceByCity(list, limit = 6) {
    const groups = new Map()
    for (const p of list) {
        if (p.status !== 'For Sale') continue
        const g = groups.get(p.city) ?? { total: 0, n: 0 }
        g.total += Number(p.price)
        g.n += 1
        groups.set(p.city, g)
    }
    return [...groups.entries()]
        .map(([city, { total, n }]) => ({ city, avg: total / n }))
        .sort((a, b) => b.avg - a.avg)
        .slice(0, limit)
}

/** $1,234,567 — or em dash when there's nothing to show. */
export function formatPrice(n) {
    return n == null ? '—' : `$${Math.round(n).toLocaleString('en-US')}`
}

/** Compact form for chart axis labels: $285K, $1.2M. */
export function formatPriceCompact(n) {
    if (n == null) return '—'
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
    if (n >= 1_000) return `$${Math.round(n / 1_000)}K`
    return `$${Math.round(n)}`
}
