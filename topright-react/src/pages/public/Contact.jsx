import { useState, useEffect } from 'react'
import styles from './Contact.module.css'
import { useLang } from '../../LangContext'
import { submitContactForm } from '../../services/contactService'
import { WA_NUMBER } from '../../config/constants'
import { fetchPublishedClients, getClientLogoUrl } from '../../services/clientsService'
import { fetchContactInfo } from '../../services/contactInfoService'

export default function Contact() {
  const [form, setForm] = useState({ name: '', org: '', email: '', type: '', message: '' })
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [clients, setClients] = useState([])
  const [contactInfo, setContactInfo] = useState(null)
  const { lang } = useLang()
  const isAr = lang === 'ar'

  useEffect(() => {
    fetchPublishedClients().then(setClients)
    fetchContactInfo().then(setContactInfo)
  }, [])

  const validate = () => {
    const e = {}
    if (!form.name.trim())    e.name = true
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = true
    if (!form.message.trim()) e.message = true
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setSubmitError(null)
    setSubmitting(true)
    try {
      await submitContactForm({
        name: form.name,
        organisation: form.org,
        email: form.email,
        project_type: form.type,
        message: form.message,
      })
      setSent(true)
      setForm({ name: '', org: '', email: '', type: '', message: '' })
      setTimeout(() => setSent(false), 6000)
    } catch (err) {
      console.error('Contact form submission error:', err)
      setSubmitError(err?.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const field = (key, val) => setForm(f => ({ ...f, [key]: val }))

  return (
    <>
      <section className="page-hero">
        <div className="hgrid" />
        <div className="page-hero-inner">
          <span className="sec-lbl">{isAr ? 'تواصل معنا' : 'Get in touch'}</span>
          <h1>{contactInfo?.section_title_en || contactInfo?.section_title_ar
            ? (isAr ? contactInfo.section_title_ar : contactInfo.section_title_en)
            : (isAr ? <>لنعمل<br />معًا</> : <>Let's work<br />together</>)
          }</h1>
          <p>{contactInfo?.description_en || contactInfo?.description_ar
            ? (isAr ? contactInfo.description_ar : contactInfo.description_en)
            : (isAr ? 'أخبرنا عن مشروعك وسنردّ عليك. نعمل مع مؤسسات في البحرين ومنطقة الخليج.' : 'Tell us about your project and we will get back to you. We work with organisations across Bahrain and the GCC.')
          }</p>
        </div>
      </section>

      <section className={styles.contact}>
        {/* LEFT — info */}
        <div className={styles.infoPanel}>
          <span className="sec-lbl">{isAr ? 'بيانات التواصل' : 'Contact details'}</span>
          <h2>{isAr ? <>تواصل معنا<br />مباشرة</> : <>Reach us<br />directly</>}</h2>

          <div className={styles.infoItems}>
            {contactInfo?.email && (
              <div className={styles.infoItem}>
                <div className={styles.infoLabel}>{isAr ? 'البريد الإلكتروني' : 'Email'}</div>
                <a href={`mailto:${contactInfo.email}`} className={styles.infoVal}>{contactInfo.email}</a>
              </div>
            )}
            {contactInfo?.phone_primary && (
              <div className={styles.infoItem}>
                <div className={styles.infoLabel}>{isAr ? 'الهاتف' : 'Phone'}</div>
                <div className={styles.infoVal}>{contactInfo.phone_primary}</div>
              </div>
            )}
            {contactInfo?.whatsapp && (
              <div className={styles.infoItem}>
                <div className={styles.infoLabel}>{isAr ? 'واتساب' : 'WhatsApp'}</div>
                <a href={`https://wa.me/${contactInfo.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener" className={styles.infoVal}>{contactInfo.whatsapp}</a>
              </div>
            )}
            {(contactInfo?.address_en || contactInfo?.address_ar) && (
              <div className={styles.infoItem}>
                <div className={styles.infoLabel}>{isAr ? 'الموقع' : 'Location'}</div>
                <div className={styles.infoVal}>
                  {isAr ? contactInfo.address_ar : contactInfo.address_en}
                  {contactInfo.cr_number ? ` · CR: ${contactInfo.cr_number}` : ''}
                </div>
              </div>
            )}
          </div>

          {clients.length > 0 && (
            <div className={styles.clients}>
              <span className={styles.clientsLbl}>{isAr ? 'نعمل مع' : 'We work with'}</span>
              {clients.map(c => (
                c.logo_url
                  ? <img key={c.id} src={getClientLogoUrl(c.logo_url)} alt={c.name} className={styles.clientLogo} />
                  : <span key={c.id} className={styles.clientTag}>{c.name}</span>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — form */}
        <div className={styles.formPanel}>
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.row}>
              <div className={styles.fg}>
                <label>{isAr ? 'الاسم *' : 'Name *'}</label>
                <input type="text" value={form.name} onChange={e => field('name', e.target.value)} placeholder={isAr ? 'اسمك' : 'Your name'} className={errors.name ? styles.err : ''} />
              </div>
              <div className={styles.fg}>
                <label>{isAr ? 'المؤسسة' : 'Organisation'}</label>
                <input type="text" value={form.org} onChange={e => field('org', e.target.value)} placeholder={isAr ? 'اسم الشركة' : 'Company name'} />
              </div>
            </div>
            <div className={styles.fg}>
              <label>{isAr ? 'البريد الإلكتروني *' : 'Email *'}</label>
              <input type="email" value={form.email} onChange={e => field('email', e.target.value)} placeholder="your@email.com" className={errors.email ? styles.err : ''} />
            </div>
            <div className={styles.fg}>
              <label>{isAr ? 'نوع المشروع' : 'Type of project'}</label>
              <input type="text" value={form.type} onChange={e => field('type', e.target.value)} placeholder={isAr ? 'تقرير سنوي، كتاب أطفال، دليل السلامة...' : "Annual report, children's book, HSE manual..."} />
            </div>
            <div className={styles.fg}>
              <label>{isAr ? 'الرسالة *' : 'Message *'}</label>
              <textarea value={form.message} onChange={e => field('message', e.target.value)} placeholder={isAr ? 'أخبرنا عن مشروعك والجدول الزمني...' : 'Tell us about your project and timeline...'} className={errors.message ? styles.err : ''} />
            </div>

            <div className={styles.formBtns}>
              <button type="submit" className={styles.submitBtn} disabled={submitting}>
                {submitting ? (isAr ? 'جارٍ الإرسال…' : 'Sending…') : (isAr ? 'إرسال الرسالة ←' : 'Send message →')}
              </button>
              <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener" className={styles.waBtn}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
            </div>

            {sent && <div className={styles.success}>{isAr ? 'شكرًا — سنردّ عليك خلال ٢٤ ساعة.' : 'Thank you — we will get back to you.'}</div>}
            {submitError && <div className={styles.error}>{submitError}</div>}
          </form>
        </div>
      </section>

    </>
  )
}
