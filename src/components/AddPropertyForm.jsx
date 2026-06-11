import { useEffect, useRef, useState } from 'react'

const TYPES = ['House', 'Apartment', 'Condo', 'Townhouse', 'Commercial']
const STATUSES = ['For Sale', 'For Rent', 'Sold']

const empty = {
  title: '',
  address: '',
  city: '',
  state: '',
  price: '',
  type: 'House',
  status: 'For Sale',
  beds: '',
  baths: '',
  sqft: '',
  image_url: '',
  description: '',
}

export default function AddPropertyForm({ initial = null, onSubmit, onSuccess, onClose }) {
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState(null)
  const firstFieldRef = useRef(null)

  // Focus the first field on open; close on Escape.
  useEffect(() => {
    firstFieldRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // If editing, populate form from initial data
  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title ?? '',
        address: initial.address ?? '',
        city: initial.city ?? '',
        state: initial.state ?? '',
        price: initial.price ?? '',
        type: initial.type ?? 'House',
        status: initial.status ?? 'For Sale',
        beds: initial.beds ?? '',
        baths: initial.baths ?? '',
        sqft: initial.sqft ?? '',
        image_url: initial.image_url ?? '',
        description: initial.description ?? '',
      })
    } else {
      setForm(empty)
    }
  }, [initial])

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  function validate() {
    const next = {}
    if (!form.title.trim()) next.title = 'Title is required'
    if (!form.address.trim()) next.address = 'Address is required'
    if (!form.city.trim()) next.city = 'City is required'
    if (!form.state.trim()) next.state = 'State is required'
    if (form.price === '' || Number(form.price) < 0) next.price = 'Enter a price of 0 or more'
    if (form.beds !== '' && Number(form.beds) < 0) next.beds = 'Beds can\u2019t be negative'
    if (form.baths !== '' && Number(form.baths) < 0) next.baths = 'Baths can\u2019t be negative'
    if (form.sqft !== '' && Number(form.sqft) <= 0) next.sqft = 'Square feet must be positive'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit() {
    setServerError(null)
    if (!validate()) return
    setSubmitting(true)

    const payload = {
      title: form.title.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      state: form.state.trim().toUpperCase(),
      price: Number(form.price),
      type: form.type,
      status: form.status,
      beds: form.beds === '' ? null : Number(form.beds),
      baths: form.baths === '' ? null : Number(form.baths),
      sqft: form.sqft === '' ? null : Number(form.sqft),
      image_url: form.image_url.trim() || null,
      description: form.description.trim() || null,
    }

    const result = await onSubmit(payload, initial?.id)
    setSubmitting(false)
    if (result.ok) {
      onSuccess(payload.title)
    } else {
      setServerError(result.message ?? 'Something went wrong. Try again.')
    }
  }

  const field = (key, label, props = {}) => (
    <div className={`field ${errors[key] ? 'field-invalid' : ''}`}>
      <label htmlFor={`f-${key}`}>{label}</label>
      <input id={`f-${key}`} value={form[key]} onChange={set(key)} {...props} />
      {errors[key] && <span className="field-error">{errors[key]}</span>}
    </div>
  )

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="add-title">
        <div className="modal-head">
          <h2 id="add-title">{initial ? 'Edit property' : 'Add a property'}</h2>
          <button className="btn btn-ghost" onClick={onClose} aria-label="Close form">
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="form-row">
            <div className={`field field-grow ${errors.title ? 'field-invalid' : ''}`}>
              <label htmlFor="f-title">Title</label>
              <input
                id="f-title"
                ref={firstFieldRef}
                value={form.title}
                onChange={set('title')}
                placeholder="e.g. Corktown Townhome"
              />
              {errors.title && <span className="field-error">{errors.title}</span>}
            </div>
          </div>

          <div className="form-row">
            {field('address', 'Street address', { placeholder: '2210 Bagley St' })}
            {field('city', 'City', { placeholder: 'Detroit' })}
            {field('state', 'State', { placeholder: 'MI', maxLength: 2 })}
          </div>

          <div className="form-row">
            {field('price', 'Price ($)', { type: 'number', min: 0, placeholder: '339900' })}
            <div className="field">
              <label htmlFor="f-type">Type</label>
              <select id="f-type" value={form.type} onChange={set('type')}>
                {TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="f-status">Status</label>
              <select id="f-status" value={form.status} onChange={set('status')}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            {field('beds', 'Beds', { type: 'number', min: 0 })}
            {field('baths', 'Baths', { type: 'number', min: 0, step: 0.5 })}
            {field('sqft', 'Square feet', { type: 'number', min: 1 })}
          </div>

          <div className="form-row">
            <div className="field field-grow">
              <label htmlFor="f-image">Image URL (optional)</label>
              <input
                id="f-image"
                type="url"
                value={form.image_url}
                onChange={set('image_url')}
                placeholder="https://…"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="field field-grow">
              <label htmlFor="f-desc">Description (optional)</label>
              <textarea
                id="f-desc"
                rows={3}
                value={form.description}
                onChange={set('description')}
                placeholder="What makes this property stand out?"
              />
            </div>
          </div>

          {serverError && <p className="state-msg state-error">{serverError}</p>}
        </div>

        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Saving…' : (initial ? 'Save changes' : 'Save property')}
          </button>
        </div>
      </div>
    </div>
  )
}
