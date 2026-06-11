const TYPES = ['All', 'House', 'Apartment', 'Condo', 'Townhouse', 'Commercial']
const STATUSES = ['All', 'For Sale', 'For Rent', 'Sold']

export default function FilterBar({ filters, onChange, onReset }) {
  const set = (key) => (e) => onChange({ ...filters, [key]: e.target.value })

  const isDirty =
    filters.search !== '' ||
    filters.type !== 'All' ||
    filters.status !== 'All' ||
    filters.minPrice !== '' ||
    filters.maxPrice !== '' ||
    filters.sort !== 'newest'

  return (
    <section className="filterbar" aria-label="Search and filter listings">
      <div className="field field-grow">
        <label htmlFor="search">Search</label>
        <input
          id="search"
          type="search"
          placeholder="Title, address, or city…"
          value={filters.search}
          onChange={set('search')}
        />
      </div>

      <div className="field">
        <label htmlFor="type">Type</label>
        <select id="type" value={filters.type} onChange={set('type')}>
          {TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="status">Status</label>
        <select id="status" value={filters.status} onChange={set('status')}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="field field-price">
        <label htmlFor="minPrice">Min price ($)</label>
        <input
          id="minPrice"
          type="number"
          min="0"
          placeholder="0"
          value={filters.minPrice}
          onChange={set('minPrice')}
        />
      </div>

      <div className="field field-price">
        <label htmlFor="maxPrice">Max price ($)</label>
        <input
          id="maxPrice"
          type="number"
          min="0"
          placeholder="Any"
          value={filters.maxPrice}
          onChange={set('maxPrice')}
        />
      </div>

      <div className="field">
        <label htmlFor="sort">Sort by</label>
        <select id="sort" value={filters.sort} onChange={set('sort')}>
          <option value="newest">Newest first</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
        </select>
      </div>

      {isDirty && (
        <button className="btn btn-ghost filter-reset" onClick={onReset}>
          Reset
        </button>
      )}
    </section>
  )
}
