import { formatPrice } from '../lib/listings'

const badgeClass = {
    'For Sale': 'pill pill-sale',
    'For Rent': 'pill pill-rent',
    Sold: 'pill pill-sold',
}

export default function PropertyTable({ properties, onSelect, onEdit, onDelete }) {
    return (
        <div className="table-wrap">
            <table className="listing-table">
                <thead>
                    <tr>
                        <th scope="col">Property</th>
                        <th scope="col">City</th>
                        <th scope="col">Type</th>
                        <th scope="col">Status</th>
                        <th scope="col" className="num">Beds</th>
                        <th scope="col" className="num">Baths</th>
                        <th scope="col" className="num">Sqft</th>
                        <th scope="col" className="num">Price</th>
                        <th scope="col">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {properties.map((p) => (
                        <tr key={p.id}>
                            <td>
                                <button
                                    type="button"
                                    className="table-link"
                                    onClick={() => onSelect?.(p)}
                                >
                                    {p.title}
                                </button>
                                <span className="table-addr">{p.address}</span>
                            </td>
                            <td>{p.city}, {p.state}</td>
                            <td>{p.type}</td>
                            <td><span className={badgeClass[p.status] ?? 'pill'}>{p.status}</span></td>
                            <td className="num">{p.beds ?? '—'}</td>
                            <td className="num">{p.baths ?? '—'}</td>
                            <td className="num">{p.sqft != null ? Number(p.sqft).toLocaleString('en-US') : '—'}</td>
                            <td className="num table-price">
                                {formatPrice(p.price)}{p.status === 'For Rent' ? '/mo' : ''}
                            </td>
                            <td>
                                <div className="table-actions">
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
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
