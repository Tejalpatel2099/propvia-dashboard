import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

// Without VITE_SUPABASE_* env vars (the test environment), the app runs in
// demo-data mode, which lets us integration-test the real UI flows offline.

describe('App (demo-data mode)', () => {
    it('renders the dashboard with all 12 seeded listings', async () => {
        render(<App />)
        expect(await screen.findByText('12 listings')).toBeInTheDocument()
        expect(screen.getByText('Corktown Townhome')).toBeInTheDocument()
        expect(screen.getByRole('status')).toHaveTextContent(/demo data/i)
    })

    it('search narrows the listings and updates the result count', async () => {
        const user = userEvent.setup()
        render(<App />)
        await screen.findByText('12 listings')

        await user.type(screen.getByLabelText('Search'), 'Ann Arbor')

        expect(screen.getByText('1 listing')).toBeInTheDocument()
        expect(screen.getByText('Ann Arbor Townhouse near Campus')).toBeInTheDocument()
        expect(screen.queryByText('Corktown Townhome')).not.toBeInTheDocument()
    })

    it('shows an empty state with a working clear-filters action', async () => {
        const user = userEvent.setup()
        render(<App />)
        await screen.findByText('12 listings')

        await user.type(screen.getByLabelText('Search'), 'no-such-place')
        expect(screen.getByText('No properties match these filters.')).toBeInTheDocument()

        await user.click(screen.getByRole('button', { name: 'Clear all filters' }))
        expect(screen.getByText('12 listings')).toBeInTheDocument()
    })

    it('status filter works end to end', async () => {
        const user = userEvent.setup()
        render(<App />)
        await screen.findByText('12 listings')

        await user.selectOptions(screen.getByLabelText('Status'), 'For Rent')

        expect(screen.getByText('4 listings')).toBeInTheDocument()
        expect(screen.getByText('West Village Carriage Loft')).toBeInTheDocument()
    })

    it('toggles between grid and table views', async () => {
        const user = userEvent.setup()
        render(<App />)
        await screen.findByText('12 listings')

        await user.click(screen.getByRole('button', { name: 'Table' }))
        const table = screen.getByRole('table')
        expect(within(table).getByText('Corktown Townhome')).toBeInTheDocument()

        await user.click(screen.getByRole('button', { name: 'Grid' }))
        expect(screen.queryByRole('table')).not.toBeInTheDocument()
    })

    it('adding a property prepends it to the list and shows a toast', async () => {
        const user = userEvent.setup()
        render(<App />)
        await screen.findByText('12 listings')

        await user.click(screen.getByRole('button', { name: /add property/i }))
        await user.type(screen.getByLabelText('Title'), 'Queen Anne Craftsman')
        await user.type(screen.getByLabelText('Street address'), '12 Boston St')
        await user.type(screen.getByLabelText('City'), 'Seattle')
        await user.type(screen.getByLabelText('State'), 'WA')
        await user.type(screen.getByLabelText('Price ($)'), '725000')
        await user.click(screen.getByRole('button', { name: 'Save property' }))

        expect(await screen.findByText('13 listings')).toBeInTheDocument()
        expect(screen.getByText('Queen Anne Craftsman')).toBeInTheDocument()
        expect(screen.getByText('"Queen Anne Craftsman" was added to listings')).toBeInTheDocument()
    })

    it('opens a detail view when a card is clicked and closes it', async () => {
        const user = userEvent.setup()
        render(<App />)
        await screen.findByText('12 listings')

        await user.click(screen.getByRole('button', { name: /view details for corktown townhome/i }))

        const dialog = screen.getByRole('dialog')
        expect(within(dialog).getByText('Corktown Townhome')).toBeInTheDocument()
        expect(within(dialog).getByText(/rooftop deck/i)).toBeInTheDocument()

        await user.click(screen.getByRole('button', { name: 'Close details' }))
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
})
