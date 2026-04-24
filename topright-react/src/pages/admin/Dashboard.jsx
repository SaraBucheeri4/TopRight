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
// import { fetchSiteText, updateSiteTextRow } from '../../services/siteTextService'
import { fetchDashboardCounts } from '../../services/dashboardService'
import { signOut } from '../../services/authService'
import { PORTFOLIO_CATEGORIES } from '../../config/constants'
import {
  fetchCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from '../../services/calendarService'
import {
  fetchAllClients,
  createClient,
  updateClient,
  deleteClient,
  updateClientsOrder,
} from '../../services/clientsService'
import { fetchContactInfo, upsertContactInfo } from '../../services/contactInfoService'
import { fetchFooter, upsertFooter } from '../../services/footerService'
import { fetchHeroContent, upsertHeroContent, uploadHeroCardImage, getHeroCardImageUrl } from '../../services/heroService'
import {
  fetchAllWhyItems,
  createWhyItem,
  updateWhyItem,
  deleteWhyItem,
  updateWhyOrder,
} from '../../services/whyService'
import {
  fetchAllServices,
  createService,
  updateService,
  deleteService,
  updateServicesOrder,
} from '../../services/servicesService'
import {
  fetchAllTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  updateTestimonialsOrder,
} from '../../services/testimonialsService'

const CATEGORIES = PORTFOLIO_CATEGORIES

const EMPTY_ITEM = {
  slug: '', category: 'newsletter',
  title_en: '', title_ar: '', subtitle_en: '', subtitle_ar: '', year: '',
  image_url: '', project_url: '', video_url: '', image_position: '50% 50%', display_order: 0, is_published: true,
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

function CropSlider({ label, value, onChange, styles }) {
  return (
    <div className={styles.cropSliderRow}>
      <span className={styles.cropSliderLbl}>{label}</span>
      <input
        type="range" min={0} max={100} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className={styles.cropRange}
      />
      <span className={styles.cropSliderVal}>{value}%</span>
    </div>
  )
}

/* ── Portfolio Manager ── */
function PortfolioManager({ onNav, showToast }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editItem, setEditItem] = useState(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const [search, setSearch] = useState('')
  const [previewSrc, setPreviewSrc] = useState(null)
  const dragIdx = useRef(null)
  const fileRef = useRef(null)
  const docRef = useRef(null)
  const videoRef = useRef(null)
  const [uploadingDoc, setUploadingDoc] = useState(false)
  const [uploadDocError, setUploadDocError] = useState(null)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [uploadVideoError, setUploadVideoError] = useState(null)

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

  function openEdit(item) {
    setEditItem({ ...item, image_position: item.image_position || '50% 50%' })
    setIsNew(false)
    setFormErrors({})
    setUploadError(null)
    setPreviewSrc(item.image_url ? getPublicUrl(item.image_url) : null)
  }
  function openNew() {
    setEditItem({ ...EMPTY_ITEM, display_order: items.length })
    setIsNew(true)
    setFormErrors({})
    setUploadError(null)
    setPreviewSrc(null)
  }
  function closeEdit() { setEditItem(null); setFormErrors({}); setUploadError(null); setPreviewSrc(null) }

  async function handleImageUpload(file) {
    if (!file) return
    setUploadError(null)
    // Show local preview immediately before upload
    const reader = new FileReader()
    reader.onload = e => setPreviewSrc(e.target.result)
    reader.readAsDataURL(file)
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

  async function handleDocUpload(file) {
    if (!file) return
    setUploadDocError(null)
    setUploadingDoc(true)
    try {
      const filename = await uploadPortfolioImage(file)
      setEditItem(prev => ({ ...prev, project_url: getPublicUrl(filename) }))
    } catch (err) {
      setUploadDocError(err.message)
    } finally {
      setUploadingDoc(false)
    }
  }

  async function handleVideoUpload(file) {
    if (!file) return
    setUploadVideoError(null)
    setUploadingVideo(true)
    try {
      const filename = await uploadPortfolioImage(file)
      setEditItem(prev => ({ ...prev, video_url: getPublicUrl(filename) }))
    } catch (err) {
      setUploadVideoError(err.message)
    } finally {
      setUploadingVideo(false)
    }
  }

  function validate() {
    const e = {}
    if (!editItem.title_en?.trim()) e.title_en = 'Title (EN) is required'
    if (editItem.title_en?.trim().length > 120) e.title_en = 'Title must be 120 characters or fewer'
    if (!editItem.category) e.category = 'Category is required'
    if (!editItem.image_url) e.image_url = 'Please upload an image'
    if (editItem.year && (Number(editItem.year) < 1990 || Number(editItem.year) > new Date().getFullYear())) {
      e.year = `Year must be between 1990 and ${new Date().getFullYear()}`
    }
    if (editItem.project_url && editItem.project_url.trim() && !/^https?:\/\/.+/.test(editItem.project_url.trim())) {
      e.project_url = 'Must be a valid URL starting with http:// or https://'
    }
    setFormErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSave() {
    if (!validate()) return
    setSaving(true)
    if (isNew) {
      await createPortfolioItem(editItem)
      showToast?.('Project added', 'New portfolio item is now live.')
    } else {
      await updatePortfolioItem(editItem.id, editItem)
      showToast?.('Project updated', 'Changes saved successfully.')
    }
    setSaving(false)
    closeEdit()
    load()
  }

  async function handleDelete(item) {
    if (!window.confirm(`Delete "${item.title_en}"? This cannot be undone.`)) return
    await deletePortfolioItem(item.id)
    load()
  }

  const visible = items.filter(i =>
    !search || i.title_en?.toLowerCase().includes(search.toLowerCase())
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
          <colgroup>
            <col style={{ width: 36 }} />
            <col style={{ width: 80 }} />
            <col />
            <col style={{ width: 140 }} />
            <col style={{ width: 80 }} />
            <col style={{ width: 100 }} />
            <col style={{ width: 140 }} />
          </colgroup>
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
                <td className={styles.tdTitle}>{item.title_en}</td>
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
                <td>
                  <div className={styles.tdActions}>
                    <button className={`${styles.btnSm} ${styles.btnEdit}`} onClick={() => openEdit(item)}>Edit</button>
                    <button className={`${styles.btnSm} ${styles.btnDel}`} onClick={() => handleDelete(item)}>Delete</button>
                  </div>
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

              <div className={styles.mfgRow}>
                <div className={styles.mfg}>
                  <label className={styles.fieldLabel}>Title (EN) *</label>
                  <input
                    className={`${styles.fieldInput} ${formErrors.title_en ? styles.fieldInputErr : ''}`}
                    value={editItem.title_en ?? ''}
                    onChange={e => setEditItem(p => ({ ...p, title_en: e.target.value }))}
                    placeholder="Project title in English"
                  />
                  {formErrors.title_en && <span className={styles.fieldErr}>{formErrors.title_en}</span>}
                </div>
                <div className={styles.mfg}>
                  <label className={styles.fieldLabel}>Title (AR)</label>
                  <input
                    className={styles.fieldInput}
                    dir="rtl"
                    value={editItem.title_ar ?? ''}
                    onChange={e => setEditItem(p => ({ ...p, title_ar: e.target.value }))}
                    placeholder="عنوان المشروع بالعربي"
                  />
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
                <div className={styles.uploadWithPreview}>
                  {/* Upload trigger */}
                  <div
                    className={`${styles.uploadArea} ${formErrors.image_url ? styles.uploadAreaErr : ''}`}
                    onClick={() => !uploading && fileRef.current?.click()}
                  >
                    <span style={{ fontSize: 24, opacity: 0.3 }}>↑</span>
                    <span className={styles.uploadAreaText}>
                      {uploading ? 'Uploading…' : previewSrc ? 'Click to replace' : 'Click to upload image'}
                    </span>
                    <span className={styles.uploadAreaHint}>JPG, PNG, WEBP</span>
                  </div>

                  {/* Card preview + crop sliders */}
                  <div className={styles.cardPreviewWrap}>
                    <div className={styles.cardPreviewLabel}>Card preview</div>
                    <div className={styles.cardPreview}>
                      <div className={styles.cardPreviewThumb}>
                        {previewSrc
                          ? <img src={previewSrc} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: editItem.image_position || '50% 50%' }} />
                          : <div className={styles.cardPreviewEmpty}>No image</div>
                        }
                      </div>
                      <div className={styles.cardPreviewInfo}>
                        <div className={styles.cardPreviewCat}>{editItem.category || 'Category'}</div>
                        <div className={styles.cardPreviewTitle}>{editItem.title_en || 'Project Title'}</div>
                        <div className={styles.cardPreviewSub}>{editItem.subtitle_en || 'Subtitle…'}</div>
                        <div className={styles.cardPreviewArrow}>View project →</div>
                      </div>
                    </div>
                    {uploading && <div className={styles.cardPreviewUploading}>Uploading…</div>}
                    {previewSrc && (
                      <div className={styles.cropSliders}>
                        <CropSlider
                          label="← Horizontal →"
                          value={parseInt((editItem.image_position || '50% 50%').split(' ')[0]) || 50}
                          onChange={v => {
                            const py = parseInt((editItem.image_position || '50% 50%').split(' ')[1]) || 50
                            setEditItem(p => ({ ...p, image_position: `${v}% ${py}%` }))
                          }}
                          styles={styles}
                        />
                        <CropSlider
                          label="↑ Vertical ↓"
                          value={parseInt((editItem.image_position || '50% 50%').split(' ')[1]) || 50}
                          onChange={v => {
                            const px = parseInt((editItem.image_position || '50% 50%').split(' ')[0]) || 50
                            setEditItem(p => ({ ...p, image_position: `${px}% ${v}%` }))
                          }}
                          styles={styles}
                        />
                      </div>
                    )}
                  </div>
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

              <div className={styles.mfg}>
                <label className={styles.fieldLabel}>Project Link / File</label>
                <input
                  className={`${styles.fieldInput} ${formErrors.project_url ? styles.fieldInputErr : ''}`}
                  type="url"
                  placeholder="https://… or upload a file below"
                  value={editItem.project_url ?? ''}
                  onChange={e => setEditItem(p => ({ ...p, project_url: e.target.value }))}
                />
                {formErrors.project_url && <span className={styles.fieldErr}>{formErrors.project_url}</span>}
                <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    style={{ fontSize: 12, padding: '4px 10px' }}
                    onClick={() => docRef.current?.click()}
                    disabled={uploadingDoc}
                  >
                    {uploadingDoc ? 'Uploading…' : '↑ Upload PDF / File'}
                  </button>
                  {editItem.project_url && (
                    <a href={editItem.project_url} target="_blank" rel="noopener" style={{ fontSize: 12, opacity: 0.7 }}>
                      Preview ↗
                    </a>
                  )}
                </div>
                {uploadDocError && <span className={styles.fieldErr}>Upload failed: {uploadDocError}</span>}
                <input
                  ref={docRef}
                  type="file"
                  accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.zip,image/*"
                  className={styles.fileInput}
                  onChange={e => handleDocUpload(e.target.files?.[0])}
                />
                <span className={styles.uploadAreaHint}>PDF, PPT, Word, Excel, ZIP, or any image</span>
              </div>

              <div className={styles.mfg}>
                <label className={styles.fieldLabel}>Video (optional)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    style={{ fontSize: 12, padding: '4px 10px' }}
                    onClick={() => videoRef.current?.click()}
                    disabled={uploadingVideo}
                  >
                    {uploadingVideo ? 'Uploading…' : '↑ Upload Video'}
                  </button>
                  {editItem.video_url && (
                    <span style={{ fontSize: 11, color: '#01A6A6' }}>✓ Video attached</span>
                  )}
                  {editItem.video_url && (
                    <button type="button" style={{ fontSize: 11, color: '#E7432B', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setEditItem(p => ({ ...p, video_url: '' }))}>Remove</button>
                  )}
                </div>
                {editItem.video_url && (
                  <video src={editItem.video_url} controls style={{ marginTop: 8, width: '100%', maxHeight: 160, borderRadius: 4, background: '#000' }} />
                )}
                {uploadVideoError && <span className={styles.fieldErr}>Upload failed: {uploadVideoError}</span>}
                <input
                  ref={videoRef}
                  type="file"
                  accept="video/mp4,video/webm,video/mov,video/quicktime,video/*"
                  className={styles.fileInput}
                  onChange={e => handleVideoUpload(e.target.files?.[0])}
                />
                <span className={styles.uploadAreaHint}>MP4, WebM or MOV — max 50 MB</span>
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
function SiteTextEditor({ showToast }) {
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
    showToast?.('Saved', `"${row.key}" updated.`)
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
          <div className={styles.statN}>{counts.clients}</div>
          <div className={styles.statL}>Client Logos</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statN}>{counts.inbox}</div>
          <div className={styles.statL}>New Submissions</div>
        </div>
      </div>

      <div className={styles.quickGrid}>
        <button className={styles.quickCard} onClick={() => onNav('portfolio')}>
          <div className={styles.quickCardIcon}>⊞</div>
          <div className={styles.quickCardTitle}>Add Portfolio Item</div>
          <div className={styles.quickCardSub}>Upload a new project to the bento grid</div>
        </button>
        <button className={styles.quickCard} onClick={() => onNav('clients')}>
          <div className={styles.quickCardIcon}>◉</div>
          <div className={styles.quickCardTitle}>Manage Clients</div>
          <div className={styles.quickCardSub}>Add or reorder the clients bar</div>
        </button>
        <button className={styles.quickCard} onClick={() => onNav('contact')}>
          <div className={styles.quickCardIcon}>☏</div>
          <div className={styles.quickCardTitle}>Update Contact Info</div>
          <div className={styles.quickCardSub}>Edit email, phone and location</div>
        </button>
        <button className={styles.quickCard} onClick={() => onNav('text')}>
          <div className={styles.quickCardIcon}>✎</div>
          <div className={styles.quickCardTitle}>Edit Site Text</div>
          <div className={styles.quickCardSub}>Update bilingual copy</div>
        </button>
        <button className={styles.quickCard} onClick={() => onNav('footer')}>
          <div className={styles.quickCardIcon}>▭</div>
          <div className={styles.quickCardTitle}>Footer</div>
          <div className={styles.quickCardSub}>About text and copyright line</div>
        </button>
        <button className={styles.quickCard} onClick={() => onNav('inbox')}>
          <div className={styles.quickCardIcon}>✉</div>
          <div className={styles.quickCardTitle}>View Submissions</div>
          <div className={styles.quickCardSub}>{counts.inbox} unread message{counts.inbox !== 1 ? 's' : ''}</div>
        </button>
      </div>

      <div className={styles.activity}>
        <div className={styles.activityHd}>Quick Access</div>
        <div className={styles.activityItem}>
          <div className={styles.activityDot} style={{ background: '#01A6A6' }} />
          <div className={styles.activityText}><strong>Portfolio</strong> — {counts.portfolio} items · {counts.published} published · {counts.draft} draft</div>
          <button className={styles.activityAction} onClick={() => onNav('portfolio')}>Manage →</button>
        </div>
        <div className={styles.activityItem}>
          <div className={styles.activityDot} style={{ background: '#E7432B' }} />
          <div className={styles.activityText}><strong>Clients Bar</strong> — {counts.clients} client logo{counts.clients !== 1 ? 's' : ''} displayed on site</div>
          <button className={styles.activityAction} onClick={() => onNav('clients')}>Manage →</button>
        </div>
        <div className={styles.activityItem}>
          <div className={styles.activityDot} style={{ background: '#773E84' }} />
          <div className={styles.activityText}><strong>Contact Submissions</strong> — {counts.inbox} message{counts.inbox !== 1 ? 's' : ''} in inbox</div>
          <button className={styles.activityAction} onClick={() => onNav('inbox')}>View →</button>
        </div>
        <div className={styles.activityItem}>
          <div className={styles.activityDot} style={{ background: '#0058A1' }} />
          <div className={styles.activityText}><strong>Site Text</strong> — {counts.text} bilingual text keys managed</div>
          <button className={styles.activityAction} onClick={() => onNav('text')}>Edit →</button>
        </div>
      </div>
    </div>
  )
}

/* ── Calendar Page ── */
const EVENT_COLORS = [
  { label: 'Red',    value: '#E7432B' },
  { label: 'Blue',   value: '#0058A1' },
  { label: 'Teal',   value: '#01A6A6' },
  { label: 'Purple', value: '#773E84' },
  { label: 'Green',  value: '#25D366' },
  { label: 'Dark',   value: '#444' },
]
const EMPTY_EVENT = { title: '', description: '', event_date: '', start_time: '', end_time: '', color: '#E7432B', type: 'general' }

function CalendarPage({ showToast }) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)  // null | { mode: 'add'|'edit', event, date? }
  const [form, setForm] = useState(EMPTY_EVENT)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [error, setError] = useState(null)

  async function load() {
    setLoading(true)
    try { setEvents(await fetchCalendarEvents(year, month)) }
    catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [year, month])

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }

  function openAdd(dateStr) {
    setForm({ ...EMPTY_EVENT, event_date: dateStr })
    setModal({ mode: 'add' })
    setError(null)
  }
  function openEdit(ev) {
    setForm({ title: ev.title, description: ev.description ?? '', event_date: ev.event_date, start_time: ev.start_time ?? '', end_time: ev.end_time ?? '', color: ev.color ?? '#E7432B', type: ev.type ?? 'general' })
    setModal({ mode: 'edit', id: ev.id })
    setError(null)
  }

  async function handleSave() {
    if (!form.title.trim()) { setError('Title is required.'); return }
    if (!form.event_date) { setError('Date is required.'); return }
    const today = new Date(); today.setHours(0, 0, 0, 0)
    if (new Date(form.event_date + 'T00:00:00') < today) { setError('Event date cannot be in the past.'); return }
    if (form.start_time && form.end_time && form.end_time <= form.start_time) { setError('End time must be after start time.'); return }
    setSaving(true)
    setError(null)
    try {
      const payload = { title: form.title.trim(), description: form.description.trim() || null, event_date: form.event_date, start_time: form.start_time || null, end_time: form.end_time || null, color: form.color, type: form.type }
      if (modal.mode === 'add') {
        await createCalendarEvent(payload)
        showToast?.('Event added', `"${payload.title}" has been saved to the calendar.`)
      } else {
        await updateCalendarEvent(modal.id, payload)
        showToast?.('Event updated', 'Changes saved successfully.')
      }
      setModal(null)
      await load()
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  async function handleDelete(id) {
    setSaving(true)
    try { await deleteCalendarEvent(id); setDeleteConfirm(null); setModal(null); await load(); showToast?.('Event deleted', 'The event has been removed.') }
    catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  // Build calendar grid
  const firstDay = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const todayStr = now.toISOString().split('T')[0]

  const eventsByDate = {}
  events.forEach(ev => {
    if (!eventsByDate[ev.event_date]) eventsByDate[ev.event_date] = []
    eventsByDate[ev.event_date].push(ev)
  })

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const dayLabels = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const todayDate = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`

  return (
    <div>
      <div className={styles.pageHd}>
        <div>
          <div className={styles.pageEyebrow}>Schedule</div>
          <h1 className={styles.pageTitle}>Calendar</h1>
        </div>
        <button className={styles.btnAdd} onClick={() => openAdd(todayDate)}>
          + Add Event
        </button>
      </div>

      {/* Month nav */}
      <div className={styles.calNav}>
        <button className={styles.calNavBtn} onClick={prevMonth}>‹</button>
        <span className={styles.calMonthLabel}>{monthNames[month - 1]} {year}</span>
        <button className={styles.calNavBtn} onClick={nextMonth}>›</button>
        <button className={styles.calTodayBtn} onClick={() => { setYear(now.getFullYear()); setMonth(now.getMonth() + 1) }}>Today</button>
      </div>

      {loading ? (
        <div className={styles.loadingMsg}>Loading…</div>
      ) : (
        <div className={styles.calGrid}>
          {dayLabels.map(d => <div key={d} className={styles.calDayLabel}>{d}</div>)}
          {cells.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} className={styles.calCellEmpty} />
            const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`
            const dayEvents = eventsByDate[dateStr] ?? []
            const isToday = dateStr === todayStr
            return (
              <div key={dateStr} className={`${styles.calCell} ${isToday ? styles.calCellToday : ''}`} onClick={() => openAdd(dateStr)}>
                <span className={styles.calDayNum}>{day}</span>
                <div className={styles.calEvents}>
                  {dayEvents.map(ev => (
                    <div key={ev.id} className={styles.calEventPill} style={{ background: ev.color ?? '#E7432B' }}
                      onClick={e => { e.stopPropagation(); openEdit(ev) }}>
                      {ev.start_time ? ev.start_time.slice(0,5) + ' ' : ''}{ev.title}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modal && (
        <div className={styles.modalOverlay} onClick={() => setModal(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHd}>
              <h2 className={styles.modalTtl}>{modal.mode === 'add' ? 'Add Event' : 'Edit Event'}</h2>
              <button className={styles.modalClose} onClick={() => setModal(null)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              {error && <div className={styles.calError}>{error}</div>}

              <div className={styles.mfg}>
                <label className={styles.fieldLabel}>Title *</label>
                <input className={styles.fieldInput} value={form.title} onChange={e => f('title', e.target.value)} placeholder="Event title" />
              </div>
              <div className={styles.mfg}>
                <label className={styles.fieldLabel}>Description</label>
                <textarea className={styles.fieldInput} value={form.description} onChange={e => f('description', e.target.value)} placeholder="Optional description" rows={2} />
              </div>
              <div className={styles.mfgRow}>
                <div className={styles.mfg}>
                  <label className={styles.fieldLabel}>Date *</label>
                  <input className={styles.fieldInput} type="date" value={form.event_date} min={todayStr} onChange={e => f('event_date', e.target.value)} />
                </div>
                <div className={styles.mfg}>
                  <label className={styles.fieldLabel}>Type</label>
                  <input className={styles.fieldInput} value={form.type} onChange={e => f('type', e.target.value)} placeholder="e.g. Meeting, Deadline…" />
                </div>
              </div>
              <div className={styles.mfgRow}>
                <div className={styles.mfg}>
                  <label className={styles.fieldLabel}>Start Time</label>
                  <input className={styles.fieldInput} type="time" value={form.start_time} onChange={e => f('start_time', e.target.value)} />
                </div>
                <div className={styles.mfg}>
                  <label className={styles.fieldLabel}>End Time</label>
                  <input className={styles.fieldInput} type="time" value={form.end_time} onChange={e => f('end_time', e.target.value)} />
                </div>
              </div>
              <div className={styles.mfg}>
                <label className={styles.fieldLabel}>Color</label>
                <div className={styles.colorPicker}>
                  {EVENT_COLORS.map(c => (
                    <button key={c.value} className={`${styles.colorSwatch} ${form.color === c.value ? styles.colorSwatchActive : ''}`}
                      style={{ background: c.value }} title={c.label}
                      onClick={() => f('color', c.value)} type="button" />
                  ))}
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              {modal.mode === 'edit' && (
                <button className={`${styles.btnSm} ${styles.btnDel}`} onClick={() => setDeleteConfirm(modal.id)} disabled={saving}>Delete</button>
              )}
              <div style={{ flex: 1 }} />
              <button className={styles.btnSecondary} onClick={() => setModal(null)} disabled={saving}>Cancel</button>
              <button className={styles.btnAdd} onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : modal.mode === 'add' ? 'Add Event' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className={styles.modalOverlay} onClick={() => setDeleteConfirm(null)}>
          <div className={styles.modal} style={{ width: 400 }} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHd}>
              <h2 className={styles.modalTtl}>Delete Event?</h2>
              <button className={styles.modalClose} onClick={() => setDeleteConfirm(null)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <p style={{ color: '#888', fontSize: 13, lineHeight: 1.6 }}>This event will be permanently deleted and cannot be recovered.</p>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className={`${styles.btnSm} ${styles.btnDel}`} style={{ padding: '10px 20px' }} onClick={() => handleDelete(deleteConfirm)} disabled={saving}>
                {saving ? 'Deleting…' : 'Delete Event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Clients Manager ── */
function ClientsManager({ showToast }) {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [editClient, setEditClient] = useState(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const dragIdx = useRef(null)

  const EMPTY_CLIENT = { name: '', logo_url: '', display_order: 0, is_published: true }

  async function load() {
    setLoading(true)
    const data = await fetchAllClients()
    setClients(data)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function togglePublish(client) {
    const updated = !client.is_published
    setClients(prev => prev.map(c => c.id === client.id ? { ...c, is_published: updated } : c))
    await updateClient(client.id, { is_published: updated })
  }

  function onDragStart(idx) { dragIdx.current = idx }
  function onDragOver(e, idx) {
    e.preventDefault()
    if (dragIdx.current === idx) return
    setClients(prev => {
      const next = [...prev]
      const [moved] = next.splice(dragIdx.current, 1)
      next.splice(idx, 0, moved)
      dragIdx.current = idx
      return next
    })
  }
  async function onDrop() {
    dragIdx.current = null
    await updateClientsOrder(clients)
  }

  function openNew() {
    setEditClient({ ...EMPTY_CLIENT, display_order: clients.length })
    setIsNew(true)
    setFormErrors({})
  }
  function openEdit(client) {
    setEditClient({ ...client })
    setIsNew(false)
    setFormErrors({})
  }
  function closeEdit() {
    setEditClient(null)
    setFormErrors({})
  }

  function validate() {
    const e = {}
    if (!editClient.name?.trim()) e.name = 'Client name is required'
    else if (editClient.name.trim().length > 80) e.name = 'Name must be 80 characters or fewer'
    setFormErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSave() {
    if (!validate()) return
    setSaving(true)
    setSaveError(null)
    try {
      if (isNew) {
        const { id: _id, ...rest } = editClient
        await createClient({ ...rest, display_order: clients.length })
        showToast?.('Client added', `"${editClient.name}" is now in the clients bar.`)
      } else {
        const { id, ...rest } = editClient
        await updateClient(id, rest)
        showToast?.('Client updated', 'Changes saved successfully.')
      }
      closeEdit()
      load()
    } catch (err) {
      setSaveError(err.message ?? 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(client) {
    setSaving(true)
    setSaveError(null)
    try {
      await deleteClient(client.id)
      showToast?.('Client removed', `"${client.name}" has been deleted.`)
      setDeleteConfirm(null)
      load()
    } catch (err) {
      setSaveError(err.message ?? 'Delete failed')
      setDeleteConfirm(null)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className={styles.loading}>Loading…</p>

  return (
    <div>
      <div className={styles.pageHd}>
        <div>
          <div className={styles.pageEyebrow}>Website Content</div>
          <h1 className={styles.pageTitle}>Clients Bar</h1>
        </div>
        <button className={styles.btnAdd} onClick={openNew}>+ Add Client</button>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table} style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: 36 }} />
            <col />
            <col style={{ width: 110 }} />
            <col style={{ width: 140 }} />
          </colgroup>
          <thead>
            <tr>
              <th></th>
              <th>Client Name</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client, idx) => (
              <tr
                key={client.id}
                draggable
                onDragStart={() => onDragStart(idx)}
                onDragOver={e => onDragOver(e, idx)}
                onDrop={onDrop}
                className={styles.draggableRow}
              >
                <td className={styles.dragHandle}>⠿</td>
                <td className={styles.tdTitle}>{client.name}</td>
                <td>
                  <button
                    className={`${styles.toggle} ${client.is_published ? styles.toggleOn : styles.toggleOff}`}
                    onClick={() => togglePublish(client)}
                  >
                    {client.is_published ? '● Live' : '○ Draft'}
                  </button>
                </td>
                <td>
                  <div className={styles.tdActions}>
                    <button className={`${styles.btnSm} ${styles.btnEdit}`} onClick={() => openEdit(client)}>Edit</button>
                    <button className={`${styles.btnSm} ${styles.btnDel}`} onClick={() => setDeleteConfirm(client)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {clients.length === 0 && <div className={styles.empty}>No clients yet. Add one above.</div>}
      </div>

      {/* Edit / Add modal */}
      {editClient && (
        <div className={styles.modalOverlay} onClick={e => e.target === e.currentTarget && closeEdit()}>
          <div className={styles.modal}>
            <div className={styles.modalHd}>
              <span className={styles.modalTtl}>{isNew ? 'New Client' : 'Edit Client'}</span>
              <button className={styles.modalClose} onClick={closeEdit}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.mfg}>
                <label className={styles.fieldLabel}>Client Name *</label>
                <input
                  className={`${styles.fieldInput} ${formErrors.name ? styles.fieldInputErr : ''}`}
                  type="text"
                  placeholder="e.g. Bapco Energies"
                  value={editClient.name}
                  onChange={e => setEditClient(p => ({ ...p, name: e.target.value }))}
                />
                {formErrors.name && <span className={styles.fieldErr}>{formErrors.name}</span>}
              </div>

              <div className={styles.mfgRow}>
                <div className={styles.mfg}>
                  <label className={styles.fieldLabel}>Display Order</label>
                  <input
                    className={styles.fieldInput}
                    type="number"
                    value={editClient.display_order}
                    onChange={e => setEditClient(p => ({ ...p, display_order: Number(e.target.value) }))}
                  />
                </div>
                <div className={styles.mfg}>
                  <label className={styles.fieldLabel}>Visibility</label>
                  <select
                    className={styles.fieldInput}
                    value={editClient.is_published ? 'live' : 'draft'}
                    onChange={e => setEditClient(p => ({ ...p, is_published: e.target.value === 'live' }))}
                  >
                    <option value="live">Live</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              {saveError && <span className={styles.fieldErr} style={{ marginRight: 'auto' }}>{saveError}</span>}
              <button className={styles.btnSecondary} onClick={closeEdit}>Cancel</button>
              <button className={styles.btnAdd} onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : isNew ? 'Add Client' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className={styles.modalOverlay} onClick={() => setDeleteConfirm(null)}>
          <div className={styles.modal} style={{ width: 400 }} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHd}>
              <h2 className={styles.modalTtl}>Delete Client?</h2>
              <button className={styles.modalClose} onClick={() => setDeleteConfirm(null)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <p style={{ color: '#888', fontSize: 13, lineHeight: 1.6 }}>
                "{deleteConfirm.name}" will be permanently removed from the clients bar.
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className={`${styles.btnSm} ${styles.btnDel}`} style={{ padding: '10px 20px' }} onClick={() => handleDelete(deleteConfirm)} disabled={saving}>
                {saving ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


const EMPTY_SERVICE = {
  title_en: '', title_ar: '', description_en: '', description_ar: '',
  card_color: '#E7432B', tag_label: '', display_order: 0, is_published: true,
}

const EMPTY_TESTIMONIAL = {
  quote_en: '', quote_ar: '', name: '', company: '',
  avatar_color: '#E7432B', display_order: 0, is_published: true,
}

/* ── Hero Editor ── */
function HeroEditorTMP_PLACEHOLDER({ showToast }) {
  const DEFAULTS = {
    story_en: "Top Right was founded in Bahrain in 2001 with a single purpose: to tell stories beautifully, in both Arabic and English.\n\nOver two decades we have grown into a full-service creative studio trusted by some of the GCC's most respected organisations — from GPIC and Bapco Energies to the Ministry of Interior and Bahrain Television.\n\nWhat makes us different is our genuine bilingualism. We don't translate — we create in both languages simultaneously, ensuring every piece communicates authentically to every reader.",
    story_ar: 'تأسست توب رايت في البحرين عام ٢٠٠١ بهدف واحد: رواية القصص بجمال، بالعربية والإنجليزية معًا.\n\nعلى مدى عقدين نمونا لنصبح استوديو إبداعي متكامل تثق به بعض أبرز المؤسسات في منطقة الخليج.\n\nما يميزنا هو ثنائيتنا اللغوية الحقيقية. نحن لا نترجم — بل نبتكر بكلتا اللغتين في آنٍ واحد.',
    member1_name: '', member1_role_en: 'Creative Director & Founder', member1_role_ar: 'المدير الإبداعي والمؤسس',
    member1_bio_en: 'Over 20 years leading creative projects across Bahrain and the GCC.', member1_bio_ar: 'أكثر من ٢٠ عامًا في قيادة المشاريع الإبداعية في البحرين ومنطقة الخليج.', member1_image: null,
    member2_name: '', member2_role_en: 'Senior Designer', member2_role_ar: 'مصمم أول',
    member2_bio_en: 'Specialises in layout and typographic design for Arabic and English publications.', member2_bio_ar: 'متخصص في تصميم التخطيط والطباعة للمطبوعات العربية والإنجليزية.', member2_image: null,
    member3_name: '', member3_role_en: 'Illustrator & Animator', member3_role_ar: 'رسّام ومصمم رسوم متحركة',
    member3_bio_en: "Creates character-driven illustrations for children's books and educational materials.", member3_bio_ar: 'يبتكر رسومًا توضيحية مبنية على الشخصيات لكتب الأطفال والمواد التعليمية.', member3_image: null,
  }

  const [about, setAbout] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [uploading, setUploading] = useState({})
  const [previews, setPreviews] = useState({})
  const fileRefs = { 1: useRef(), 2: useRef(), 3: useRef() }

  useEffect(() => {
    fetchAboutContent()
      .then(data => {
        const merged = { ...DEFAULTS, ...(data ?? {}) }
        setAbout(merged)
        const p = {}
        ;[1, 2, 3].forEach(n => {
          if (merged[`member${n}_image`]) p[n] = getAboutImageUrl(merged[`member${n}_image`])
        })
        setPreviews(p)
      })
      .catch(() => setAbout(DEFAULTS))
      .finally(() => setLoading(false))
  }, [])

  function set(field, value) { setAbout(prev => ({ ...prev, [field]: value })) }

  async function handleImageUpload(n, file) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = e => setPreviews(p => ({ ...p, [n]: e.target.result }))
    reader.readAsDataURL(file)
    setUploading(u => ({ ...u, [n]: true }))
    try {
      const filename = await uploadAboutImage(file)
      set(`member${n}_image`, filename)
    } catch (err) {
      console.error(err)
    } finally {
      setUploading(u => ({ ...u, [n]: false }))
    }
  }

  async function handleSave() {
    setSaving(true); setSaveError(null)
    try {
      await upsertAboutContent(about)
      showToast?.('About saved', 'About page updated successfully.')
    } catch (err) {
      setSaveError(err.message ?? 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className={styles.loading}>Loading…</p>

  return (
    <div>
      <div className={styles.pageHd}>
        <div>
          <div className={styles.pageEyebrow}>Website Content</div>
          <h1 className={styles.pageTitle}>About Page</h1>
        </div>
        <button className={styles.btnAdd} onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save Changes ↓'}
        </button>
      </div>

      <div className={styles.tableWrap} style={{ padding: 28 }}>

        {/* Story */}
        <div style={{ marginBottom: 8, fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: '#666' }}>Our Story</div>
        <div className={styles.mfgRow}>
          <div className={styles.mfg}>
            <label className={styles.fieldLabel}>Story Text (EN)</label>
            <textarea className={styles.fieldInput} rows={6} value={about.story_en ?? ''} onChange={e => set('story_en', e.target.value)} style={{ resize: 'vertical' }} />
          </div>
          <div className={styles.mfg}>
            <label className={styles.fieldLabel}>Story Text (AR)</label>
            <textarea className={styles.fieldInput} rows={6} dir="rtl" value={about.story_ar ?? ''} onChange={e => set('story_ar', e.target.value)} style={{ resize: 'vertical' }} />
          </div>
        </div>

        {/* Team members */}
        <div style={{ marginTop: 28, marginBottom: 8, fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: '#666' }}>Team Members</div>
        {[1, 2, 3].map(n => (
          <div key={n} style={{ border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, padding: '16px', marginBottom: 14 }}>
            <div style={{ fontSize: 10, letterSpacing: 1, color: '#888', marginBottom: 12 }}>Member {n}</div>

            {/* Photo upload */}
            <div className={styles.mfgRow} style={{ alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ width: 90, flexShrink: 0 }}>
                <div
                  style={{ width: 80, height: 80, borderRadius: '50%', background: '#1a1a1a', border: '2px dashed #333', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', fontSize: 11, color: '#555' }}
                  onClick={() => fileRefs[n].current?.click()}
                >
                  {previews[n]
                    ? <img src={previews[n]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : uploading[n] ? '…' : '+ Photo'
                  }
                </div>
                <input ref={fileRefs[n]} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleImageUpload(n, e.target.files[0])} />
              </div>
              <div className={styles.mfg} style={{ flex: 1 }}>
                <label className={styles.fieldLabel}>Full Name</label>
                <input className={styles.fieldInput} value={about[`member${n}_name`] ?? ''} onChange={e => set(`member${n}_name`, e.target.value)} placeholder="Full name" />
              </div>
            </div>

            <div className={styles.mfgRow}>
              <div className={styles.mfg}>
                <label className={styles.fieldLabel}>Role (EN)</label>
                <input className={styles.fieldInput} value={about[`member${n}_role_en`] ?? ''} onChange={e => set(`member${n}_role_en`, e.target.value)} />
              </div>
              <div className={styles.mfg}>
                <label className={styles.fieldLabel}>Role (AR)</label>
                <input className={styles.fieldInput} dir="rtl" value={about[`member${n}_role_ar`] ?? ''} onChange={e => set(`member${n}_role_ar`, e.target.value)} />
              </div>
            </div>
            <div className={styles.mfgRow}>
              <div className={styles.mfg}>
                <label className={styles.fieldLabel}>Bio (EN)</label>
                <textarea className={styles.fieldInput} rows={3} value={about[`member${n}_bio_en`] ?? ''} onChange={e => set(`member${n}_bio_en`, e.target.value)} style={{ resize: 'vertical' }} />
              </div>
              <div className={styles.mfg}>
                <label className={styles.fieldLabel}>Bio (AR)</label>
                <textarea className={styles.fieldInput} rows={3} dir="rtl" value={about[`member${n}_bio_ar`] ?? ''} onChange={e => set(`member${n}_bio_ar`, e.target.value)} style={{ resize: 'vertical' }} />
              </div>
            </div>
          </div>
        ))}

        {saveError && <p style={{ color: '#E7432B', fontSize: 11, marginTop: 8 }}>{saveError}</p>}
      </div>
    </div>
  )
}

/* ── Hero Editor ── */
function HeroEditor({ showToast }) {
  const DEFAULTS = {
    tag_en: 'Bahrain · Est. 2001 · Bilingual Studio',
    tag_ar: 'البحرين · تأسست ٢٠٠١ · استوديو ثنائي اللغة',
    headline1_en: 'We tell', headline1_ar: 'نحكي',
    headline2_en: 'your story', headline2_ar: 'قصتك',
    accent_en: 'through design', accent_ar: 'بلغة التصميم',
    stat1_num: '20+', stat1_label_en: 'Years in Bahrain', stat1_label_ar: 'عامًا في البحرين',
    stat2_num: '100+', stat2_label_en: 'Publications', stat2_label_ar: 'مطبوعة',
    stat3_num: 'AR+EN', stat3_label_en: 'Bilingual', stat3_label_ar: 'ثنائي اللغة',
    card1_line1: 'Safety with', card1_line2: 'Namool', card1_label: 'BAPCO ENERGIES · HSE', card1_color: '#01A6A6',
    card2_line1: 'خليجية', card2_label: 'GPIC · SINCE 2001', card2_color: '#0058A1',
    card3_line1: 'تطير بلا ريش', card3_line2: 'Flies Without Wings', card3_color: '#773E84',
    card4_line1: 'SDG Booklets', card4_label: 'SDG', card4_color: '#00AEA2',
    card1_image_position: '50% 50%', card2_image_position: '50% 50%', card3_image_position: '50% 50%', card4_image_position: '50% 50%',
    basta_image_position: '50% 50%',
    basta_title: 'البسطة', basta_label: 'AL BASTA · BAHRAIN TV', basta_color: '#E7432B',
    story_en: "Founded in Bahrain in 2001, Top Right has spent over two decades telling the Gulf's stories through design. From children's books to corporate publications, we bring ideas to life — in Arabic and English.",
    story_ar: 'تأسست توب رايت في البحرين عام ٢٠٠١، وقضت أكثر من عقدين في رواية قصص الخليج من خلال التصميم. من كتب الأطفال إلى المطبوعات المؤسسية، نحوّل الأفكار إلى واقع — بالعربية والإنجليزية.',
  }

  const [hero, setHero] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [cardUploading, setCardUploading] = useState({})
  const [cardPreviews, setCardPreviews] = useState({})
  const cardFileRefs = { 1: useRef(), 2: useRef(), 3: useRef(), 4: useRef(), basta: useRef() }

  useEffect(() => {
    fetchHeroContent()
      .then(data => {
        setHero(data ?? DEFAULTS)
        if (data) {
          const p = {}
          ;[1, 2, 3, 4].forEach(n => {
            if (data[`card${n}_image`]) p[n] = getHeroCardImageUrl(data[`card${n}_image`])
          })
          if (data.basta_image) p['basta'] = getHeroCardImageUrl(data.basta_image)
          setCardPreviews(p)
        }
      })
      .catch(() => setHero(DEFAULTS))
      .finally(() => setLoading(false))
  }, [])

  async function handleCardImageUpload(n, file) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = e => setCardPreviews(p => ({ ...p, [n]: e.target.result }))
    reader.readAsDataURL(file)
    setCardUploading(u => ({ ...u, [n]: true }))
    try {
      const filename = await uploadHeroCardImage(file)
      const key = n === 'basta' ? 'basta_image' : `card${n}_image`
      setHero(prev => ({ ...prev, [key]: filename }))
    } catch (err) {
      console.error(err)
    } finally {
      setCardUploading(u => ({ ...u, [n]: false }))
    }
  }

  function set(field, value) { setHero(prev => ({ ...prev, [field]: value })) }

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    try {
      await upsertHeroContent(hero)
      showToast?.('Hero saved', 'Homepage headline updated successfully.')
    } catch (err) {
      setSaveError(err.message ?? 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className={styles.loading}>Loading…</p>

  return (
    <div>
      <div className={styles.pageHd}>
        <div>
          <div className={styles.pageEyebrow}>Website Content</div>
          <h1 className={styles.pageTitle}>Hero Section</h1>
        </div>
        <button className={styles.btnAdd} onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save Changes ↓'}
        </button>
      </div>

      <div className={styles.tableWrap} style={{ padding: 28 }}>
        <div className={styles.mfgRow}>
          <div className={styles.mfg}>
            <label className={styles.fieldLabel}>Eyebrow Tag (EN)</label>
            <input className={styles.fieldInput} value={hero.tag_en ?? ''} onChange={e => set('tag_en', e.target.value)} />
          </div>
          <div className={styles.mfg}>
            <label className={styles.fieldLabel}>Eyebrow Tag (AR)</label>
            <input className={styles.fieldInput} dir="rtl" value={hero.tag_ar ?? ''} onChange={e => set('tag_ar', e.target.value)} />
          </div>
        </div>

        <div className={styles.mfgRow}>
          <div className={styles.mfg}>
            <label className={styles.fieldLabel}>Headline Line 1 (EN)</label>
            <input className={styles.fieldInput} value={hero.headline1_en ?? ''} onChange={e => set('headline1_en', e.target.value)} />
          </div>
          <div className={styles.mfg}>
            <label className={styles.fieldLabel}>Headline Line 1 (AR)</label>
            <input className={styles.fieldInput} dir="rtl" value={hero.headline1_ar ?? ''} onChange={e => set('headline1_ar', e.target.value)} />
          </div>
        </div>

        <div className={styles.mfgRow}>
          <div className={styles.mfg}>
            <label className={styles.fieldLabel}>Headline Line 2 (EN)</label>
            <input className={styles.fieldInput} value={hero.headline2_en ?? ''} onChange={e => set('headline2_en', e.target.value)} />
          </div>
          <div className={styles.mfg}>
            <label className={styles.fieldLabel}>Headline Line 2 (AR)</label>
            <input className={styles.fieldInput} dir="rtl" value={hero.headline2_ar ?? ''} onChange={e => set('headline2_ar', e.target.value)} />
          </div>
        </div>

        <div className={styles.mfgRow}>
          <div className={styles.mfg}>
            <label className={styles.fieldLabel}>Accent Line (EN) — shown in teal</label>
            <input className={styles.fieldInput} value={hero.accent_en ?? ''} onChange={e => set('accent_en', e.target.value)} />
          </div>
          <div className={styles.mfg}>
            <label className={styles.fieldLabel}>Accent Line (AR)</label>
            <input className={styles.fieldInput} dir="rtl" value={hero.accent_ar ?? ''} onChange={e => set('accent_ar', e.target.value)} />
          </div>
        </div>

        <div style={{ marginTop: 16, marginBottom: 8, fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: '#666' }}>Stats</div>

        {[1, 2, 3].map(n => (
          <div key={n} className={styles.mfgRow}>
            <div className={styles.mfg} style={{ maxWidth: 120 }}>
              <label className={styles.fieldLabel}>Stat {n} — Number</label>
              <input className={styles.fieldInput} value={hero[`stat${n}_num`] ?? ''} onChange={e => set(`stat${n}_num`, e.target.value)} />
            </div>
            <div className={styles.mfg}>
              <label className={styles.fieldLabel}>Label (EN)</label>
              <input className={styles.fieldInput} value={hero[`stat${n}_label_en`] ?? ''} onChange={e => set(`stat${n}_label_en`, e.target.value)} />
            </div>
            <div className={styles.mfg}>
              <label className={styles.fieldLabel}>Label (AR)</label>
              <input className={styles.fieldInput} dir="rtl" value={hero[`stat${n}_label_ar`] ?? ''} onChange={e => set(`stat${n}_label_ar`, e.target.value)} />
            </div>
          </div>
        ))}

        <div style={{ marginTop: 24, marginBottom: 8, fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: '#666' }}>Our Story (Why section)</div>
        <div className={styles.mfgRow}>
          <div className={styles.mfg}>
            <label className={styles.fieldLabel}>Story Text (EN)</label>
            <textarea className={styles.fieldInput} rows={4} value={hero.story_en ?? ''} onChange={e => set('story_en', e.target.value)} style={{ resize: 'vertical' }} />
          </div>
          <div className={styles.mfg}>
            <label className={styles.fieldLabel}>Story Text (AR)</label>
            <textarea className={styles.fieldInput} rows={4} dir="rtl" value={hero.story_ar ?? ''} onChange={e => set('story_ar', e.target.value)} style={{ resize: 'vertical' }} />
          </div>
        </div>

        <div style={{ marginTop: 24, marginBottom: 8, fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: '#666' }}>Book Cards (hero right panel)</div>

        {[
          { n: 1, lines: ['line1', 'line2'], hasLabel: true,  pw: 114, ph: 150, rotate: -5 },
          { n: 2, lines: ['line1'], hasLabel: true,           pw: 102, ph: 132, rotate:  4 },
          { n: 3, lines: ['line1', 'line2'], hasLabel: false, pw: 96,  ph: 126, rotate: -3 },
          { n: 4, lines: ['line1'], hasLabel: true,           pw: 93,  ph: 120, rotate:  6 },
        ].map(({ n, lines, hasLabel, pw, ph, rotate }) => (
          <div key={n} style={{ border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, padding: '14px 16px', marginBottom: 10 }}>
            <div style={{ fontSize: 10, letterSpacing: 1, color: '#888', marginBottom: 12 }}>Card {n}</div>

            {/* Image upload row */}
            <div className={styles.mfg} style={{ marginBottom: 12 }}>
              <label className={styles.fieldLabel}>Cover Image (optional)</label>
              <div className={styles.uploadWithPreview}>
                <div
                  className={styles.uploadArea}
                  onClick={() => !cardUploading[n] && cardFileRefs[n].current?.click()}
                >
                  <span style={{ fontSize: 24, opacity: 0.3 }}>↑</span>
                  <span className={styles.uploadAreaText}>
                    {cardUploading[n] ? 'Uploading…' : cardPreviews[n] ? 'Click to replace' : 'Click to upload image'}
                  </span>
                  <span className={styles.uploadAreaHint}>JPG, PNG, WEBP</span>
                </div>
                <div className={styles.cardPreviewWrap}>
                  <div className={styles.cardPreviewLabel}>Card preview</div>
                  <div className={styles.cardPreview}>
                    <div className={styles.cardPreviewThumb} style={{ background: hero[`card${n}_color`] || '#333', width: pw, height: ph, transform: `rotate(${rotate}deg)` }}>
                      {cardPreviews[n]
                        ? <img src={cardPreviews[n]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: hero[`card${n}_image_position`] || '50% 50%' }} />
                        : <div className={styles.cardPreviewEmpty}>No image</div>
                      }
                    </div>
                  </div>
                  {cardPreviews[n] && (
                    <div className={styles.cropSliders}>
                      <CropSlider
                        label="← Horizontal →"
                        value={parseInt((hero[`card${n}_image_position`] || '50% 50%').split(' ')[0]) || 50}
                        onChange={v => {
                          const py = parseInt((hero[`card${n}_image_position`] || '50% 50%').split(' ')[1]) || 50
                          set(`card${n}_image_position`, `${v}% ${py}%`)
                        }}
                        styles={styles}
                      />
                      <CropSlider
                        label="↑ Vertical ↓"
                        value={parseInt((hero[`card${n}_image_position`] || '50% 50%').split(' ')[1]) || 50}
                        onChange={v => {
                          const px = parseInt((hero[`card${n}_image_position`] || '50% 50%').split(' ')[0]) || 50
                          set(`card${n}_image_position`, `${px}% ${v}%`)
                        }}
                        styles={styles}
                      />
                    </div>
                  )}
                  {cardPreviews[n] && (
                    <button
                      style={{ marginTop: 6, fontSize: 10, color: '#E7432B', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      onClick={() => { setCardPreviews(p => ({ ...p, [n]: null })); setHero(prev => ({ ...prev, [`card${n}_image`]: null, [`card${n}_image_position`]: '50% 50%' })) }}
                    >Remove image</button>
                  )}
                </div>
              </div>
              <input ref={cardFileRefs[n]} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleCardImageUpload(n, e.target.files[0])} />
            </div>

            <div className={styles.mfgRow}>
              {lines.map(l => (
                <div key={l} className={styles.mfg}>
                  <label className={styles.fieldLabel}>{l === 'line1' ? 'Title' : 'Subtitle'}</label>
                  <input className={styles.fieldInput} dir={n === 2 && l === 'line1' ? 'rtl' : 'ltr'} value={hero[`card${n}_${l}`] ?? ''} onChange={e => set(`card${n}_${l}`, e.target.value)} />
                </div>
              ))}
              {hasLabel && (
                <div className={styles.mfg}>
                  <label className={styles.fieldLabel}>Small Label</label>
                  <input className={styles.fieldInput} value={hero[`card${n}_label`] ?? ''} onChange={e => set(`card${n}_label`, e.target.value)} />
                </div>
              )}
            </div>
            <div className={styles.mfgRow}>
              <div className={styles.mfg} style={{ maxWidth: 140 }}>
                <label className={styles.fieldLabel}>Card Color</label>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input type="color" value={hero[`card${n}_color`] ?? '#01A6A6'} onChange={e => set(`card${n}_color`, e.target.value)} style={{ width: 36, height: 32, border: 'none', background: 'none', cursor: 'pointer' }} />
                  <input className={styles.fieldInput} value={hero[`card${n}_color`] ?? ''} onChange={e => set(`card${n}_color`, e.target.value)} style={{ flex: 1 }} />
                </div>
              </div>
            </div>
          </div>
        ))}

        {saveError && <p style={{ color: '#E7432B', fontSize: 11, marginTop: 8 }}>{saveError}</p>}
      </div>
    </div>
  )
}

/* ── Why Manager ── */
const EMPTY_WHY = { number: '', title_en: '', title_ar: '', body_en: '', body_ar: '', display_order: 0, is_published: true }

function WhyManager({ showToast }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editItem, setEditItem] = useState(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const dragIdx = useRef(null)

  async function load() {
    setLoading(true)
    const data = await fetchAllWhyItems()
    setItems(data)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function togglePublish(item) {
    const updated = !item.is_published
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_published: updated } : i))
    await updateWhyItem(item.id, { is_published: updated })
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
  async function onDrop() { dragIdx.current = null; await updateWhyOrder(items) }

  function openNew() { setEditItem({ ...EMPTY_WHY, display_order: items.length }); setIsNew(true); setFormErrors({}); setSaveError(null) }
  function openEdit(item) { setEditItem({ ...item }); setIsNew(false); setFormErrors({}); setSaveError(null) }
  function closeEdit() { setEditItem(null); setFormErrors({}); setSaveError(null) }

  function validate() {
    const e = {}
    if (!editItem.title_en?.trim()) e.title_en = 'Title (EN) is required'
    setFormErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSave() {
    if (!validate()) return
    setSaving(true); setSaveError(null)
    try {
      if (isNew) {
        const { id: _id, ...rest } = editItem
        await createWhyItem({ ...rest, display_order: items.length })
        showToast?.('Item added', `"${editItem.title_en}" added.`)
      } else {
        const { id, ...rest } = editItem
        await updateWhyItem(id, rest)
        showToast?.('Item updated', 'Changes saved.')
      }
      closeEdit(); load()
    } catch (err) {
      setSaveError(err.message ?? 'Save failed')
    } finally { setSaving(false) }
  }

  async function handleDelete(item) {
    setSaving(true)
    try {
      await deleteWhyItem(item.id)
      showToast?.('Item removed', `"${item.title_en}" deleted.`)
      setDeleteConfirm(null); load()
    } catch (err) {
      setSaveError(err.message ?? 'Delete failed')
      setDeleteConfirm(null)
    } finally { setSaving(false) }
  }

  if (loading) return <p className={styles.loading}>Loading…</p>

  return (
    <div>
      <div className={styles.pageHd}>
        <div>
          <div className={styles.pageEyebrow}>Website Content</div>
          <h1 className={styles.pageTitle}>Why Top Right?</h1>
        </div>
        <button className={styles.btnAdd} onClick={openNew}>+ Add Item</button>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table} style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: 36 }} /><col style={{ width: 40 }} /><col /><col style={{ width: 110 }} /><col style={{ width: 140 }} />
          </colgroup>
          <thead><tr><th></th><th>#</th><th>Title (EN)</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.id} draggable onDragStart={() => onDragStart(idx)} onDragOver={e => onDragOver(e, idx)} onDrop={onDrop} className={styles.draggableRow}>
                <td className={styles.dragHandle}>⠿</td>
                <td style={{ color: '#666', fontSize: 11 }}>{item.number || String(idx + 1).padStart(2, '0')}</td>
                <td className={styles.tdTitle}>{item.title_en}</td>
                <td>
                  <button className={`${styles.toggle} ${item.is_published ? styles.toggleOn : styles.toggleOff}`} onClick={() => togglePublish(item)}>
                    {item.is_published ? '● Live' : '○ Draft'}
                  </button>
                </td>
                <td>
                  <div className={styles.tdActions}>
                    <button className={`${styles.btnSm} ${styles.btnEdit}`} onClick={() => openEdit(item)}>Edit</button>
                    <button className={`${styles.btnSm} ${styles.btnDel}`} onClick={() => setDeleteConfirm(item)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <div className={styles.empty}>No items yet. Add one above.</div>}
      </div>

      {editItem && (
        <div className={styles.modalOverlay} onClick={e => e.target === e.currentTarget && closeEdit()}>
          <div className={styles.modal}>
            <div className={styles.modalHd}>
              <span className={styles.modalTtl}>{isNew ? 'New Item' : 'Edit Item'}</span>
              <button className={styles.modalClose} onClick={closeEdit}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.mfgRow}>
                <div className={styles.mfg} style={{ maxWidth: 80 }}>
                  <label className={styles.fieldLabel}>Number</label>
                  <input className={styles.fieldInput} placeholder="01" value={editItem.number} onChange={e => setEditItem(p => ({ ...p, number: e.target.value }))} />
                </div>
                <div className={styles.mfg}>
                  <label className={styles.fieldLabel}>Title (EN) *</label>
                  <input className={`${styles.fieldInput} ${formErrors.title_en ? styles.fieldInputErr : ''}`} value={editItem.title_en} onChange={e => setEditItem(p => ({ ...p, title_en: e.target.value }))} />
                  {formErrors.title_en && <span className={styles.fieldErr}>{formErrors.title_en}</span>}
                </div>
                <div className={styles.mfg}>
                  <label className={styles.fieldLabel}>Title (AR)</label>
                  <input className={styles.fieldInput} dir="rtl" value={editItem.title_ar} onChange={e => setEditItem(p => ({ ...p, title_ar: e.target.value }))} />
                </div>
              </div>
              <div className={styles.mfg}>
                <label className={styles.fieldLabel}>Body (EN)</label>
                <textarea className={styles.fieldInput} style={{ height: 72, resize: 'none' }} value={editItem.body_en} onChange={e => setEditItem(p => ({ ...p, body_en: e.target.value }))} />
              </div>
              <div className={styles.mfg}>
                <label className={styles.fieldLabel}>Body (AR)</label>
                <textarea className={styles.fieldInput} dir="rtl" style={{ height: 72, resize: 'none' }} value={editItem.body_ar} onChange={e => setEditItem(p => ({ ...p, body_ar: e.target.value }))} />
              </div>
              <div className={styles.mfgRow}>
                <div className={styles.mfg}>
                  <label className={styles.fieldLabel}>Visibility</label>
                  <select className={styles.fieldInput} value={editItem.is_published ? 'live' : 'draft'} onChange={e => setEditItem(p => ({ ...p, is_published: e.target.value === 'live' }))}>
                    <option value="live">Live</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              {saveError && <span className={styles.fieldErr} style={{ marginRight: 'auto' }}>{saveError}</span>}
              <button className={styles.btnSecondary} onClick={closeEdit}>Cancel</button>
              <button className={styles.btnAdd} onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : isNew ? 'Add Item' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className={styles.modalOverlay} onClick={() => setDeleteConfirm(null)}>
          <div className={styles.modal} style={{ width: 400 }} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHd}>
              <h2 className={styles.modalTtl}>Delete Item?</h2>
              <button className={styles.modalClose} onClick={() => setDeleteConfirm(null)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <p style={{ color: '#888', fontSize: 13, lineHeight: 1.6 }}>"{deleteConfirm.title_en}" will be permanently removed.</p>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className={`${styles.btnSm} ${styles.btnDel}`} style={{ padding: '10px 20px' }} onClick={() => handleDelete(deleteConfirm)} disabled={saving}>
                {saving ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Services Manager ── */
function ServicesManager({ showToast }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editItem, setEditItem] = useState(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const dragIdx = useRef(null)

  async function load() {
    setLoading(true)
    const data = await fetchAllServices()
    setItems(data)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function togglePublish(item) {
    const updated = !item.is_published
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_published: updated } : i))
    await updateService(item.id, { is_published: updated })
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
    await updateServicesOrder(items)
  }

  function openNew() {
    setEditItem({ ...EMPTY_SERVICE, display_order: items.length })
    setIsNew(true)
    setFormErrors({})
    setSaveError(null)
  }
  function openEdit(item) {
    setEditItem({ ...item })
    setIsNew(false)
    setFormErrors({})
    setSaveError(null)
  }
  function closeEdit() {
    setEditItem(null)
    setFormErrors({})
    setSaveError(null)
  }

  function validate() {
    const e = {}
    if (!editItem.title_en?.trim()) e.title_en = 'Service name (EN) is required'
    setFormErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSave() {
    if (!validate()) return
    setSaving(true)
    setSaveError(null)
    try {
      if (isNew) {
        const { id: _id, ...rest } = editItem
        await createService({ ...rest, display_order: items.length })
        showToast?.('Service added', `"${editItem.title_en}" added successfully.`)
      } else {
        const { id, ...rest } = editItem
        await updateService(id, rest)
        showToast?.('Service updated', 'Changes saved successfully.')
      }
      closeEdit()
      load()
    } catch (err) {
      setSaveError(err.message ?? 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(item) {
    setSaving(true)
    try {
      await deleteService(item.id)
      showToast?.('Service removed', `"${item.title_en}" has been deleted.`)
      setDeleteConfirm(null)
      load()
    } catch (err) {
      setSaveError(err.message ?? 'Delete failed')
      setDeleteConfirm(null)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className={styles.loading}>Loading…</p>

  return (
    <div>
      <div className={styles.pageHd}>
        <div>
          <div className={styles.pageEyebrow}>Website Content</div>
          <h1 className={styles.pageTitle}>Services</h1>
        </div>
        <button className={styles.btnAdd} onClick={openNew}>+ Add Service</button>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table} style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: 36 }} />
            <col style={{ width: 32 }} />
            <col />
            <col style={{ width: 100 }} />
            <col style={{ width: 110 }} />
            <col style={{ width: 140 }} />
          </colgroup>
          <thead>
            <tr>
              <th></th>
              <th>#</th>
              <th>Service Name</th>
              <th>Colour</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr
                key={item.id}
                draggable
                onDragStart={() => onDragStart(idx)}
                onDragOver={e => onDragOver(e, idx)}
                onDrop={onDrop}
                className={styles.draggableRow}
              >
                <td className={styles.dragHandle}>⠿</td>
                <td style={{ color: '#666', fontSize: 11 }}>{String(idx + 1).padStart(2, '0')}</td>
                <td className={styles.tdTitle}>{item.title_en}</td>
                <td>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      display: 'inline-block', width: 14, height: 14,
                      background: item.card_color,
                      border: '1px solid rgba(255,255,255,.15)',
                      flexShrink: 0,
                    }} />
                    <span style={{ fontSize: 11, color: '#888' }}>{item.card_color}</span>
                  </span>
                </td>
                <td>
                  <button
                    className={`${styles.toggle} ${item.is_published ? styles.toggleOn : styles.toggleOff}`}
                    onClick={() => togglePublish(item)}
                  >
                    {item.is_published ? '● Live' : '○ Draft'}
                  </button>
                </td>
                <td>
                  <div className={styles.tdActions}>
                    <button className={`${styles.btnSm} ${styles.btnEdit}`} onClick={() => openEdit(item)}>Edit</button>
                    <button className={`${styles.btnSm} ${styles.btnDel}`} onClick={() => setDeleteConfirm(item)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <div className={styles.empty}>No services yet. Add one above.</div>}
      </div>

      {editItem && (
        <div className={styles.modalOverlay} onClick={e => e.target === e.currentTarget && closeEdit()}>
          <div className={styles.modal}>
            <div className={styles.modalHd}>
              <span className={styles.modalTtl}>{isNew ? 'Add Service' : 'Edit Service'}</span>
              <button className={styles.modalClose} onClick={closeEdit}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.mfgRow}>
                <div className={styles.mfg}>
                  <label className={styles.fieldLabel}>Service Name (EN) *</label>
                  <input
                    className={`${styles.fieldInput} ${formErrors.title_en ? styles.fieldInputErr : ''}`}
                    type="text"
                    placeholder="e.g. Publication Design"
                    value={editItem.title_en}
                    onChange={e => setEditItem(p => ({ ...p, title_en: e.target.value }))}
                  />
                  {formErrors.title_en && <span className={styles.fieldErr}>{formErrors.title_en}</span>}
                </div>
                <div className={styles.mfg}>
                  <label className={styles.fieldLabel}>Service Name (AR)</label>
                  <input
                    className={styles.fieldInput}
                    type="text"
                    dir="rtl"
                    placeholder="بالعربي"
                    value={editItem.title_ar}
                    onChange={e => setEditItem(p => ({ ...p, title_ar: e.target.value }))}
                  />
                </div>
              </div>

              <div className={styles.mfg}>
                <label className={styles.fieldLabel}>Card Color</label>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input type="color" value={editItem.card_color ?? '#E7432B'} onChange={e => setEditItem(p => ({ ...p, card_color: e.target.value }))} style={{ width: 40, height: 36, border: 'none', background: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }} />
                  <input className={styles.fieldInput} value={editItem.card_color ?? ''} onChange={e => setEditItem(p => ({ ...p, card_color: e.target.value }))} placeholder="#E7432B" style={{ flex: 1 }} />
                </div>
              </div>

              <div className={styles.mfgRow}>
                <div className={styles.mfg}>
                  <label className={styles.fieldLabel}>Tag Label</label>
                  <input
                    className={styles.fieldInput}
                    type="text"
                    placeholder="e.g. PUBLICATIONS"
                    value={editItem.tag_label}
                    onChange={e => setEditItem(p => ({ ...p, tag_label: e.target.value }))}
                  />
                </div>
                <div className={styles.mfg}>
                  <label className={styles.fieldLabel}>Order Number</label>
                  <input
                    className={styles.fieldInput}
                    type="number"
                    min={1}
                    placeholder="1–6"
                    value={editItem.display_order}
                    onChange={e => setEditItem(p => ({ ...p, display_order: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div className={styles.mfg}>
                <label className={styles.fieldLabel}>Description (EN)</label>
                <textarea
                  className={styles.fieldInput}
                  style={{ height: 80, resize: 'none' }}
                  placeholder="Service description…"
                  value={editItem.description_en}
                  onChange={e => setEditItem(p => ({ ...p, description_en: e.target.value }))}
                />
              </div>
              <div className={styles.mfg}>
                <label className={styles.fieldLabel}>Description (AR)</label>
                <textarea
                  className={styles.fieldInput}
                  style={{ height: 80, resize: 'none' }}
                  dir="rtl"
                  placeholder="وصف الخدمة…"
                  value={editItem.description_ar}
                  onChange={e => setEditItem(p => ({ ...p, description_ar: e.target.value }))}
                />
              </div>
            </div>
            <div className={styles.modalFooter}>
              {saveError && <span className={styles.fieldErr} style={{ marginRight: 'auto' }}>{saveError}</span>}
              <button className={styles.btnSecondary} onClick={closeEdit}>Cancel</button>
              <button className={styles.btnAdd} onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : isNew ? 'Add Service' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className={styles.modalOverlay} onClick={() => setDeleteConfirm(null)}>
          <div className={styles.modal} style={{ width: 400 }} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHd}>
              <h2 className={styles.modalTtl}>Delete Service?</h2>
              <button className={styles.modalClose} onClick={() => setDeleteConfirm(null)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <p style={{ color: '#888', fontSize: 13, lineHeight: 1.6 }}>
                "{deleteConfirm.title_en}" will be permanently removed.
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className={`${styles.btnSm} ${styles.btnDel}`} style={{ padding: '10px 20px' }} onClick={() => handleDelete(deleteConfirm)} disabled={saving}>
                {saving ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Testimonials Manager ── */
function TestimonialsManager({ showToast }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editItem, setEditItem] = useState(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const dragIdx = useRef(null)

  async function load() {
    setLoading(true)
    const data = await fetchAllTestimonials()
    setItems(data)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function togglePublish(item) {
    const updated = !item.is_published
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_published: updated } : i))
    await updateTestimonial(item.id, { is_published: updated })
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
    await updateTestimonialsOrder(items)
  }

  function openNew() {
    setEditItem({ ...EMPTY_TESTIMONIAL, display_order: items.length })
    setIsNew(true)
    setFormErrors({})
    setSaveError(null)
  }
  function openEdit(item) {
    setEditItem({ ...item })
    setIsNew(false)
    setFormErrors({})
    setSaveError(null)
  }
  function closeEdit() {
    setEditItem(null)
    setFormErrors({})
    setSaveError(null)
  }

  function validate() {
    const e = {}
    if (!editItem.quote_en?.trim()) e.quote_en = 'Quote (EN) is required'
    if (!editItem.name?.trim()) e.name = 'Person name / role is required'
    setFormErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSave() {
    if (!validate()) return
    setSaving(true)
    setSaveError(null)
    try {
      if (isNew) {
        const { id: _id, ...rest } = editItem
        await createTestimonial({ ...rest, display_order: items.length })
        showToast?.('Testimonial added', 'New quote added successfully.')
      } else {
        const { id, ...rest } = editItem
        await updateTestimonial(id, rest)
        showToast?.('Testimonial updated', 'Changes saved successfully.')
      }
      try { sessionStorage.removeItem('home_data_cache') } catch {}
      closeEdit()
      load()
    } catch (err) {
      setSaveError(err.message ?? 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(item) {
    setSaving(true)
    try {
      await deleteTestimonial(item.id)
      showToast?.('Testimonial removed', 'Quote has been deleted.')
      try { sessionStorage.removeItem('home_data_cache') } catch {}
      setDeleteConfirm(null)
      load()
    } catch (err) {
      setSaveError(err.message ?? 'Delete failed')
      setDeleteConfirm(null)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className={styles.loading}>Loading…</p>

  return (
    <div>
      <div className={styles.pageHd}>
        <div>
          <div className={styles.pageEyebrow}>Website Content</div>
          <h1 className={styles.pageTitle}>Testimonials</h1>
        </div>
        <button className={styles.btnAdd} onClick={openNew}>+ Add Testimonial</button>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table} style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: 36 }} />
            <col style={{ width: 28 }} />
            <col />
            <col style={{ width: 160 }} />
            <col style={{ width: 130 }} />
            <col style={{ width: 110 }} />
            <col style={{ width: 140 }} />
          </colgroup>
          <thead>
            <tr>
              <th></th>
              <th></th>
              <th>Quote (excerpt)</th>
              <th>Name / Role</th>
              <th>Company</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
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
                  <span style={{
                    display: 'inline-block', width: 26, height: 26,
                    background: item.avatar_color ?? '#E7432B',
                    borderRadius: '50%',
                    fontSize: 11, fontWeight: 700, color: '#fff',
                    textAlign: 'center', lineHeight: '26px',
                  }}>
                    {item.name?.[0]?.toUpperCase() ?? '?'}
                  </span>
                </td>
                <td style={{ fontSize: 11, color: '#888', fontStyle: 'italic', whiteSpace: 'normal', lineHeight: 1.5 }}>
                  "{item.quote_en?.slice(0, 60)}{item.quote_en?.length > 60 ? '…' : ''}"
                </td>
                <td className={styles.tdTitle} style={{ fontSize: 11 }}>{item.name}</td>
                <td style={{ fontSize: 11, color: '#888' }}>{item.company}</td>
                <td>
                  <button
                    className={`${styles.toggle} ${item.is_published ? styles.toggleOn : styles.toggleOff}`}
                    onClick={() => togglePublish(item)}
                  >
                    {item.is_published ? '● Live' : '○ Draft'}
                  </button>
                </td>
                <td>
                  <div className={styles.tdActions}>
                    <button className={`${styles.btnSm} ${styles.btnEdit}`} onClick={() => openEdit(item)}>Edit</button>
                    <button className={`${styles.btnSm} ${styles.btnDel}`} onClick={() => setDeleteConfirm(item)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <div className={styles.empty}>No testimonials yet. Add one above.</div>}
      </div>

      {editItem && (
        <div className={styles.modalOverlay} onClick={e => e.target === e.currentTarget && closeEdit()}>
          <div className={styles.modal}>
            <div className={styles.modalHd}>
              <span className={styles.modalTtl}>{isNew ? 'Add Testimonial' : 'Edit Testimonial'}</span>
              <button className={styles.modalClose} onClick={closeEdit}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.mfg}>
                <label className={styles.fieldLabel}>Quote (EN) *</label>
                <textarea
                  className={`${styles.fieldInput} ${formErrors.quote_en ? styles.fieldInputErr : ''}`}
                  style={{ height: 90, resize: 'none' }}
                  placeholder="Client quote in English…"
                  value={editItem.quote_en}
                  onChange={e => setEditItem(p => ({ ...p, quote_en: e.target.value }))}
                />
                {formErrors.quote_en && <span className={styles.fieldErr}>{formErrors.quote_en}</span>}
              </div>
              <div className={styles.mfg}>
                <label className={styles.fieldLabel}>Quote (AR)</label>
                <textarea
                  className={styles.fieldInput}
                  style={{ height: 90, resize: 'none' }}
                  dir="rtl"
                  placeholder="اقتباس العميل بالعربية…"
                  value={editItem.quote_ar}
                  onChange={e => setEditItem(p => ({ ...p, quote_ar: e.target.value }))}
                />
              </div>
              <div className={styles.mfgRow}>
                <div className={styles.mfg}>
                  <label className={styles.fieldLabel}>Person Name / Role *</label>
                  <input
                    className={`${styles.fieldInput} ${formErrors.name ? styles.fieldInputErr : ''}`}
                    type="text"
                    placeholder="e.g. HSE Manager"
                    value={editItem.name}
                    onChange={e => setEditItem(p => ({ ...p, name: e.target.value }))}
                  />
                  {formErrors.name && <span className={styles.fieldErr}>{formErrors.name}</span>}
                </div>
                <div className={styles.mfg}>
                  <label className={styles.fieldLabel}>Company</label>
                  <input
                    className={styles.fieldInput}
                    type="text"
                    placeholder="e.g. Bapco Energies"
                    value={editItem.company}
                    onChange={e => setEditItem(p => ({ ...p, company: e.target.value }))}
                  />
                </div>
              </div>
              <div className={styles.mfgRow}>
                <div className={styles.mfg}>
                  <label className={styles.fieldLabel}>Avatar Color</label>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <input type="color" value={editItem.avatar_color ?? '#E7432B'} onChange={e => setEditItem(p => ({ ...p, avatar_color: e.target.value }))} style={{ width: 40, height: 36, border: 'none', background: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }} />
                    <input className={styles.fieldInput} value={editItem.avatar_color ?? ''} onChange={e => setEditItem(p => ({ ...p, avatar_color: e.target.value }))} placeholder="#E7432B" style={{ flex: 1 }} />
                  </div>
                </div>
                <div className={styles.mfg}>
                  <label className={styles.fieldLabel}>Visibility</label>
                  <select
                    className={styles.fieldInput}
                    value={editItem.is_published ? 'live' : 'draft'}
                    onChange={e => setEditItem(p => ({ ...p, is_published: e.target.value === 'live' }))}
                  >
                    <option value="live">Live</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              {saveError && <span className={styles.fieldErr} style={{ marginRight: 'auto' }}>{saveError}</span>}
              <button className={styles.btnSecondary} onClick={closeEdit}>Cancel</button>
              <button className={styles.btnAdd} onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : isNew ? 'Add Testimonial' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className={styles.modalOverlay} onClick={() => setDeleteConfirm(null)}>
          <div className={styles.modal} style={{ width: 400 }} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHd}>
              <h2 className={styles.modalTtl}>Delete Testimonial?</h2>
              <button className={styles.modalClose} onClick={() => setDeleteConfirm(null)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <p style={{ color: '#888', fontSize: 13, lineHeight: 1.6 }}>
                This quote will be permanently removed from the site.
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className={`${styles.btnSm} ${styles.btnDel}`} style={{ padding: '10px 20px' }} onClick={() => handleDelete(deleteConfirm)} disabled={saving}>
                {saving ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Contact Info Editor ── */
function ContactInfoEditor({ showToast }) {
  const [info, setInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  async function load() {
    setLoading(true)
    const data = await fetchContactInfo()
    setInfo(data ?? {
      email: '', phone_primary: '', phone_secondary: '', whatsapp: '',
      address_en: '', address_ar: '', cr_number: '',
      label_en: 'Get in touch', label_ar: 'تواصل معنا',
      section_title_en: '', section_title_ar: '',
      description_en: '', description_ar: '',
    })
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  function set(field, value) {
    setInfo(prev => ({ ...prev, [field]: value }))
    setSaved(false)
    setFieldErrors(prev => ({ ...prev, [field]: null }))
  }

  function validate() {
    const e = {}
    if (info.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email.trim())) e.email = 'Invalid email address'
    const phoneRe = /^[+\d][\d\s\-().]{6,}$/
    if (info.phone_primary && !phoneRe.test(info.phone_primary.trim())) e.phone_primary = 'Invalid phone number'
    if (info.phone_secondary && !phoneRe.test(info.phone_secondary.trim())) e.phone_secondary = 'Invalid phone number'
    if (info.whatsapp && !phoneRe.test(info.whatsapp.trim())) e.whatsapp = 'Invalid WhatsApp number'
    setFieldErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSave() {
    if (!validate()) return
    setSaving(true)
    setSaveError(null)
    try {
      await upsertContactInfo(info)
      setSaved(true)
      showToast?.('Saved', 'Contact info updated successfully.')
      load()
    } catch (err) {
      setSaveError(err.message ?? 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className={styles.loading}>Loading…</p>

  return (
    <div>
      <div className={styles.pageHd}>
        <div>
          <div className={styles.pageEyebrow}>Pages</div>
          <h1 className={styles.pageTitle}>Contact Info</h1>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          <button className={styles.btnAdd} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Changes'}
          </button>
          {saveError && <span className={styles.fieldErr}>{saveError}</span>}
        </div>
      </div>

      <div className={styles.tableWrap} style={{ padding: 28 }}>
        <div className={styles.mfgRow}>
          <div className={styles.mfg}>
            <label className={styles.fieldLabel}>Email Address</label>
            <input
              className={`${styles.fieldInput} ${fieldErrors.email ? styles.fieldInputErr : ''}`}
              type="email"
              placeholder="hello@topright.bh"
              value={info.email ?? ''}
              onChange={e => set('email', e.target.value)}
            />
            {fieldErrors.email && <span className={styles.fieldErr}>{fieldErrors.email}</span>}
          </div>
          <div className={styles.mfg}>
            <label className={styles.fieldLabel}>Phone</label>
            <input
              className={`${styles.fieldInput} ${fieldErrors.phone_primary ? styles.fieldInputErr : ''}`}
              type="text"
              placeholder="(+973) 36622100 / 17566726"
              value={info.phone_primary ?? ''}
              onChange={e => set('phone_primary', e.target.value)}
            />
            {fieldErrors.phone_primary && <span className={styles.fieldErr}>{fieldErrors.phone_primary}</span>}
          </div>
        </div>

        <div className={styles.mfgRow}>
          <div className={styles.mfg}>
            <label className={styles.fieldLabel}>WhatsApp Number</label>
            <input
              className={`${styles.fieldInput} ${fieldErrors.whatsapp ? styles.fieldInputErr : ''}`}
              type="text"
              placeholder="(+973) 36622100"
              value={info.whatsapp ?? ''}
              onChange={e => set('whatsapp', e.target.value)}
            />
            {fieldErrors.whatsapp && <span className={styles.fieldErr}>{fieldErrors.whatsapp}</span>}
          </div>
          <div className={styles.mfg}>
            <label className={styles.fieldLabel}>Location</label>
            <input
              className={styles.fieldInput}
              type="text"
              placeholder="Bahrain · CR: 46817-1"
              value={[info.address_en, info.cr_number ? `CR: ${info.cr_number}` : ''].filter(Boolean).join(' · ')}
              onChange={e => set('address_en', e.target.value)}
            />
          </div>
        </div>

        <div style={{ marginTop: 8, marginBottom: 8, fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: '#666' }}>Get in Touch Section</div>
        <div className={styles.mfgRow}>
          <div className={styles.mfg}>
            <label className={styles.fieldLabel}>Eyebrow Label (EN) — "Get in touch"</label>
            <input className={styles.fieldInput} type="text" placeholder="Get in touch" value={info.label_en ?? ''} onChange={e => set('label_en', e.target.value)} />
          </div>
          <div className={styles.mfg}>
            <label className={styles.fieldLabel}>Eyebrow Label (AR) — "تواصل معنا"</label>
            <input className={styles.fieldInput} type="text" dir="rtl" placeholder="تواصل معنا" value={info.label_ar ?? ''} onChange={e => set('label_ar', e.target.value)} />
          </div>
        </div>

        <div className={styles.mfg}>
          <label className={styles.fieldLabel}>Section Title (EN)</label>
          <input
            className={styles.fieldInput}
            type="text"
            placeholder="Let's work together"
            value={info.section_title_en ?? ''}
            onChange={e => set('section_title_en', e.target.value)}
          />
        </div>

        <div className={styles.mfg}>
          <label className={styles.fieldLabel}>Section Title (AR)</label>
          <input
            className={styles.fieldInput}
            type="text"
            dir="rtl"
            placeholder="لنعمل معًا"
            value={info.section_title_ar ?? ''}
            onChange={e => set('section_title_ar', e.target.value)}
          />
        </div>

        <div className={styles.mfg}>
          <label className={styles.fieldLabel}>Description (EN)</label>
          <textarea
            className={styles.fieldInput}
            rows={3}
            placeholder="Tell us about your project and we will get back to you within 24 hours…"
            value={info.description_en ?? ''}
            onChange={e => set('description_en', e.target.value)}
          />
        </div>

        <div className={styles.mfg}>
          <label className={styles.fieldLabel}>Description (AR)</label>
          <textarea
            className={styles.fieldInput}
            rows={3}
            dir="rtl"
            placeholder="أخبرنا عن مشروعك وسنعود إليك خلال ٢٤ ساعة…"
            value={info.description_ar ?? ''}
            onChange={e => set('description_ar', e.target.value)}
          />
        </div>

        <div className={styles.mfgRow}>
          <div className={styles.mfg}>
            <label className={styles.fieldLabel}>Phone (Secondary)</label>
            <input
              className={`${styles.fieldInput} ${fieldErrors.phone_secondary ? styles.fieldInputErr : ''}`}
              type="text"
              placeholder="(+973) 17566726"
              value={info.phone_secondary ?? ''}
              onChange={e => set('phone_secondary', e.target.value)}
            />
            {fieldErrors.phone_secondary && <span className={styles.fieldErr}>{fieldErrors.phone_secondary}</span>}
          </div>
          <div className={styles.mfg}>
            <label className={styles.fieldLabel}>CR Number</label>
            <input
              className={styles.fieldInput}
              type="text"
              placeholder="46817-1"
              value={info.cr_number ?? ''}
              onChange={e => set('cr_number', e.target.value)}
            />
          </div>
        </div>

        <div className={styles.mfg}>
          <label className={styles.fieldLabel}>Address (AR)</label>
          <input
            className={styles.fieldInput}
            type="text"
            dir="rtl"
            placeholder="البحرين"
            value={info.address_ar ?? ''}
            onChange={e => set('address_ar', e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}

/* ── Footer Editor ── */
function FooterEditor({ showToast }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  async function load() {
    setLoading(true)
    const d = await fetchFooter()
    const DEFAULTS = {
      description_en: '', description_ar: '', copyright_text: '',
      services_heading_en: 'Services', services_heading_ar: 'الخدمات',
      portfolio_heading_en: 'Portfolio', portfolio_heading_ar: 'أعمالنا',
      contact_heading_en: 'Contact', contact_heading_ar: 'تواصل',
      instagram_url: '', whatsapp_url: '', linkedin_url: '',
      services_links: JSON.stringify([
        { en: 'Publication Design', ar: 'تصميم المطبوعات', url: '/#services' },
        { en: 'Illustration & Art', ar: 'الرسم التوضيحي', url: '/#services' },
        { en: 'Animation', ar: 'الرسوم المتحركة', url: '/#services' },
        { en: 'Corporate Books', ar: 'الكتب المؤسسية', url: '/#services' },
        { en: 'Digital Publications', ar: 'المنشورات الرقمية', url: '/#services' },
        { en: 'Coaching', ar: 'التدريب', url: '/#coaching' },
      ]),
      portfolio_links: JSON.stringify([
        { en: "Children's Books", ar: 'كتب الأطفال', url: '/#work' },
        { en: 'HSE Publications', ar: 'مطبوعات السلامة المهنية', url: '/#work' },
        { en: 'Corporate', ar: 'مؤسسي', url: '/#work' },
        { en: 'Illustration', ar: 'الرسم التوضيحي', url: '/#work' },
        { en: 'Animation', ar: 'الرسوم المتحركة', url: '/#work' },
      ]),
    }
    setData(d ? { ...DEFAULTS, ...d } : DEFAULTS)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  function set(field, value) {
    setData(prev => ({ ...prev, [field]: value }))
    setSaved(false)
    setFieldErrors(prev => ({ ...prev, [field]: null }))
  }

  function parseLinks(col) {
    try { return JSON.parse(data?.[col] || '[]') } catch { return [] }
  }

  function setLinks(col, links) {
    set(col, JSON.stringify(links))
  }

  function addLink(col) {
    setLinks(col, [...parseLinks(col), { en: '', ar: '', url: '' }])
  }

  function updateLink(col, idx, field, val) {
    const links = parseLinks(col)
    links[idx] = { ...links[idx], [field]: val }
    setLinks(col, links)
  }

  function removeLink(col, idx) {
    setLinks(col, parseLinks(col).filter((_, i) => i !== idx))
  }

  function validate() {
    const e = {}
    if (!data.description_en?.trim() && !data.description_ar?.trim()) e.description_en = 'At least one description (EN or AR) is required'
    if (!data.copyright_text?.trim()) e.copyright_text = 'Copyright line is required'
    setFieldErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSave() {
    if (!validate()) return
    setSaving(true)
    setSaveError(null)
    try {
      await upsertFooter(data)
      setSaved(true)
      showToast?.('Saved', 'Footer updated successfully.')
      load()
    } catch (err) {
      setSaveError(err.message ?? 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className={styles.loading}>Loading…</p>

  return (
    <div>
      <div className={styles.pageHd}>
        <div>
          <div className={styles.pageEyebrow}>Pages</div>
          <h1 className={styles.pageTitle}>Footer</h1>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          <button className={styles.btnAdd} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Changes'}
          </button>
          {saveError && <span className={styles.fieldErr}>{saveError}</span>}
        </div>
      </div>

      <div className={styles.tableWrap} style={{ padding: 28 }}>
        <div className={styles.mfg}>
          <label className={styles.fieldLabel}>About Text (EN)</label>
          <textarea
            className={`${styles.fieldInput} ${fieldErrors.description_en ? styles.fieldInputErr : ''}`}
            rows={3}
            placeholder="A Bahraini creative studio…"
            value={data.description_en ?? ''}
            onChange={e => set('description_en', e.target.value)}
          />
          {fieldErrors.description_en && <span className={styles.fieldErr}>{fieldErrors.description_en}</span>}
        </div>
        <div className={styles.mfg}>
          <label className={styles.fieldLabel}>About Text (AR)</label>
          <textarea
            className={styles.fieldInput}
            rows={3}
            dir="rtl"
            placeholder="استوديو إبداعي بحريني…"
            value={data.description_ar ?? ''}
            onChange={e => set('description_ar', e.target.value)}
          />
        </div>
        <div className={styles.mfg}>
          <label className={styles.fieldLabel}>Copyright Line *</label>
          <input
            className={`${styles.fieldInput} ${fieldErrors.copyright_text ? styles.fieldInputErr : ''}`}
            type="text"
            placeholder="© 2025 TopRight Design & Support Services · Bahrain · CR: 46817-1"
            value={data.copyright_text ?? ''}
            onChange={e => set('copyright_text', e.target.value)}
          />
          {fieldErrors.copyright_text && <span className={styles.fieldErr}>{fieldErrors.copyright_text}</span>}
        </div>

        <div style={{ marginTop: 24, marginBottom: 8, fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: '#666' }}>Footer Column Headings</div>
        <div className={styles.mfgRow}>
          <div className={styles.mfg}>
            <label className={styles.fieldLabel}>Services Heading (EN)</label>
            <input className={styles.fieldInput} value={data.services_heading_en ?? 'Services'} onChange={e => set('services_heading_en', e.target.value)} />
          </div>
          <div className={styles.mfg}>
            <label className={styles.fieldLabel}>Services Heading (AR)</label>
            <input className={styles.fieldInput} dir="rtl" value={data.services_heading_ar ?? 'الخدمات'} onChange={e => set('services_heading_ar', e.target.value)} />
          </div>
        </div>
        <div className={styles.mfgRow}>
          <div className={styles.mfg}>
            <label className={styles.fieldLabel}>Portfolio Heading (EN)</label>
            <input className={styles.fieldInput} value={data.portfolio_heading_en ?? 'Portfolio'} onChange={e => set('portfolio_heading_en', e.target.value)} />
          </div>
          <div className={styles.mfg}>
            <label className={styles.fieldLabel}>Portfolio Heading (AR)</label>
            <input className={styles.fieldInput} dir="rtl" value={data.portfolio_heading_ar ?? 'أعمالنا'} onChange={e => set('portfolio_heading_ar', e.target.value)} />
          </div>
        </div>
        <div className={styles.mfgRow}>
          <div className={styles.mfg}>
            <label className={styles.fieldLabel}>Contact Heading (EN)</label>
            <input className={styles.fieldInput} value={data.contact_heading_en ?? 'Contact'} onChange={e => set('contact_heading_en', e.target.value)} />
          </div>
          <div className={styles.mfg}>
            <label className={styles.fieldLabel}>Contact Heading (AR)</label>
            <input className={styles.fieldInput} dir="rtl" value={data.contact_heading_ar ?? 'تواصل'} onChange={e => set('contact_heading_ar', e.target.value)} />
          </div>
        </div>

        {/* ── Services links editor ── */}
        <div style={{ marginTop: 24, marginBottom: 8, fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: '#666' }}>Services Column Links</div>
        {parseLinks('services_links').map((lnk, idx) => (
          <div key={idx} className={styles.mfgRow} style={{ alignItems: 'center', marginBottom: 6 }}>
            <div className={styles.mfg}>
              <input className={styles.fieldInput} placeholder="Label (EN)" value={lnk.en} onChange={e => updateLink('services_links', idx, 'en', e.target.value)} />
            </div>
            <div className={styles.mfg}>
              <input className={styles.fieldInput} placeholder="العنوان (AR)" dir="rtl" value={lnk.ar} onChange={e => updateLink('services_links', idx, 'ar', e.target.value)} />
            </div>
            <div className={styles.mfg}>
              <input className={styles.fieldInput} placeholder="URL" value={lnk.url} onChange={e => updateLink('services_links', idx, 'url', e.target.value)} />
            </div>
            <button onClick={() => removeLink('services_links', idx)} style={{ background: 'none', border: 'none', color: '#E7432B', cursor: 'pointer', fontSize: 16, flexShrink: 0, padding: '0 8px' }}>✕</button>
          </div>
        ))}
        <button onClick={() => addLink('services_links')} style={{ background: 'none', border: '1px dashed #444', color: '#888', fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', padding: '7px 16px', cursor: 'pointer', marginBottom: 16 }}>+ Add Service Link</button>

        {/* ── Portfolio links editor ── */}
        <div style={{ marginTop: 8, marginBottom: 8, fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: '#666' }}>Portfolio Column Links</div>
        {parseLinks('portfolio_links').map((lnk, idx) => (
          <div key={idx} className={styles.mfgRow} style={{ alignItems: 'center', marginBottom: 6 }}>
            <div className={styles.mfg}>
              <input className={styles.fieldInput} placeholder="Label (EN)" value={lnk.en} onChange={e => updateLink('portfolio_links', idx, 'en', e.target.value)} />
            </div>
            <div className={styles.mfg}>
              <input className={styles.fieldInput} placeholder="العنوان (AR)" dir="rtl" value={lnk.ar} onChange={e => updateLink('portfolio_links', idx, 'ar', e.target.value)} />
            </div>
            <div className={styles.mfg}>
              <input className={styles.fieldInput} placeholder="URL" value={lnk.url} onChange={e => updateLink('portfolio_links', idx, 'url', e.target.value)} />
            </div>
            <button onClick={() => removeLink('portfolio_links', idx)} style={{ background: 'none', border: 'none', color: '#E7432B', cursor: 'pointer', fontSize: 16, flexShrink: 0, padding: '0 8px' }}>✕</button>
          </div>
        ))}
        <button onClick={() => addLink('portfolio_links')} style={{ background: 'none', border: '1px dashed #444', color: '#888', fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', padding: '7px 16px', cursor: 'pointer', marginBottom: 16 }}>+ Add Portfolio Link</button>

        <div style={{ marginTop: 8, marginBottom: 8, fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: '#666' }}>Social Links</div>
        <div className={styles.mfgRow}>
          <div className={styles.mfg}>
            <label className={styles.fieldLabel}>Instagram URL</label>
            <input className={styles.fieldInput} type="url" placeholder="https://instagram.com/topright" value={data.instagram_url ?? ''} onChange={e => set('instagram_url', e.target.value)} />
          </div>
          <div className={styles.mfg}>
            <label className={styles.fieldLabel}>WhatsApp URL</label>
            <input className={styles.fieldInput} type="url" placeholder="https://wa.me/97336622100" value={data.whatsapp_url ?? ''} onChange={e => set('whatsapp_url', e.target.value)} />
          </div>
        </div>
        <div className={styles.mfgRow}>
          <div className={styles.mfg}>
            <label className={styles.fieldLabel}>LinkedIn URL</label>
            <input className={styles.fieldInput} type="url" placeholder="https://linkedin.com/company/topright" value={data.linkedin_url ?? ''} onChange={e => set('linkedin_url', e.target.value)} />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Toast ── */
function Toast({ toast }) {
  if (!toast) return null
  return (
    <div className={`${styles.toast} ${toast.type === 'success' ? styles.toastSuccess : ''}`}>
      <div className={styles.toastTitle}>{toast.title}</div>
      <div className={styles.toastMsg}>{toast.msg}</div>
    </div>
  )
}

/* ── Main Dashboard shell ── */
export default function Dashboard() {
  const [section, setSection] = useState('dashboard')
  const [counts, setCounts] = useState({ portfolio: 0, published: 0, draft: 0, text: 0, inbox: 0, clients: 0, services: 0, testimonials: 0 })
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  useEffect(() => {
    fetchDashboardCounts().then(setCounts)
  }, [])

  function showToast(title, msg, type = 'success') {
    clearTimeout(toastTimer.current)
    setToast({ title, msg, type })
    toastTimer.current = setTimeout(() => setToast(null), 3200)
  }

  async function handleLogout() {
    await signOut()
  }

  const navItems = [
    { key: 'dashboard', icon: '◈', label: 'Dashboard',    group: 'Overview' },
    { key: 'hero',         icon: '⬒', label: 'Hero Section',  group: 'Website Content' },
    { key: 'why',          icon: '◑', label: 'Why Section',   group: 'Website Content' },
    { key: 'portfolio',     icon: '⊞', label: 'Portfolio',     group: 'Website Content', count: counts.portfolio },
    { key: 'clients',      icon: '◉', label: 'Clients Bar',   group: 'Website Content', count: counts.clients },
    { key: 'services',     icon: '◧', label: 'Services',      group: 'Website Content', count: counts.services },
    { key: 'testimonials', icon: '❝', label: 'Testimonials',  group: 'Website Content', count: counts.testimonials },
    // { key: 'text',         icon: '✎', label: 'Site Text',     group: 'Website Content' },
    { key: 'contact',   icon: '☏', label: 'Contact Info', group: 'Pages' },
    { key: 'footer',    icon: '▭', label: 'Footer',       group: 'Pages' },
    { key: 'calendar',  icon: '⊟', label: 'Calendar',     group: 'Schedule' },
    { key: 'inbox',     icon: '✉', label: 'Submissions',  group: 'Inbox',   count: counts.inbox },
  ]

  const groups = [...new Set(navItems.map(i => i.group))]

  return (
    <div className={styles.page}>
      <div className={styles.tbar} />

      <header className={styles.header}>
        <div className={styles.headerL}>
          <button className={styles.sidebarToggle} onClick={() => setSidebarOpen(o => !o)} aria-label="Menu">
            <span /><span /><span />
          </button>
          <img src="/logo.png" alt="TopRight" className={styles.headerLogo} />
          <span className={styles.headerPortalLabel}>Admin Portal</span>
        </div>
        <div className={styles.headerR}>
          <a href="/" target="_blank" rel="noopener" className={styles.viewSiteBtn}>↗ View Site</a>
          {/* <div className={styles.adminAvatar}>A</div> */}
          <button className={styles.logoutBtn} onClick={handleLogout}>Sign Out</button>
        </div>
      </header>

      <div className={styles.body}>
        {sidebarOpen && <div className={styles.sidebarOverlay} onClick={() => setSidebarOpen(false)} />}
        <nav className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
          {groups.map(group => (
            <div key={group} className={styles.sidebarSection}>
              <div className={styles.sidebarLabel}>{group}</div>
              {navItems.filter(i => i.group === group).map(item => (
                <button
                  key={item.key}
                  className={`${styles.slink} ${section === item.key ? styles.slinkActive : ''}`}
                  onClick={() => { setSection(item.key); setSidebarOpen(false); }}
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
          {section === 'hero'          && <HeroEditor showToast={showToast} />}
          {section === 'why'           && <WhyManager showToast={showToast} />}
          {section === 'portfolio'     && <PortfolioManager onNav={setSection} showToast={showToast} />}
          {section === 'clients'      && <ClientsManager showToast={showToast} />}
          {section === 'services'     && <ServicesManager showToast={showToast} />}
          {section === 'testimonials' && <TestimonialsManager showToast={showToast} />}
          {section === 'text'      && <SiteTextEditor showToast={showToast} />}
          {section === 'contact'   && <ContactInfoEditor showToast={showToast} />}
          {section === 'footer'    && <FooterEditor showToast={showToast} />}
          {section === 'calendar'  && <CalendarPage showToast={showToast} />}
          {section === 'inbox'     && <ContactSubmissions />}
        </main>
      </div>

      <Toast toast={toast} />
    </div>
  )
}
