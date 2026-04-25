import { useState, useEffect } from 'react'
import Marquee from '../../components/public/Marquee'
import styles from './Home.module.css'
import { useLang } from '../../LangContext'
import { fetchPublishedPortfolioItems, getPublicUrl } from '../../services/portfolioService'
import { submitContactForm } from '../../services/contactService'
import { WA_NUMBER } from '../../config/constants'
import { fetchPublishedClients, getClientLogoUrl } from '../../services/clientsService'
import { fetchContactInfo } from '../../services/contactInfoService'
import { fetchPublishedServices } from '../../services/servicesService'
import { fetchPublishedTestimonials } from '../../services/testimonialsService'
import { fetchHeroContent, getHeroCardImageUrl } from '../../services/heroService'
import { fetchPublishedWhyItems } from '../../services/whyService'
import { fetchCalendarEvents } from '../../services/calendarService'

const CACHE_KEY = 'home_data_cache'
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function getCached() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { ts, data } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL) { sessionStorage.removeItem(CACHE_KEY); return null }
    return data
  } catch { return null }
}

function setCache(data) {
  try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data })) } catch {}
}

const CAT_COLORS = {
  newsletter:   { bg: 'rgba(0,88,161,.15)',   color: '#5B9BD5' },
  hse:          { bg: 'rgba(1,166,166,.15)',  color: '#01A6A6' },
  storybooks:   { bg: 'rgba(119,62,132,.15)', color: '#a06ab4' },
  illustration: { bg: 'rgba(231,67,43,.15)',  color: '#E7432B' },
  animation:    { bg: 'rgba(231,67,43,.15)',  color: '#E7432B' },
  corporate:    { bg: 'rgba(0,88,161,.15)',   color: '#5B9BD5' },
}


const tabs = [
  { key: 'All',          en: 'All',          ar: 'الكل' },
  { key: 'Newsletter',   en: 'Newsletter',   ar: 'النشرات' },
  { key: 'HSE',          en: 'HSE',          ar: 'السلامة' },
  { key: 'Storybooks',   en: 'Storybooks',   ar: 'كتب القصص' },
  { key: 'Illustration', en: 'Illustration', ar: 'الرسوم' },
]




const svgIcons = {
  '01': <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.6)" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>,
  '02': <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.6)" strokeWidth="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 3v9l5 3"/></svg>,
  '03': <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.6)" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>,
  '04': <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.6)" strokeWidth="1.5"><path d="M15 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7z"/><path d="M14 2v5h5M8 13h8M8 17h5"/></svg>,
  '05': <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.6)" strokeWidth="1.5"><path d="M12 2a5 5 0 100 10A5 5 0 0012 2zM2 22c0-5.523 4.477-10 10-10s10 4.477 10 10"/></svg>,
  '06': <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.6)" strokeWidth="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
}

const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAY_LABELS = ['S','M','T','W','T','F','S']

function CoachingCalendar() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [events, setEvents] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    fetchCalendarEvents(year, month).then(setEvents).catch(() => {})
  }, [year, month])

  function prev() {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }
  function next() {
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }

  const firstDay = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const todayStr = now.toISOString().split('T')[0]

  const byDate = {}
  events.forEach(ev => {
    if (!byDate[ev.event_date]) byDate[ev.event_date] = []
    byDate[ev.event_date].push(ev)
  })

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const selDateStr = selected
    ? `${year}-${String(month).padStart(2,'0')}-${String(selected).padStart(2,'0')}`
    : null
  const selEvents = selDateStr ? (byDate[selDateStr] ?? []) : []

  return (
    <div className={styles.pubCal}>
      <div className={styles.pubCalNav}>
        <button className={styles.pubCalNavBtn} onClick={prev}>‹</button>
        <span className={styles.pubCalMonth}>{MONTH_NAMES[month - 1]} {year}</span>
        <button className={styles.pubCalNavBtn} onClick={next}>›</button>
      </div>
      <div className={styles.pubCalGrid}>
        {DAY_LABELS.map((d, i) => <div key={i} className={styles.pubCalDayLbl}>{d}</div>)}
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />
          const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`
          const dayEvs = byDate[dateStr] ?? []
          const isToday = dateStr === todayStr
          const isSel = selected === day
          return (
            <div
              key={dateStr}
              className={`${styles.pubCalCell} ${isToday ? styles.pubCalToday : ''} ${isSel ? styles.pubCalSel : ''}`}
              onClick={() => setSelected(isSel ? null : day)}
            >
              <span className={styles.pubCalDayNum}>{day}</span>
              {dayEvs.length > 0 && (
                <span className={styles.pubCalDot} style={{ background: dayEvs[0].color ?? '#E7432B' }} />
              )}
            </div>
          )
        })}
      </div>
      {selEvents.length > 0 && (
        <div className={styles.pubCalEvents}>
          {selEvents.map(ev => (
            <div key={ev.id} className={styles.pubCalEvent}>
              <span className={styles.pubCalEventDot} style={{ background: ev.color ?? '#E7432B' }} />
              <div>
                <div className={styles.pubCalEventTitle}>{ev.title}</div>
                {(ev.start_time || ev.description) && (
                  <div className={styles.pubCalEventMeta}>
                    {ev.start_time && <span>{ev.start_time.slice(0,5)}{ev.end_time ? ` – ${ev.end_time.slice(0,5)}` : ''}</span>}
                    {ev.description && <span>{ev.description}</span>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function posToAspectRatio(pos) {
  const [xStr, yStr] = (pos || '50% 50%').split(' ')
  const x = parseInt(xStr) || 50
  const y = parseInt(yStr) || 50
  const xa = x < 34 ? 'xMin' : x > 66 ? 'xMax' : 'xMid'
  const ya = y < 34 ? 'YMin' : y > 66 ? 'YMax' : 'YMid'
  return `${xa}${ya} slice`
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('All')
  const [visibleCount, setVisibleCount] = useState(4)
  const [visibleTestimonials, setVisibleTestimonials] = useState(4)
  const [portfolioCards, setPortfolioCards] = useState([])
  const [clients, setClients] = useState([])
  const [services, setServices] = useState([])
  const [testimonials, setTestimonials] = useState([])
  const [whyItems, setWhyItems] = useState([])
  const [contactInfo, setContactInfo] = useState(null)
  const [hero, setHero] = useState({
    card1_color: '#01A6A6', card1_line1: 'Safety with', card1_line2: 'Namool', card1_label: 'BAPCO ENERGIES · HSE',
    card2_color: '#0058A1', card2_line1: 'خليجية', card2_label: 'GPIC · SINCE 2001',
    card3_color: '#773E84', card3_line1: 'تطير بلا ريش', card3_line2: 'Flies Without Wings',
    card4_color: '#00AEA2', card4_line1: 'SDG Booklets', card4_label: 'SDG',
    basta_title: 'البسطة', basta_label: 'AL BASTA · BAHRAIN TV', basta_color: '#E7432B',
  })
  const [form, setForm] = useState({ name: '', org: '', email: '', type: '', message: '' })
  const [formErrors, setFormErrors] = useState({})
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { lang } = useLang()
  const isAr = lang === 'ar'

  const t = (obj) => isAr ? obj.ar : obj.en

  useEffect(() => {
    const cached = getCached()
    if (cached) {
      setClients(cached.clients)
      setContactInfo(cached.contactInfo)
      setServices(cached.services)
      setTestimonials(cached.testimonials)
      setWhyItems(cached.whyItems)
      if (cached.hero) setHero(prev => ({ ...prev, ...cached.hero }))
      setPortfolioCards(cached.portfolioCards)
      return
    }

    Promise.all([
      fetchPublishedClients().catch(e => { console.error('clients:', e); return [] }),
      fetchContactInfo().catch(e => { console.error('contactInfo:', e); return null }),
      fetchPublishedServices().catch(e => { console.error('services:', e); return [] }),
      fetchPublishedTestimonials().catch(e => { console.error('testimonials:', e); return [] }),
      fetchPublishedWhyItems().catch(e => { console.error('whyItems:', e); return [] }),
      fetchHeroContent().catch(e => { console.error('hero:', e); return null }),
      fetchPublishedPortfolioItems().catch(e => { console.error('portfolio:', e); return [] }),
    ]).then(([clients, contactInfo, services, testimonials, whyItems, hero, portfolioRaw]) => {
      const portfolioCards = portfolioRaw.map(item => ({
        cat: item.category,
        img: item.image_url ? getPublicUrl(item.image_url) : null,
        video_url: item.video_url ?? null,
        title_en: item.title_en ?? '',
        title_ar: item.title_ar ?? '',
        sub: { en: item.subtitle_en ?? '', ar: item.subtitle_ar ?? '' },
        year: item.year ?? null,
        project_url: item.project_url ?? null,
        image_position: item.image_position ?? 'center center',
      }))

      setClients(clients)
      setContactInfo(contactInfo)
      setServices(services)
      setTestimonials(testimonials)
      setWhyItems(whyItems)
      if (hero) setHero(prev => ({ ...prev, ...hero }))
      setPortfolioCards(portfolioCards)

      setCache({ clients, contactInfo, services, testimonials, whyItems, hero, portfolioCards })
    })
  }, [])

  // Scroll reveal — re-run when tab or cards change so newly visible cards animate
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target) }
      }),
      { threshold: 0.06 }
    )
    // Small timeout so the newly-rendered cards are in the DOM
    const id = setTimeout(() => {
      document.querySelectorAll('.js-reveal:not(.visible)').forEach(el => observer.observe(el))
    }, 20)
    return () => { clearTimeout(id); observer.disconnect() }
  }, [portfolioCards, activeTab, visibleCount, visibleTestimonials])

  const filtered = portfolioCards.filter(c =>
    activeTab === 'All' || c.cat === activeTab.toLowerCase()
  )
  const visible = filtered.slice(0, visibleCount)
  const hasMore = filtered.length > visibleCount

  return (
    <>
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroL}>
          <span className={styles.heroTag}>
            {isAr ? (hero?.tag_ar || 'البحرين · تأسست ٢٠٠١ · استوديو ثنائي اللغة') : (hero?.tag_en || 'Bahrain · Est. 2001 · Bilingual Studio')}
          </span>
          <h1 className={styles.heroH1}>
            {hero ? (
              <>
                {isAr ? hero.headline1_ar : hero.headline1_en}<br />
                {isAr ? hero.headline2_ar : hero.headline2_en}<br />
                <span style={{ color: '#01A6A6' }}>{isAr ? hero.accent_ar : hero.accent_en}</span>
              </>
            ) : (
              isAr
                ? <>نحكي<br />قصتك<br /><span style={{ color: '#01A6A6' }}>بلغة التصميم</span></>
                : <>We tell<br />your story<br /><span style={{ color: '#01A6A6' }}>through design</span></>
            )}
          </h1>
          <div className={styles.heroBtns}>
            <button className={styles.btnW} onClick={() => scrollTo('work')}>{isAr ? 'استعرض أعمالنا' : 'View our work'}</button>
            <button className={styles.btnG} onClick={() => scrollTo('contact')}>{isAr ? 'ابدأ مشروعك ←' : 'Start a project →'}</button>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.hstat}>
              <strong>{hero?.stat1_num || '20+'}</strong>
              <span>{isAr ? (hero?.stat1_label_ar || 'عامًا في البحرين') : (hero?.stat1_label_en || 'Years in Bahrain')}</span>
            </div>
            <div className={styles.hstat}>
              <strong>{hero?.stat2_num || '100+'}</strong>
              <span>{isAr ? (hero?.stat2_label_ar || 'مطبوعة') : (hero?.stat2_label_en || 'Publications')}</span>
            </div>
            <div className={styles.hstat}>
              <strong>{hero?.stat3_num || 'AR+EN'}</strong>
              <span>{isAr ? (hero?.stat3_label_ar || 'ثنائي اللغة') : (hero?.stat3_label_en || 'Bilingual')}</span>
            </div>
          </div>
        </div>

        <div className={styles.heroR}>
          <div className={styles.hgrid} />
          <svg width="100%" height="100%" viewBox="0 0 520 700" xmlns="http://www.w3.org/2000/svg">
            <image href="/logo.png" x="-40" y="160" width="580" height="360" opacity="0.07" preserveAspectRatio="xMidYMid meet"/>
            <circle cx="420" cy="80" r="140" fill="#01A6A6" opacity=".06"/>
            <circle cx="80" cy="580" r="120" fill="#773E84" opacity=".07"/>
            <circle cx="340" cy="400" r="80" fill="#E7432B" opacity=".05"/>
            {/* Book 1 */}
            <g transform="translate(60,80) rotate(-5)">
              <g className={styles.heroCard1}>
                <rect width="190" height="250" rx="6" fill={hero?.card1_color || '#01A6A6'}/>
                {!hero?.card1_image && <>
                  <rect x="12" y="12" width="166" height="226" rx="4" fill="rgba(0,0,0,.2)"/>
                  <circle cx="95" cy="100" r="52" fill="rgba(255,255,255,.12)"/>
                  <circle cx="95" cy="100" r="36" fill="#E7432B" opacity=".85"/>
                  <ellipse cx="95" cy="97" rx="13" ry="9" fill="rgba(255,255,255,.9)"/>
                  <circle cx="95" cy="84" r="7" fill="rgba(0,0,0,.75)"/>
                  <rect x="20" y="160" width="150" height="60" rx="3" fill="rgba(0,0,0,.25)"/>
                  <text x="95" y="182" fontSize="15" fontWeight="900" fill="#fff" textAnchor="middle" fontFamily="system-ui">{hero?.card1_line1 || 'Safety with'}</text>
                  <text x="95" y="200" fontSize="15" fontWeight="900" fill="#FBEED6" textAnchor="middle" fontFamily="system-ui">{hero?.card1_line2 || 'Namool'}</text>
                  <text x="95" y="235" fontSize="8" fill="rgba(255,255,255,.5)" textAnchor="middle" fontFamily="system-ui" letterSpacing="1">{hero?.card1_label || 'BAPCO ENERGIES · HSE'}</text>
                </>}
                {hero?.card1_image && <image href={getHeroCardImageUrl(hero.card1_image)} x="0" y="0" width="190" height="250" preserveAspectRatio={posToAspectRatio(hero.card1_image_position)} clipPath="url(#clip1)"/>}
                <defs><clipPath id="clip1"><rect width="190" height="250" rx="6"/></clipPath></defs>
              </g>
            </g>
            {/* Book 2 */}
            <g transform="translate(280,50) rotate(4)">
              <g className={styles.heroCard2}>
                <rect width="170" height="220" rx="5" fill={hero?.card2_color || '#0058A1'}/>
                {!hero?.card2_image && <>
                  <rect x="10" y="10" width="150" height="200" rx="3" fill="rgba(0,0,0,.2)"/>
                  <text x="85" y="130" fontSize="26" fontWeight="900" fill="#fff" textAnchor="middle" fontFamily="system-ui">{hero?.card2_line1 || 'خليجية'}</text>
                  <text x="85" y="205" fontSize="7" fill="rgba(255,255,255,.3)" textAnchor="middle" fontFamily="system-ui">{hero?.card2_label || 'GPIC · SINCE 2001'}</text>
                </>}
                {hero?.card2_image && <image href={getHeroCardImageUrl(hero.card2_image)} x="0" y="0" width="170" height="220" preserveAspectRatio={posToAspectRatio(hero.card2_image_position)} clipPath="url(#clip2)"/>}
                <defs><clipPath id="clip2"><rect width="170" height="220" rx="5"/></clipPath></defs>
              </g>
            </g>
            {/* Book 3 */}
            <g transform="translate(40,370) rotate(-3)">
              <g className={styles.heroCard3}>
                <rect width="160" height="210" rx="5" fill={hero?.card3_color || '#773E84'}/>
                {!hero?.card3_image && <>
                  <rect x="10" y="10" width="140" height="190" rx="3" fill="rgba(0,0,0,.25)"/>
                  <circle cx="80" cy="85" r="40" fill="#F9DFB7" opacity=".85"/>
                  <circle cx="96" cy="74" r="32" fill={hero?.card3_color || '#773E84'} opacity=".9"/>
                  <text x="80" y="145" fontSize="13" fontWeight="900" fill="#F9DFB7" textAnchor="middle" fontFamily="system-ui">{hero?.card3_line1 || 'تطير بلا ريش'}</text>
                  <text x="80" y="163" fontSize="8" fill="rgba(249,223,183,.5)" textAnchor="middle" fontFamily="system-ui">{hero?.card3_line2 || 'Flies Without Wings'}</text>
                </>}
                {hero?.card3_image && <image href={getHeroCardImageUrl(hero.card3_image)} x="0" y="0" width="160" height="210" preserveAspectRatio={posToAspectRatio(hero.card3_image_position)} clipPath="url(#clip3)"/>}
                <defs><clipPath id="clip3"><rect width="160" height="210" rx="5"/></clipPath></defs>
              </g>
            </g>
            {/* Book 4 */}
            <g transform="translate(300,330) rotate(6)">
              <g className={styles.heroCard4}>
                <rect width="155" height="200" rx="5" fill={hero?.card4_color || '#00AEA2'}/>
                {!hero?.card4_image && <>
                  <rect x="10" y="10" width="135" height="180" rx="3" fill="rgba(0,0,0,.2)"/>
                  <circle cx="77" cy="80" r="44" fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="2"/>
                  <circle cx="77" cy="80" r="28" fill="rgba(255,255,255,.15)"/>
                  <text x="77" y="76" fontSize="9" fontWeight="900" fill="#fff" textAnchor="middle" fontFamily="system-ui">{hero?.card4_label || 'SDG'}</text>
                  <text x="77" y="140" fontSize="11" fontWeight="700" fill="#fff" textAnchor="middle" fontFamily="system-ui">{hero?.card4_line1 || 'SDG Booklets'}</text>
                </>}
                {hero?.card4_image && <image href={getHeroCardImageUrl(hero.card4_image)} x="0" y="0" width="155" height="200" preserveAspectRatio={posToAspectRatio(hero.card4_image_position)} clipPath="url(#clip4)"/>}
                <defs><clipPath id="clip4"><rect width="155" height="200" rx="5"/></clipPath></defs>
              </g>
            </g>
          </svg>
        </div>
      </section>

      {/* MARQUEE */}
      <Marquee />

      {/* CLIENTS */}
      {clients.length > 0 && (
        <div className={styles.clients}>
          <span className={styles.clLbl}>{isAr ? 'يثق بنا' : 'Trusted by'}</span>
          {clients.map((c, i) => (
            <span key={c.id} className={styles.clGroup}>
              {i > 0 && <span className={styles.clDiv} />}
              {c.logo_url
                ? <img src={getClientLogoUrl(c.logo_url)} alt={c.name} className={styles.clLogo} />
                : <span className={styles.clN}>{c.name}</span>
              }
            </span>
          ))}
        </div>
      )}

      {/* PORTFOLIO */}
      <section id="work" className={styles.port}>
        <div className={styles.portTabs}>
          {tabs.map(tab => (
            <button key={tab.key} className={`${styles.ptab} ${activeTab === tab.key ? styles.ptabOn : ''}`} onClick={() => { setActiveTab(tab.key); setVisibleCount(4) }}>
              {isAr ? tab.ar : tab.en}
            </button>
          ))}
        </div>

        <div className={styles.portGrid}>
          {visible.map((c, i) => (
            <div key={i} className={`${styles.pcard} js-reveal`} style={{ transitionDelay: `${i * 80}ms` }}>
              <div className={styles.pcardThumb}>
                <img src={c.img} alt={c.title_en} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: c.image_position || 'center center' }} />
              </div>
              <div className={styles.pcardInfo}>
                <div className={styles.pcardMeta}>
                  {(() => {
                    const cl = CAT_COLORS[c.cat?.toLowerCase()] || { bg: 'rgba(255,255,255,.08)', color: '#888' }
                    return <span className={styles.pcardBadge} style={{ background: cl.bg, color: cl.color }}>{c.cat}</span>
                  })()}
                  {c.year && <span className={styles.pcardYear}>{c.year}</span>}
                </div>
                <div className={styles.pcardTtl}>{isAr ? c.title_ar || c.title_en : c.title_en}</div>
                <div className={styles.pcardSub}>{t(c.sub)}</div>
                {(c.video_url || c.project_url)
                  ? <a href={c.video_url || c.project_url} target="_blank" rel="noopener" className={styles.pcardArrow}>{isAr ? 'عرض المشروع ←' : 'View project →'}</a>
                  : <span className={styles.pcardArrow} style={{ opacity: 0.3 }}>{isAr ? 'عرض المشروع ←' : 'View project →'}</span>
                }
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className={styles.portEmpty}>{isAr ? 'لا توجد مشاريع في هذه الفئة بعد.' : 'No projects in this category yet.'}</p>}
        </div>
        {hasMore && (
          <div className={styles.viewMoreWrap}>
            <button className={styles.viewMoreBtn} onClick={() => setVisibleCount(n => n + 4)}>
              {isAr ? 'عرض المزيد ↓' : 'View more ↓'}
            </button>
          </div>
        )}
      </section>

      {/* SERVICES */}
      <section id="services" className={styles.svcs}>
        <span className="sec-lbl">{isAr ? 'ما نقدمه' : 'What we offer'}</span>
        <h2 className="sec-ttl" style={{ color: '#000' }}>{isAr ? <>خدمات إبداعية متكاملة،<br />من الفكرة حتى الطباعة</> : <>Full-service creative,<br />concept to print</>}</h2>
        <div className={styles.sg}>
          {services.map((s, i) => {
            const num = String(i + 1).padStart(2, '0')
            return (
              <div key={s.id} className={`${styles.sv} js-reveal`} style={{ background: s.card_color, transitionDelay: `${i * 70}ms` }}>
                {/* <div className={styles.svIco}>{svgIcons[num]}</div> */}
                <div className={styles.svN}>{num}</div>
                <span className={styles.svTag}>{s.tag_label}</span>
                <div className={styles.svTtl}>{isAr ? s.title_ar : s.title_en}</div>
                <p className={styles.svDesc}>{isAr ? s.description_ar : s.description_en}</p>
                <a href="#contact" className={styles.svLnk}>{isAr ? 'ابدأ مشروعك ←' : 'Start a project →'}</a>
              </div>
            )
          })}
        </div>
      </section>

      {/* WHY / ABOUT */}
      <section id="about" className={styles.why}>
        <div className={styles.whyL}>
          <h2>{isAr ? <>لماذا<br />توب رايت؟</> : <>Why<br />Top Right?</>}</h2>
          {whyItems.map(w => (
            <div key={w.id} className={styles.wi}>
              <span className={styles.wiN}>{w.number}</span>
              <div>
                <strong>{isAr ? w.title_ar : w.title_en}</strong>
                <p>{isAr ? w.body_ar : w.body_en}</p>
              </div>
            </div>
          ))}
        </div>
        <div className={styles.whyR}>
          <div className={styles.logoWm} aria-hidden="true">
            <img src="/logo.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.06, mixBlendMode: 'luminosity' }} />
          </div>
          <div className={styles.whyDeco} style={{ width: 280, height: 280, bottom: -80, right: -80 }} />
          <div className={styles.whyDeco} style={{ width: 180, height: 180, bottom: -40, right: -40 }} />
          <div className={styles.whyBig}>20+</div>
          <div className={styles.whyLbl}>{isAr ? 'عامًا في البحرين' : 'Years in Bahrain'}</div>
          <div className={styles.whyBox}>
            <div style={{ fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,.5)', marginBottom: 10 }}>{isAr ? '/ قصتنا' : '/ Our Story'}</div>
            <p>{isAr ? (hero?.story_ar || 'تأسست توب رايت في البحرين عام ٢٠٠١، وقضت أكثر من عقدين في رواية قصص الخليج من خلال التصميم. من كتب الأطفال إلى المطبوعات المؤسسية، نحوّل الأفكار إلى واقع — بالعربية والإنجليزية.') : (hero?.story_en || 'Founded in Bahrain in 2001, Top Right has spent over two decades telling the Gulf\'s stories through design. From children\'s books to corporate publications, we bring ideas to life — in Arabic and English.')}</p>
          </div>
        </div>
      </section>

      {/* COACHING TEASER */}
      <section id="coaching" className={styles.coaching}>
        <div className={styles.coaL}>
          <span className={styles.coaLbl}>{isAr ? 'التعليم الإبداعي' : 'Creative education'}</span>
          <h2>{isAr ? <>التدريب<br />وورش العمل</> : <>Coaching &amp;<br />Workshops</>}</h2>
          <p>{isAr ? 'تمكين الكتّاب والمربين والمهنيين من خلال التدريب الإبداعي وورش السرد القصصي وجلسات تطوير العلامة التجارية — في البحرين وعبر الإنترنت.' : 'Empowering writers, educators and professionals through creative coaching, storytelling workshops and brand development sessions.'}</p>
          <button className={styles.btnWht} onClick={() => scrollTo('contact')}>{isAr ? 'استفسر عن الجلسات' : 'Enquire about sessions'}</button>
        </div>
        <div className={styles.coaR}>
          <CoachingCalendar />
        </div>
      </section>

      {/* EVENTS & CSR */}
      <section id="events" className={styles.eventsSection}>
        <div className={styles.eventsTopLine} />
        <div className={styles.eventsInner}>
          <span className="sec-lbl">{isAr ? 'المجتمع والمسؤولية' : 'Community & Responsibility'}</span>
          <h2 className="sec-ttl" style={{ color: '#000', marginBottom: 12 }}>{isAr ? 'الفعاليات والمسؤولية المجتمعية' : 'Events & CSR'}</h2>
          <p className={styles.eventsIntro}>{isAr ? 'بعيداً عن التصميم والنشر، تستثمر توب رايت في مبادرات مجتمعية تُحيي الإبداع. أقمنا أول فعالية لنا ضمن مبادرة "المجسمات المحلية" في البحرين — احتفاءً بالفن والحرف والثقافة المحلية.' : 'Beyond design and publishing, Top Right invests in community-driven initiatives that bring creativity to life.  '}</p>
          <div className={styles.eventsGrid}>
            <div className={styles.eventCardDark}>
              <div className={styles.eventCardAccent} />
              <span className={styles.eventCardLbl}>{isAr ? '/ مبادرة' : '/ Initiative'}</span>
              <h3 className={styles.eventCardH3}>{isAr ? <>مجسمات<br />محلية</> : <>Local<br />Miniatures</>}</h3>
              <p className={styles.eventCardP}>{isAr ? 'مبادرة من توب رايت تحتفي بفن المجسمات والثقافة الإبداعية المحلية في البحرين. جمعت فعاليتنا الأولى فنانين وهواة ومجتمعاً في تجربة غامرة.' : 'A Top Right initiative celebrating miniature art and local creative culture in Bahrain. Our inaugural event brought together artists, collectors and community members for an immersive experience.'}</p>
              <a href="https://www.instagram.com/local_miniatures" target="_blank" rel="noopener" className={styles.eventInstagram}>{isAr ? 'تابعنا على انستغرام ←' : 'Follow on Instagram →'}</a>
            </div>
            <div className={styles.eventCardStats}>
              <div className={styles.eventCircle}>
                <div className={styles.eventCircleInner} />
                <span className={styles.eventCircleNum}>1</span>
              </div>
              <div className={styles.eventStatLbl}>{isAr ? 'فعالية منعقدة' : 'Event held'}</div>
              <div className={styles.eventStatTxt}>{isAr ? <>البحرين · ٢٠٢٥<br />فعاليات قادمة قريباً</> : <>Bahrain · 2025<br />More events coming soon</>}</div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className={styles.testi}>
        <span className="sec-lbl">{isAr ? 'أصوات عملائنا' : 'Client voices'}</span>
        <h2 className="sec-ttl" style={{ color: '#000' }}>{isAr ? 'ماذا يقول عملاؤنا' : 'What our clients say'}</h2>
        <div className={styles.tg}>
          {testimonials.slice(0, visibleTestimonials).map((testimonial, i) => (
            <div key={testimonial.id} className={`${styles.tc} js-reveal`} style={{ transitionDelay: `${i * 100}ms` }}>
              <span className={styles.tcQ}>"</span>
              <p className={styles.tcTxt}>{isAr ? testimonial.quote_ar : testimonial.quote_en}</p>
              <div className={styles.tcRow}>
                <div className={styles.tcDot} style={{ background: testimonial.avatar_color ?? '#E7432B' }}>
                  {testimonial.name?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div>
                  <div className={styles.tcName}>{testimonial.name}</div>
                  <div className={styles.tcCo}>{testimonial.company}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {testimonials.length > visibleTestimonials && (
          <div className={styles.viewMoreWrap}>
            <button className={styles.viewMoreBtn} onClick={() => setVisibleTestimonials(n => n + 4)}>
              {isAr ? 'عرض المزيد ↓' : 'View more ↓'}
            </button>
          </div>
        )}
      </section>

      {/* CONTACT */}
      <section id="contact" className={styles.contactSection}>
        <div className={styles.contactL}>
          <span className="sec-lbl">{isAr ? (contactInfo?.label_ar || 'تواصل معنا') : (contactInfo?.label_en || 'Get in touch')}</span>
          <h2>{isAr ? <>لنعمل<br />معًا</> : <>Let's work<br />together</>}</h2>
          <p>{isAr ? 'أخبرنا عن مشروعك وسنردّ عليك خلال ٢٤ ساعة.' : 'Tell us about your project and we will get back to you within 24 hours.'}</p>
          <div className={styles.contactItems}>
            {contactInfo?.email && (
              <div className={styles.contactItem}>
                <div className={styles.contactLabel}>{isAr ? 'البريد الإلكتروني' : 'Email'}</div>
                <a href={`mailto:${contactInfo.email}`} className={styles.contactVal}>{contactInfo.email}</a>
              </div>
            )}
            {contactInfo?.phone_primary && (
              <div className={styles.contactItem}>
                <div className={styles.contactLabel}>{isAr ? 'الهاتف' : 'Phone'}</div>
                <div className={styles.contactVal}>{contactInfo.phone_primary}</div>
              </div>
            )}
            {contactInfo?.whatsapp && (
              <div className={styles.contactItem}>
                <div className={styles.contactLabel}>{isAr ? 'واتساب' : 'WhatsApp'}</div>
                <a href={`https://wa.me/${contactInfo.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener" className={styles.contactVal}>{contactInfo.whatsapp}</a>
              </div>
            )}
            {(contactInfo?.address_en || contactInfo?.address_ar) && (
              <div className={styles.contactItem}>
                <div className={styles.contactLabel}>{isAr ? 'الموقع' : 'Location'}</div>
                <div className={styles.contactVal}>
                  {isAr ? contactInfo.address_ar : contactInfo.address_en}
                  {contactInfo.cr_number ? ` · CR: ${contactInfo.cr_number}` : ''}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.contactR}>
          <form className={styles.contactForm} onSubmit={async (ev) => {
            ev.preventDefault()
            const e = {}
            if (!form.name.trim()) e.name = true
            if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = true
            if (!form.message.trim()) e.message = true
            setFormErrors(e)
            if (Object.keys(e).length > 0) return
            setSubmitting(true)
            try {
              await submitContactForm({ name: form.name, organisation: form.org, email: form.email, project_type: form.type, message: form.message })
              setSent(true)
              setForm({ name: '', org: '', email: '', type: '', message: '' })
              setTimeout(() => setSent(false), 6000)
            } catch {
              alert(isAr ? 'حدث خطأ. يرجى المحاولة مرة أخرى.' : 'Something went wrong. Please try again.')
            } finally {
              setSubmitting(false)
            }
          }} noValidate>
            <div className={styles.formRow}>
              <div className={styles.fg}>
                <label>{isAr ? 'الاسم *' : 'Name *'}</label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder={isAr ? 'اسمك' : 'Your name'} className={formErrors.name ? styles.err : ''} />
              </div>
              <div className={styles.fg}>
                <label>{isAr ? 'المؤسسة' : 'Organisation'}</label>
                <input type="text" value={form.org} onChange={e => setForm(f => ({ ...f, org: e.target.value }))} placeholder={isAr ? 'اسم الشركة' : 'Company name'} />
              </div>
            </div>
            <div className={styles.fg}>
              <label>{isAr ? 'البريد الإلكتروني *' : 'Email *'}</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="your@email.com" className={formErrors.email ? styles.err : ''} />
            </div>
            <div className={styles.fg}>
              <label>{isAr ? 'نوع المشروع' : 'Type of project'}</label>
              <input type="text" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} placeholder={isAr ? 'تقرير سنوي، كتاب أطفال...' : "Annual report, children's book..."} />
            </div>
            <div className={styles.fg}>
              <label>{isAr ? 'الرسالة *' : 'Message *'}</label>
              <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder={isAr ? 'أخبرنا عن مشروعك...' : 'Tell us about your project...'} className={formErrors.message ? styles.err : ''} />
            </div>
            <div className={styles.formBtns}>
              <button type="submit" className={styles.submitBtn} disabled={submitting}>
                {submitting ? (isAr ? 'جارٍ الإرسال…' : 'Sending…') : (isAr ? 'إرسال الرسالة ←' : 'Send message →')}
              </button>
            </div>
            {sent && <div className={styles.formSuccess}>{isAr ? 'شكرًا — سنتواصل معك قريبًا.' : 'Thank you — we will be in touch soon.'}</div>}
          </form>
        </div>
      </section>
    </>
  )
}
