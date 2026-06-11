import { describe, it, expect } from 'vitest'
import {
    applyFilters,
    computeStats,
    countBy,
    avgSalePriceByCity,
    formatPrice,
    formatPriceCompact,
    initialFilters,
} from './listings'

/** Minimal property factory for readable tests. */
const prop = (overrides = {}) => ({
    id: Math.random().toString(36).slice(2),
    created_at: '2026-01-01T00:00:00Z',
    title: 'Test Home',
    address: '1 Main St',
    city: 'Detroit',
    state: 'MI',
    price: 100000,
    type: 'House',
    status: 'For Sale',
    ...overrides,
})

describe('applyFilters — search', () => {
    const data = [
        prop({ title: 'Corktown Townhome', city: 'Detroit' }),
        prop({ title: 'Garden Apartment', city: 'Royal Oak' }),
    ]

    it('matches by title, case-insensitively', () => {
        const result = applyFilters(data, { ...initialFilters, search: 'corktown' })
        expect(result).toHaveLength(1)
        expect(result[0].title).toBe('Corktown Townhome')
    })

    it('matches by city', () => {
        const result = applyFilters(data, { ...initialFilters, search: 'royal' })
        expect(result).toHaveLength(1)
        expect(result[0].city).toBe('Royal Oak')
    })

    it('returns everything for an empty search', () => {
        expect(applyFilters(data, initialFilters)).toHaveLength(2)
    })

    it('returns empty array when nothing matches', () => {
        expect(applyFilters(data, { ...initialFilters, search: 'zzz' })).toHaveLength(0)
    })
})

describe('applyFilters — type, status, and price range', () => {
    const data = [
        prop({ type: 'House', status: 'For Sale', price: 300000 }),
        prop({ type: 'Apartment', status: 'For Rent', price: 1500 }),
        prop({ type: 'Condo', status: 'Sold', price: 250000 }),
    ]

    it('filters by type', () => {
        const result = applyFilters(data, { ...initialFilters, type: 'Apartment' })
        expect(result).toHaveLength(1)
        expect(result[0].type).toBe('Apartment')
    })

    it('filters by status', () => {
        const result = applyFilters(data, { ...initialFilters, status: 'Sold' })
        expect(result).toHaveLength(1)
        expect(result[0].status).toBe('Sold')
    })

    it('applies min and max price bounds inclusively', () => {
        const result = applyFilters(data, { ...initialFilters, minPrice: '250000', maxPrice: '300000' })
        expect(result.map((p) => p.price).sort((a, b) => a - b)).toEqual([250000, 300000])
    })

    it('combines filters with AND semantics', () => {
        const result = applyFilters(data, { ...initialFilters, type: 'House', status: 'For Rent' })
        expect(result).toHaveLength(0)
    })
})

describe('applyFilters — sorting', () => {
    const data = [
        prop({ title: 'Mid', price: 200, created_at: '2026-01-02T00:00:00Z' }),
        prop({ title: 'Low', price: 100, created_at: '2026-01-03T00:00:00Z' }),
        prop({ title: 'High', price: 300, created_at: '2026-01-01T00:00:00Z' }),
    ]

    it('sorts newest first by default', () => {
        const result = applyFilters(data, initialFilters)
        expect(result.map((p) => p.title)).toEqual(['Low', 'Mid', 'High'])
    })

    it('sorts price ascending', () => {
        const result = applyFilters(data, { ...initialFilters, sort: 'price-asc' })
        expect(result.map((p) => p.price)).toEqual([100, 200, 300])
    })

    it('sorts price descending', () => {
        const result = applyFilters(data, { ...initialFilters, sort: 'price-desc' })
        expect(result.map((p) => p.price)).toEqual([300, 200, 100])
    })

    it('does not mutate the input array', () => {
        const before = data.map((p) => p.title)
        applyFilters(data, { ...initialFilters, sort: 'price-asc' })
        expect(data.map((p) => p.title)).toEqual(before)
    })
})

describe('computeStats', () => {
    it('counts statuses and averages only for-sale prices', () => {
        const stats = computeStats([
            prop({ status: 'For Sale', price: 100000, city: 'Detroit' }),
            prop({ status: 'For Sale', price: 300000, city: 'Ferndale' }),
            prop({ status: 'For Rent', price: 1500, city: 'Detroit' }),
            prop({ status: 'Sold', price: 999999, city: 'Detroit' }),
        ])
        expect(stats.count).toBe(4)
        expect(stats.forSale).toBe(2)
        expect(stats.forRent).toBe(1)
        expect(stats.sold).toBe(1)
        expect(stats.avgSale).toBe(200000) // rent + sold excluded
        expect(stats.cities).toBe(2)
    })

    it('returns null average when there are no for-sale listings', () => {
        const stats = computeStats([prop({ status: 'For Rent' })])
        expect(stats.avgSale).toBeNull()
    })

    it('handles an empty list', () => {
        const stats = computeStats([])
        expect(stats.count).toBe(0)
        expect(stats.avgSale).toBeNull()
        expect(stats.cities).toBe(0)
    })
})

describe('chart aggregations', () => {
    it('countBy groups and sorts descending', () => {
        const result = countBy(
            [prop({ type: 'House' }), prop({ type: 'House' }), prop({ type: 'Condo' })],
            'type'
        )
        expect(result).toEqual([
            { label: 'House', count: 2 },
            { label: 'Condo', count: 1 },
        ])
    })

    it('avgSalePriceByCity averages per city, ignores rentals, sorts by price', () => {
        const result = avgSalePriceByCity([
            prop({ city: 'Detroit', status: 'For Sale', price: 100000 }),
            prop({ city: 'Detroit', status: 'For Sale', price: 200000 }),
            prop({ city: 'Ann Arbor', status: 'For Sale', price: 400000 }),
            prop({ city: 'Detroit', status: 'For Rent', price: 1500 }),
        ])
        expect(result).toEqual([
            { city: 'Ann Arbor', avg: 400000 },
            { city: 'Detroit', avg: 150000 },
        ])
    })
})

describe('price formatting', () => {
    it('formats with separators and handles null', () => {
        expect(formatPrice(339900)).toBe('$339,900')
        expect(formatPrice(null)).toBe('—')
    })

    it('formats compact values for chart labels', () => {
        expect(formatPriceCompact(285000)).toBe('$285K')
        expect(formatPriceCompact(1200000)).toBe('$1.2M')
        expect(formatPriceCompact(950)).toBe('$950')
    })
})
