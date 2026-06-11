import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import PropertyCard from './PropertyCard'

const base = {
    id: '1',
    title: 'Corktown Townhome',
    address: '2210 Bagley St',
    city: 'Detroit',
    state: 'MI',
    price: 339900,
    type: 'Townhouse',
    status: 'For Sale',
    beds: 3,
    baths: 2,
    sqft: 1680,
    image_url: 'https://example.com/photo.jpg',
    description: 'Modern townhome with rooftop deck.',
}

const renderCard = (overrides = {}, onSelect) =>
    render(
        <ul>
            <PropertyCard property={{ ...base, ...overrides }} onSelect={onSelect} />
        </ul>
    )

describe('PropertyCard', () => {
    it('renders title, address, formatted price, and status badge', () => {
        renderCard()
        expect(screen.getByText('Corktown Townhome')).toBeInTheDocument()
        expect(screen.getByText('2210 Bagley St, Detroit, MI')).toBeInTheDocument()
        expect(screen.getByText('$339,900')).toBeInTheDocument()
        expect(screen.getByText('For Sale')).toBeInTheDocument()
    })

    it('shows a monthly price suffix for rentals', () => {
        renderCard({ status: 'For Rent', price: 1850 })
        expect(screen.getByText('$1,850/mo')).toBeInTheDocument()
    })

    it('joins beds, baths, and sqft into a spec line', () => {
        renderCard()
        expect(screen.getByText('3 bd · 2 ba · 1,680 sqft')).toBeInTheDocument()
    })

    it('omits missing specs instead of rendering nulls (e.g. commercial)', () => {
        renderCard({ beds: null, baths: 2, sqft: 6800 })
        expect(screen.getByText('2 ba · 6,800 sqft')).toBeInTheDocument()
        expect(screen.queryByText(/null/)).not.toBeInTheDocument()
    })

    it('falls back to a placeholder when the image fails to load', () => {
        renderCard()
        const img = screen.getByRole('img', { name: /photo of corktown townhome/i })
        fireEvent.error(img)
        expect(screen.queryByRole('img')).not.toBeInTheDocument()
        expect(screen.getByText('Townhouse', { selector: '.card-media-fallback' })).toBeInTheDocument()
    })

    it('renders a placeholder when there is no image URL', () => {
        renderCard({ image_url: null })
        expect(screen.queryByRole('img')).not.toBeInTheDocument()
    })

    it('calls onSelect with the property when clicked', () => {
        const onSelect = vi.fn()
        renderCard({}, onSelect)
        fireEvent.click(screen.getByRole('button', { name: /view details for corktown townhome/i }))
        expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: '1', title: 'Corktown Townhome' }))
    })
})
