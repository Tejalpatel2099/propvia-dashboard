import { useState } from 'react'

const statusClass = {
  'For Sale': 'badge badge-sale',
  'For Rent': 'badge badge-rent',
  Sold: 'badge badge-sold',
}

export default function PropertyCard({ property: p, onSelect, onEdit, onDelete }) {
  const [imgFailed, setImgFailed] = useState(false)

  const price =
    p.status === 'For Rent'
      ? `$${Number(p.price).toLocaleString('en-US')}/mo`
      : `$${Number(p.price).toLocaleString('en-US')}`

  const specs = [
    p.beds != null && `${p.beds} bd`,
    p.baths != null && `${p.baths} ba`,
    p.sqft != null && `${Number(p.sqft).toLocaleString('en-US')} sqft`,
  ].filter(Boolean)

  return (
    <li className="card">
      <button
        type="button"
        className="card-hit"
        onClick={() => onSelect?.(p)}
        aria-label={`View details for ${p.title}`}
      >
        <div className="card-media">
          {p.image_url && !imgFailed ? (
            <img
              src={p.image_url}
              alt={`Photo of ${p.title}`}
              loading="lazy"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div className="card-media-fallback" aria-hidden="true">
              {p.type}
            </div>
          )}
          <span className={statusClass[p.status] ?? 'badge'}>{p.status}</span>
        </div>

        <div className="card-body">
          <div className="card-priceline">
            <span className="card-price">{price}</span>
            <span className="card-type">{p.type}</span>
          </div>
          <h2 className="card-title">{p.title}</h2>
          <p className="card-address">
            {p.address}, {p.city}, {p.state}
          </p>
          {specs.length > 0 && <p className="card-specs">{specs.join(' · ')}</p>}
          {p.description && <p className="card-desc">{p.description}</p>}
        </div>
      </button>
      <div className="card-actions card-actions-below">
        {onEdit && (
          <button
            type="button"
            className="btn btn-ghost btn-small"
            onClick={() => onEdit(p)}
          >
            Edit
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            className="btn btn-ghost btn-small btn-danger"
            onClick={() => onDelete(p)}
          >
            Delete
          </button>
        )}
      </div>
    </li>
  )
}
