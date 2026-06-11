import { useEffect, useState } from 'react'
import { formatPrice } from '../lib/listings'

const statusClass = {
    'For Sale': 'pill pill-sale',
    'For Rent': 'pill pill-rent',
    Sold: 'pill pill-sold',
}

export default function PropertyDetail({ property: p, onClose, onEdit, onDelete }) {
    const [imgFailed, setImgFailed] = useState(false)

    // Lock the page behind the modal so only the modal scrolls.
    useEffect(() => {
        const prev = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = prev }
    }, [])

    useEffect(() => {
        const onKey = (e) => e.key === 'Escape' && onClose()
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [onClose])

    const price = p.status === 'For Rent'
        ? `${formatPrice(p.price)}/mo`
        : formatPrice(p.price)

    const listed = p.created_at
        ? new Date(p.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : null

    const facts = [
        { label: 'Type', value: p.type },
        { label: 'Beds', value: p.beds ?? '—' },
        { label: 'Baths', value: p.baths ?? '—' },
        { label: 'Sqft', value: p.sqft != null ? Number(p.sqft).toLocaleString('en-US') : '—' },
    ]

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal modal-detail" role="dialog" aria-modal="true" aria-labelledby="detail-title">
                <div className="detail-media">
                    {p.image_url && !imgFailed ? (
                        <img src={p.image_url} alt={`Photo of ${p.title}`} onError={() => setImgFailed(true)} />
                    ) : (
                        <div className="card-media-fallback">{p.type}</div>
                    )}
                    <button className="detail-close" onClick={onClose} aria-label="Close details">✕</button>
                    <span className={statusClass[p.status] ?? 'pill'}>{p.status}</span>
                </div>

                <div className="detail-body">
                    <p className="detail-price">{price}</p>
                    <h2 id="detail-title" className="detail-title">{p.title}</h2>
                    <p className="detail-address">{p.address}, {p.city}, {p.state}</p>

                    <dl className="detail-facts">
                        {facts.map((f) => (
                            <div className="detail-fact" key={f.label}>
                                <dt>{f.label}</dt>
                                <dd>{f.value}</dd>
                            </div>
                        ))}
                    </dl>

                    {p.description && <p className="detail-desc">{p.description}</p>}
                    <div className="detail-actions">
                        {onEdit && (
                            <button type="button" className="btn btn-ghost btn-small" onClick={() => onEdit(p)}>
                                Edit
                            </button>
                        )}
                        {onDelete && (
                            <button type="button" className="btn btn-ghost btn-small btn-danger" onClick={() => onDelete(p)}>
                                Delete
                            </button>
                        )}
                    </div>
                    {listed && <p className="detail-listed">Listed {listed}</p>}
                </div>
            </div>
        </div>
    )
}
