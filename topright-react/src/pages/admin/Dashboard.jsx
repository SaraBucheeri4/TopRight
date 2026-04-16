import { useEffect, useState, useRef } from 'react'
import styles from './Dashboard.module.css'
import {
  fetchAllPortfolioItems,
  createPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
  updatePortfolioOrder,
  uploadPortfolioImage,
  getPublicUrl,
} from '../../services/portfolioService'
import { fetchContactSubmissions, deleteContactSubmission } from '../../services/contactService'
import { fetchSiteText, updateSiteTextRow } from '../../services/siteTextService'
import { fetchDashboardCounts } from '../../services/dashboardService'
import { signOut } from '../../services/authService'
import { PORTFOLIO_CATEGORIES } from '../../config/constants'

const CATEGORIES = PORTFOLIO_CATEGORIES

const EMPTY_ITEM = {
  slug: '', category: 'newsletter', label_en: '', label_ar: '',
  title: '', subtitle_en: '', subtitle_ar: '', year: '',
  image_url: '', display_order: 0, is_published: true,
}

function catClass(cat) {
  const map = {
    hse: styles.catHse,
    storybooks: styles.catStorybooks,
    corporate: styles.catCorporate,
    illustration: styles.catIllustration,
    animation: styles.catAnimation,
    newsletter: styles.catNewsletter,
  }
  return map[cat] ?? ''
}

/* ── Portfolio Manager ── */
function PortfolioManager({ onNav }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editItem, setEditItem] = useState(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const [search, setSearch] = useState('')
  const dragIdx = useRef(null)
  const fileRef = useRef(null)

  async function load() {
    setLoading(true)
    const data = await fetchAllPortfolioItems()
    setItems(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function togglePublish(item) {
    const updated = !item.is_published
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_published: updated } : i))
    await updatePortfolioItem(item.id, { is_published: updated })
  }

  function onDragStart(idx) { dragIdx.current = idx }
  function onDragOver(e, idx) {
    e.preventDefault()
    if (dragIdx.current === idx) return
    setItems(prev => {
      const next = [...prev]
      const [moved] = next.splice(dragIdx.current, 1)
      next.splice(idx, 0, moved)
      dragIdx.current = idx
      return next
    })
  }
  async function onDrop() {
    dragIdx.current = null
    await updatePortfolioOrder(items)
  }

  function openEdit(item) { setEditItem({ ...item }); setIsNew(false); setFormErrors({}); setUploadError(null) }
  function openNew() { setEditItem({ ...EMPTY_ITEM, display_order: items.length }); setIsNew(true); setFormErrors({}); setUploadError(null) }
  function closeEdit() { setEditItem(null); setFormErrors({}); setUploadError(null) }

  async function handleImageUpload(file) {
    if (!file) return
    setUploadError(null)
    setUploading(true)
    try {
      const filename = await uploadPortfolioImage(file)
      setEditItem(prev => ({ ...prev, image_url: filename }))
    } catch (err) {
      console.error('Upload error:', err)
      setUploadError(err.message)
    } finally {
      setUploading(false)
    }
  }

  function validate() {
    const e = {}
    if (!editItem.title.trim()) e.title = 'Title is required'
    if (!editItem.category) e.category = 'Category is required'
    if (!editItem.image_url) e.image_url = 'Please upload an image'
    if (editItem.year && (Number(editItem.year) < 1990 || Number(editItem.year) > new Date().getFullYear())) {
      e.year = `Year must be between 1990 and ${new Date().getFullYear()}`
    }
    setFormErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSave() {
    if (!validate()) return
    setSaving(true)
    if (isNew) {
      await createPortfolioItem(editItem)
    } else {
      await updatePortfolioItem(editItem.id, editItem)
    }
    setSaving(false)
    closeEdit()
    load()
  }

  async function handleDelete(item) {
    if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) return
    await deletePortfolioItem(item.id)
    load()
  }

  const visible = items.filter(i =>
    !search || i.title.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <p className={styles.loading}>Loading…</p>

  return (
    <div>
      <div className={styles.pageHd}>
        <div>
          <div className={styles.pageEyebrow}>Website Content</div>
          <h1 className={styles.pageTitle}>Portfolio</h1>
        </div>
        <button className={styles.btnAdd} onClick={openNew}>+ Add Project</button>
      </div>

      <div className={styles.tableWrap}>
        <div className={styles.tableToolbar}>
          <div className={styles.tableSearch}>
            <span className={styles.tableSearchIcon}>⊘</span>
            <input
              type="text"
              placeholder="Search projects…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <span className={styles.tableCount}>{visible.length} items</span>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th></th>
              <th></th>
              <th>Project Title</th>
              <th>Category</th>
              <th>Year</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((item, idx) => (
              <tr
                key={item.id}
                draggable
                onDragStart={() => onDragStart(idx)}
                onDragOver={e => onDragOver(e, idx)}
                onDrop={onDrop}
                className={styles.draggableRow}
              >
                <td className={styles.dragHandle}>⠿</td>
                <td>
                  {item.image_url
                    ? <img src={getPublicUrl(item.image_url)} alt="" className={styles.thumb} />
                    : <div className={styles.thumbEmpty} />}
                </td>
                <td className={styles.tdTitle}>{item.title}</td>
                <td><span className={`${styles.catBadge} ${catClass(item.category)}`}>{item.category}</span></td>
                <td>{item.year || '—'}</td>
                <td>
                  <button
                    className={`${styles.toggle} ${item.is_published ? styles.toggleOn : styles.toggleOff}`}
                    onClick={() => togglePublish(item)}
                  >
                    {item.is_published ? '● Live' : '○ Draft'}
                  </button>
                </td>
                <td className={styles.tdActions}>
                  <button className={`${styles.btnSm} ${styles.btnEdit}`} onClick={() => openEdit(item)}>Edit</button>
                  <button className={`${styles.btnSm} ${styles.btnDel}`} onClick={() => handleDelete(item)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {visible.length === 0 && (
          <div className={styles.empty}>No projects found.</div>
        )}
      </div>

      {editItem && (
        <div className={styles.modalOverlay} onClick={e => e.target === e.currentTarget && closeEdit()}>
          <div className={styles.modal}>
            <div className={styles.modalHd}>
              <span className={styles.modalTtl}>{isNew ? 'New Project' : 'Edit Project'}</span>
              <button className={styles.modalClose} onClick={closeEdit}>✕</button>
            </div> 

            <div className={styles.modalBody}>
              <div className={styles.mfgRow}>
                <div className={styles.mfg}>
                  <label className={styles.fieldLabel}>Category *</label>
                  <select
                    className={`${styles.fieldInput} ${formErrors.category ? styles.fieldInputErr : ''}`}
                    value={editItem.category}
                    onChange={e => setEditItem(p => ({ ...p, category: e.target.value }))}
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {formErrors.category && <span className={styles.fieldErr}>{formErrors.category}</span>}
                </div>
              </div>

              <div className={styles.mfg}>
                <label className={styles.fieldLabel}>Title *</label>
                <input
                  className={`${styles.fieldInput} ${formErrors.title ? styles.fieldInputErr : ''}`}
                  value={editItem.title}
                  onChange={e => setEditItem(p => ({ ...p, title: e.target.value }))}
                  placeholder="Project title"
                />
                {formErrors.title && <span className={styles.fieldErr}>{formErrors.title}</span>}
              </div>

              <div className={styles.mfgRow}>
                <div className={styles.mfg}>
                  <label className={styles.fieldLabel}>Label EN</label>
                  <input className={styles.fieldInput} value={editItem.label_en ?? ''} onChange={e => setEditItem(p => ({ ...p, label_en: e.target.value }))} />
                </div>
                <div className={styles.mfg}>
                  <label className={styles.fieldLabel}>Label AR</label>
                  <input className={styles.fieldInput} dir="rtl" value={editItem.label_ar ?? ''} onChange={e => setEditItem(p => ({ ...p, label_ar: e.target.value }))} />
                </div>
              </div>

              <div className={styles.mfgRow}>
                <div className={styles.mfg}>
                  <label className={styles.fieldLabel}>Subtitle EN</label>
                  <textarea className={styles.fieldInput} rows={3} value={editItem.subtitle_en ?? ''} onChange={e => setEditItem(p => ({ ...p, subtitle_en: e.target.value }))} />
                </div>
                <div className={styles.mfg}>
                  <label className={styles.fieldLabel}>Subtitle AR</label>
                  <textarea className={styles.fieldInput} rows={3} dir="rtl" value={editItem.subtitle_ar ?? ''} onChange={e => setEditItem(p => ({ ...p, subtitle_ar: e.target.value }))} />
                </div>
              </div>

              <div className={styles.mfgRow}>
                <div className={styles.mfg}>
                  <label className={styles.fieldLabel}>Year</label>
                  <input
                    className={`${styles.fieldInput} ${formErrors.year ? styles.fieldInputErr : ''}`}
                    type="number"
                    min="1990"
                    max={new Date().getFullYear()}
                    placeholder="e.g. 2024"
                    value={editItem.year ?? ''}
                    onChange={e => setEditItem(p => ({ ...p, year: e.target.value }))}
                  />
                  {formErrors.year && <span className={styles.fieldErr}>{formErrors.year}</span>}
                </div>
                <div className={styles.mfg}>
                  <label className={styles.fieldLabel}>Display Order</label>
                  <input className={styles.fieldInput} type="number" value={editItem.display_order} onChange={e => setEditItem(p => ({ ...p, display_order: Number(e.target.value) }))} />
                </div>
              </div>

              <div className={styles.mfg}>
                <label className={styles.fieldLabel}>Image *</label>
                <div
                  className={`${styles.uploadArea} ${formErrors.image_url ? styles.uploadAreaErr : ''}`}
                  onClick={() => !uploading && fileRef.current?.click()}
                >
                  {editItem.image_url
                    ? <img src={getPublicUrl(editItem.image_url)} alt="" className={styles.previewImg} />
                    : <span style={{ fontSize: 24, opacity: 0.3 }}>↑</span>}
                  <span className={styles.uploadAreaText}>
                    {uploading ? 'Uploading…' : editItem.image_url ? 'Click to replace image' : 'Click to upload image'}
                  </span>
                  {editItem.image_url && (
                    <span className={styles.uploadNote}>{editItem.image_url}</span>
                  )}
                  <span className={styles.uploadAreaHint}>JPG, PNG, WEBP</span>
                </div>
                {uploadError && <span className={styles.fieldErr}>Upload failed: {uploadError}</span>}
                {formErrors.image_url && !uploadError && <span className={styles.fieldErr}>{formErrors.image_url}</span>}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className={styles.fileInput}
                  onChange={e => handleImageUpload(e.target.files?.[0])}
                />
              </div>

              <label className={styles.checkRow}>
                <input type="checkbox" checked={editItem.is_published} onChange={e => setEditItem(p => ({ ...p, is_published: e.target.checked }))} />
                Published (Live on site)
              </label>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={closeEdit}>Cancel</button>
              <button className={styles.btnAdd} onClick={handleSave} disabled={saving || uploading}>
                {saving ? 'Saving…' : 'Save Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Contact Submissions ── */
function ContactSubmissions() {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')

  async function load() {
    setLoading(true)
    const data = await fetchContactSubmissions()
    setSubmissions(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleDelete(sub) {
    if (!window.confirm(`Delete submission from "${sub.name}"? This cannot be undone.`)) return
    await deleteContactSubmission(sub.id)
    if (selected?.id === sub.id) setSelected(null)
    load()
  }

  const visible = submissions.filter(s =>
    !search ||
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.organisation?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <p className={styles.loading}>Loading…</p>

  return (
    <div>
      <div className={styles.pageHd}>
        <div>
          <div className={styles.pageEyebrow}>Inbox</div>
          <h1 className={styles.pageTitle}>Contact Submissions</h1>
        </div>
      </div>

      <div className={styles.inboxLayout}>
        {/* List */}
        <div className={styles.inboxList}>
          <div className={styles.tableToolbar}>
            <div className={styles.tableSearch}>
              <span className={styles.tableSearchIcon}>⊘</span>
              <input
                type="text"
                placeholder="Search submissions…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <span className={styles.tableCount}>{visible.length} total</span>
          </div>

          {visible.length === 0 && (
            <div className={styles.empty}>No submissions yet.</div>
          )}

          {visible.map(sub => (
            <div
              key={sub.id}
              className={`${styles.inboxRow} ${selected?.id === sub.id ? styles.inboxRowActive : ''}`}
              onClick={() => setSelected(sub)}
            >
              <div className={styles.inboxRowTop}>
                <span className={styles.inboxName}>{sub.name}</span>
                <span className={styles.inboxDate}>
                  {new Date(sub.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <div className={styles.inboxEmail}>{sub.email}</div>
              {sub.organisation && (
                <div className={styles.inboxOrg}>{sub.organisation}</div>
              )}
              {sub.project_type && (
                <span className={styles.inboxTag}>{sub.project_type}</span>
              )}
            </div>
          ))}
        </div>

        {/* Detail */}
        <div className={styles.inboxDetail}>
          {!selected ? (
            <div className={styles.inboxEmpty}>
              <div style={{ fontSize: 28, opacity: 0.2, marginBottom: 12 }}>✉</div>
              <div style={{ fontSize: 11, color: '#666' }}>Select a submission to view</div>
            </div>
          ) : (
            <>
              <div className={styles.inboxDetailHd}>
                <div>
                  <div className={styles.inboxDetailName}>{selected.name}</div>
                  <div className={styles.inboxDetailMeta}>
                    <a href={`mailto:${selected.email}`} className={styles.inboxDetailEmail}>{selected.email}</a>
                    {selected.organisation && <span> · {selected.organisation}</span>}
                  </div>
                  <div className={styles.inboxDetailDate}>
                    {new Date(selected.created_at).toLocaleString('en-GB', {
                      day: 'numeric', month: 'long', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </div>
                </div>
                <button
                  className={`${styles.btnSm} ${styles.btnDel}`}
                  onClick={() => handleDelete(selected)}
                >Delete</button>
              </div>

              {selected.project_type && (
                <div className={styles.inboxDetailSection}>
                  <div className={styles.inboxDetailLabel}>Project Type</div>
                  <div className={styles.inboxDetailValue}>{selected.project_type}</div>
                </div>
              )}

              <div className={styles.inboxDetailSection}>
                <div className={styles.inboxDetailLabel}>Message</div>
                <div className={styles.inboxDetailMessage}>{selected.message}</div>
              </div>

              <div className={styles.inboxDetailActions}>
                <a href={`mailto:${selected.email}`} className={styles.btnAdd}>
                  Reply by Email →
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Site Text Editor ── */
function SiteTextEditor() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [savedKeys, setSavedKeys] = useState({})

  useEffect(() => {
    fetchSiteText().then(data => {
      setRows(data)
      setLoading(false)
    })
  }, [])

  function updateField(id, field, value) {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r))
  }

  async function handleBlur(row) {
    await updateSiteTextRow(row.id, { value_en: row.value_en, value_ar: row.value_ar })
    setSavedKeys(prev => ({ ...prev, [row.id]: true }))
    setTimeout(() => setSavedKeys(prev => ({ ...prev, [row.id]: false })), 2000)
  }

  const grouped = rows.reduce((acc, row) => {
    const prefix = row.key.split(/[._]/)[0]
    if (!acc[prefix]) acc[prefix] = []
    acc[prefix].push(row)
    return acc
  }, {})

  if (loading) return <p className={styles.loading}>Loading…</p>

  return (
    <div>
      <div className={styles.pageHd}>
        <div>
          <div className={styles.pageEyebrow}>Website Content</div>
          <h1 className={styles.pageTitle}>Site Text</h1>
        </div>
      </div>

      {Object.entries(grouped).map(([prefix, groupRows]) => (
        <div key={prefix} className={styles.textGroup}>
          <h3 className={styles.textGroupTitle}>{prefix}</h3>
          {groupRows.map(row => (
            <div key={row.id} className={styles.textRow}>
              <div className={styles.textKey}>{row.key}</div>
              <div className={styles.textFields}>
                <div className={styles.mfg}>
                  <label className={styles.fieldLabel}>EN</label>
                  <textarea
                    className={styles.fieldInput}
                    rows={2}
                    value={row.value_en ?? ''}
                    onChange={e => updateField(row.id, 'value_en', e.target.value)}
                    onBlur={() => handleBlur(row)}
                  />
                </div>
                <div className={styles.mfg}>
                  <label className={styles.fieldLabel}>AR</label>
                  <textarea
                    className={styles.fieldInput}
                    rows={2}
                    dir="rtl"
                    value={row.value_ar ?? ''}
                    onChange={e => updateField(row.id, 'value_ar', e.target.value)}
                    onBlur={() => handleBlur(row)}
                  />
                </div>
              </div>
              {savedKeys[row.id] && <span className={styles.savedBadge}>Saved</span>}
            </div>
          ))}
        </div>
      ))}

      {rows.length === 0 && (
        <div className={styles.empty}>No site text rows yet. Add rows to the site_text table in Supabase.</div>
      )}
    </div>
  )
}

/* ── Dashboard overview ── */
function DashboardOverview({ onNav, counts }) {
  return (
    <div>
      <div className={styles.pageHd}>
        <div>
          <div className={styles.pageEyebrow}>Overview</div>
          <h1 className={styles.pageTitle}>Dashboard</h1>
        </div>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statN}>{counts.portfolio}</div>
          <div className={styles.statL}>Portfolio Items</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statN}>{counts.published}</div>
          <div className={styles.statL}>Published</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statN}>{counts.draft}</div>
          <div className={styles.statL}>Drafts</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statN}>{counts.text}</div>
          <div className={styles.statL}>Text Keys</div>
        </div>
      </div>

      <div className={styles.quickGrid}>
        <button className={styles.quickCard} onClick={() => onNav('portfolio')}>
          <div className={styles.quickCardIcon}>⊞</div>
          <div className={styles.quickCardTitle}>Add Portfolio Item</div>
          <div className={styles.quickCardSub}>Upload a new project</div>
        </button>
        <button className={styles.quickCard} onClick={() => onNav('text')}>
          <div className={styles.quickCardIcon}>✎</div>
          <div className={styles.quickCardTitle}>Edit Site Text</div>
          <div className={styles.quickCardSub}>Update bilingual copy</div>
        </button>
        <button className={styles.quickCard} onClick={() => onNav('portfolio')}>
          <div className={styles.quickCardIcon}>⟳</div>
          <div className={styles.quickCardTitle}>Reorder Portfolio</div>
          <div className={styles.quickCardSub}>Drag to rearrange items</div>
        </button>
      </div>
    </div>
  )
}

/* ── Main Dashboard shell ── */
export default function Dashboard() {
  const [section, setSection] = useState('dashboard')
  const [counts, setCounts] = useState({ portfolio: 0, published: 0, draft: 0, text: 0, inbox: 0 })

  useEffect(() => {
    fetchDashboardCounts().then(setCounts)
  }, [])

  async function handleLogout() {
    await signOut()
  }

  const navItems = [
    { key: 'dashboard', icon: '◈', label: 'Dashboard',    group: 'Overview' },
    { key: 'portfolio', icon: '⊞', label: 'Portfolio',    group: 'Content', count: counts.portfolio },
    { key: 'text',      icon: '✎', label: 'Site Text',    group: 'Content' },
    { key: 'inbox',     icon: '✉', label: 'Submissions',  group: 'Inbox',   count: counts.inbox },
  ]

  const groups = [...new Set(navItems.map(i => i.group))]

  return (
    <div className={styles.page}>
      <div className={styles.tbar} />

      <header className={styles.header}>
        <div className={styles.headerL}>
          <img src="/logo.png" alt="TopRight" className={styles.headerLogo} />
          <span className={styles.headerPortalLabel}>Admin Portal</span>
        </div>
        <div className={styles.headerR}>
          <button className={styles.logoutBtn} onClick={handleLogout}>Sign Out</button>
        </div>
      </header>

      <div className={styles.body}>
        <nav className={styles.sidebar}>
          {groups.map(group => (
            <div key={group} className={styles.sidebarSection}>
              <div className={styles.sidebarLabel}>{group}</div>
              {navItems.filter(i => i.group === group).map(item => (
                <button
                  key={item.key}
                  className={`${styles.slink} ${section === item.key ? styles.slinkActive : ''}`}
                  onClick={() => setSection(item.key)}
                >
                  <span className={styles.slinkIcon}>{item.icon}</span>
                  {item.label}
                  {item.count !== undefined && (
                    <span className={styles.slinkCount}>{item.count}</span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <main className={styles.main}>
          {section === 'dashboard' && <DashboardOverview onNav={setSection} counts={counts} />}
          {section === 'portfolio' && <PortfolioManager onNav={setSection} />}
          {section === 'text' && <SiteTextEditor />}
          {section === 'inbox' && <ContactSubmissions />}
        </main>
      </div>
    </div>
  )
}
