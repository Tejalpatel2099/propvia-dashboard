import { useEffect, useMemo, useState } from 'react'
import { supabase, isSupabaseConfigured } from './supabaseClient'
import { demoProperties } from './demoData'
import { initialFilters, applyFilters, computeStats, formatPrice } from './lib/listings'
import Sidebar from './components/Sidebar.jsx'
import FilterBar from './components/FilterBar.jsx'
import PropertyCard from './components/PropertyCard.jsx'
import PropertyTable from './components/PropertyTable.jsx'
import PropertyDetail from './components/PropertyDetail.jsx'
import AddPropertyForm from './components/AddPropertyForm.jsx'
import { TypeChart, CityPriceChart } from './components/Charts.jsx'

export default function App() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState(initialFilters)
  const [view, setView] = useState('grid') // 'grid' | 'table'
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [selected, setSelected] = useState(null)
  const [toast, setToast] = useState(null)
  const [activeNav, setActiveNav] = useState('#overview')

  // ---- Data loading -------------------------------------------------------
  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      if (!isSupabaseConfigured) {
        // Local preview mode: no env vars yet, use bundled demo data.
        setProperties(demoProperties)
        setLoading(false)
        return
      }
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) setError(error.message)
      else setProperties(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  // ---- Add a property -----------------------------------------------------
  async function handleAdd(newProperty) {
    if (!isSupabaseConfigured) {
      const local = { id: `demo-${Date.now()}`, created_at: new Date().toISOString(), ...newProperty }
      setProperties((prev) => [local, ...prev])
      return { ok: true }
    }
    const { data, error } = await supabase
      .from('properties')
      .insert(newProperty)
      .select()
      .single()
    if (error) return { ok: false, message: error.message }
    setProperties((prev) => [data, ...prev])
    return { ok: true }
  }

  // ---- Edit a property ----------------------------------------------------
  async function handleEdit(id, updates) {
    if (!isSupabaseConfigured) {
      setProperties((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)))
      return { ok: true }
    }
    const { data, error } = await supabase
      .from('properties')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) return { ok: false, message: error.message }
    setProperties((prev) => prev.map((p) => (p.id === id ? data : p)))
    return { ok: true }
  }

  function onEdited(title) {
    setShowForm(false)
    setEditing(null)
    setToast(`"${title}" was updated`)
    window.setTimeout(() => setToast(null), 3500)
  }

  // ---- Delete a property --------------------------------------------------
  async function handleDelete(id) {
    const confirmDelete = window.confirm('Are you sure you want to delete the listing?')
    if (!confirmDelete) return { ok: false }
    if (!isSupabaseConfigured) {
      setProperties((prev) => prev.filter((p) => p.id !== id))
      setSelected((s) => (s && s.id === id ? null : s))
      setToast('Listing deleted')
      window.setTimeout(() => setToast(null), 3500)
      return { ok: true }
    }
    const { error } = await supabase.from('properties').delete().eq('id', id)
    if (error) return { ok: false, message: error.message }
    setProperties((prev) => prev.filter((p) => p.id !== id))
    setSelected((s) => (s && s.id === id ? null : s))
    setToast('Listing deleted')
    window.setTimeout(() => setToast(null), 3500)
    return { ok: true }
  }

  function onAdded(title) {
    setShowForm(false)
    setToast(`"${title}" was added to listings`)
    window.setTimeout(() => setToast(null), 3500)
  }

  // ---- Derived state ------------------------------------------------------
  const visible = useMemo(() => applyFilters(properties, filters), [properties, filters])
  const portfolio = useMemo(() => computeStats(properties), [properties])

  const kpis = [
    { label: 'Total listings', value: portfolio.count, hint: `across ${portfolio.cities} cities` },
    { label: 'For sale', value: portfolio.forSale, hint: 'active sale listings' },
    { label: 'For rent', value: portfolio.forRent, hint: 'active rentals' },
    { label: 'Avg. sale price', value: formatPrice(portfolio.avgSale), hint: 'for-sale listings' },
  ]

  return (
    <div className="layout">
      <Sidebar active={activeNav} onNavigate={setActiveNav} />

      <div className="main">
        <header className="main-head" id="overview">
          <div>
            <h1>Overview</h1>
            <p className="main-sub">Live inventory, market analytics, and listing management.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <span aria-hidden="true">+</span> Add property
          </button>
        </header>

        {!isSupabaseConfigured && (
          <p className="notice" role="status">
            Running on bundled demo data — add Supabase credentials in <code>.env</code> to connect the live database.
          </p>
        )}

        {/* ---- KPI cards ---- */}
        <section className="kpis" aria-label="Portfolio statistics">
          {kpis.map((k) => (
            <article className="kpi" key={k.label}>
              <h2 className="kpi-label">{k.label}</h2>
              <p className="kpi-value">{loading ? '…' : k.value}</p>
              <p className="kpi-hint">{k.hint}</p>
            </article>
          ))}
        </section>

        {/* ---- Charts ---- */}
        <section className="charts" id="analytics" aria-label="Analytics">
          <article className="panel">
            <header className="panel-head">
              <h2>Listings by type</h2>
              <span className="panel-tag">current results</span>
            </header>
            <TypeChart properties={visible} />
          </article>
          <article className="panel">
            <header className="panel-head">
              <h2>Avg. sale price by city</h2>
              <span className="panel-tag">current results</span>
            </header>
            <CityPriceChart properties={visible} />
          </article>
        </section>

        {/* ---- Listings ---- */}
        <section id="listings" aria-label="Listings">
          <FilterBar
            filters={filters}
            onChange={setFilters}
            onReset={() => setFilters(initialFilters)}
          />

          <div className="listings-toolbar">
            <p className="result-count" aria-live="polite">
              {loading ? 'Loading…' : `${visible.length} ${visible.length === 1 ? 'listing' : 'listings'}`}
            </p>
            <div className="view-toggle" role="group" aria-label="Switch between grid and table view">
              <button
                className={`toggle-btn ${view === 'grid' ? 'toggle-btn-active' : ''}`}
                onClick={() => setView('grid')}
                aria-pressed={view === 'grid'}
              >
                Grid
              </button>
              <button
                className={`toggle-btn ${view === 'table' ? 'toggle-btn-active' : ''}`}
                onClick={() => setView('table')}
                aria-pressed={view === 'table'}
              >
                Table
              </button>
            </div>
          </div>

          {loading && (
            <ul className="grid" aria-hidden="true">
              {Array.from({ length: 6 }).map((_, i) => (
                <li className="card card-skeleton" key={i}>
                  <div className="sk sk-media" />
                  <div className="card-body">
                    <div className="sk sk-line sk-w60" />
                    <div className="sk sk-line sk-w80" />
                    <div className="sk sk-line sk-w40" />
                  </div>
                </li>
              ))}
            </ul>
          )}

          {error && (
            <p className="state-msg state-error">
              Couldn't load listings: {error}. Check your Supabase URL and key, then refresh.
            </p>
          )}

          {!loading && !error && visible.length === 0 && (
            <div className="state-msg">
              <p>No properties match these filters.</p>
              <button className="btn btn-ghost" onClick={() => setFilters(initialFilters)}>
                Clear all filters
              </button>
            </div>
          )}

          {!loading && !error && visible.length > 0 && (
            view === 'grid' ? (
              <ul className="grid">
                {visible.map((p) => (
                  <PropertyCard
                    key={p.id}
                    property={p}
                    onSelect={setSelected}
                    onEdit={(prop) => { setEditing(prop); setShowForm(true) }}
                    onDelete={(prop) => handleDelete(prop.id)}
                  />
                ))}
              </ul>
            ) : (
              <PropertyTable
                properties={visible}
                onSelect={setSelected}
                onEdit={(prop) => { setEditing(prop); setShowForm(true) }}
                onDelete={(prop) => handleDelete(prop.id)}
              />
            )
          )}
        </section>

        {selected && (
          <PropertyDetail
            property={selected}
            onClose={() => setSelected(null)}
            onEdit={(prop) => { setEditing(prop); setShowForm(true); setSelected(null) }}
            onDelete={(prop) => handleDelete(prop.id)}
          />
        )}

        {showForm && (
          <AddPropertyForm
            initial={editing}
            onSubmit={async (payload, id) => {
              if (id) return handleEdit(id, payload)
              return handleAdd(payload)
            }}
            onSuccess={(title) => (editing ? onEdited(title) : onAdded(title))}
            onClose={() => { setShowForm(false); setEditing(null) }}
          />
        )}

        {toast && <div className="toast" role="status">{toast}</div>}

        <footer className="footer">
          Propvia 2026
        </footer>
      </div>
    </div>
  )
}
