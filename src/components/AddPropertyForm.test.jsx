import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AddPropertyForm from './AddPropertyForm'

function setup(onSubmit = vi.fn().mockResolvedValue({ ok: true })) {
    const onSuccess = vi.fn()
    const onClose = vi.fn()
    render(<AddPropertyForm onSubmit={onSubmit} onSuccess={onSuccess} onClose={onClose} />)
    return { onSubmit, onSuccess, onClose }
}

async function fillRequiredFields(user) {
    await user.type(screen.getByLabelText('Title'), 'Test Bungalow')
    await user.type(screen.getByLabelText('Street address'), '642 Vester Ave')
    await user.type(screen.getByLabelText('City'), 'Ferndale')
    await user.type(screen.getByLabelText('State'), 'mi')
    await user.type(screen.getByLabelText('Price ($)'), '248000')
}

describe('AddPropertyForm', () => {
    it('shows validation errors and does not submit when required fields are empty', async () => {
        const user = userEvent.setup()
        const { onSubmit } = setup()

        await user.click(screen.getByRole('button', { name: 'Save property' }))

        expect(screen.getByText('Title is required')).toBeInTheDocument()
        expect(screen.getByText('Address is required')).toBeInTheDocument()
        expect(screen.getByText('City is required')).toBeInTheDocument()
        expect(screen.getByText('State is required')).toBeInTheDocument()
        expect(screen.getByText('Enter a price of 0 or more')).toBeInTheDocument()
        expect(onSubmit).not.toHaveBeenCalled()
    })

    it('submits a typed payload: numbers coerced, state uppercased, blanks as null', async () => {
        const user = userEvent.setup()
        const { onSubmit, onSuccess } = setup()

        await fillRequiredFields(user)
        await user.type(screen.getByLabelText('Beds'), '3')
        await user.click(screen.getByRole('button', { name: 'Save property' }))

        expect(onSubmit).toHaveBeenCalledWith({
            title: 'Test Bungalow',
            address: '642 Vester Ave',
            city: 'Ferndale',
            state: 'MI',          // uppercased
            price: 248000,        // number, not string
            type: 'House',
            status: 'For Sale',
            beds: 3,
            baths: null,          // blank optional -> null
            sqft: null,
            image_url: null,
            description: null,
        })
        expect(onSuccess).toHaveBeenCalledWith('Test Bungalow')
    })

    it('rejects negative numeric inputs', async () => {
        const user = userEvent.setup()
        const { onSubmit } = setup()

        await fillRequiredFields(user)
        await user.type(screen.getByLabelText('Beds'), '-2')
        await user.click(screen.getByRole('button', { name: 'Save property' }))

        expect(screen.getByText(/beds can.t be negative/i)).toBeInTheDocument()
        expect(onSubmit).not.toHaveBeenCalled()
    })

    it('surfaces a server error and keeps the form open', async () => {
        const user = userEvent.setup()
        const failing = vi.fn().mockResolvedValue({ ok: false, message: 'row violates policy' })
        const { onSuccess } = setup(failing)

        await fillRequiredFields(user)
        await user.click(screen.getByRole('button', { name: 'Save property' }))

        expect(await screen.findByText('row violates policy')).toBeInTheDocument()
        expect(onSuccess).not.toHaveBeenCalled()
    })

    it('closes on Escape', async () => {
        const user = userEvent.setup()
        const { onClose } = setup()
        await user.keyboard('{Escape}')
        expect(onClose).toHaveBeenCalled()
    })
})
