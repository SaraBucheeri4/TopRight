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
import { fetchHeroContent } from '../../services/heroService'

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

const whyItems = [
  {
    n: '01',
    title: { en: '20+ years of creative experience in Bahrain', ar: 'أكثر من ٢٠ عامًا من الخبرة الإبداعية في البحرين' },
    body:  { en: 'A depth of client trust, creative judgment and established relationships that newer competitors simply cannot replicate.', ar: 'عمق من ثقة العملاء والحكم الإبداعي والعلاقات الراسخة التي لا يستطيع المنافسون الجدد ببساطة تكرارها.' },
  },
  {
    n: '02',
    title: { en: 'Fully bilingual — Arabic and English', ar: 'ثنائية اللغة بالكامل — عربي وإنجليزي' },
    body:  { en: 'One team that writes, designs and produces in both languages. No brief lost in translation. No separate vendors.', ar: 'فريق واحد يكتب ويصمم وينتج بكلتا اللغتين. لا شيء يضيع في الترجمة. لا موردون منفصلون.' },
  },
  {
    n: '03',
    title: { en: 'Direct, personal communication', ar: 'تواصل مباشر وشخصي' },
    body:  { en: 'Every client speaks directly with the creative leads. No account managers, no dilution of vision — just clear, focused collaboration.', ar: 'كل عميل يتحدث مباشرة مع القادة الإبداعيين. لا مديري حسابات، لا تمييع للرؤية — مجرد تعاون واضح ومركّز.' },
  },
  {
    n: '04',
    title: { en: 'Full-service from concept to print', ar: 'خدمة متكاملة من الفكرة حتى الطباعة' },
    body:  { en: 'Writing, illustration, design and production — all under one roof. One partner for the entire process.', ar: 'الكتابة والرسوم والتصميم والإنتاج — كل ذلك تحت سقف واحد. شريك واحد لكامل العملية.' },
  },
  {
    n: '05',
    title: { en: 'Proudly Bahraini — GCC culturally rooted', ar: 'بحرينيون بفخر — متجذرون ثقافيًا في الخليج' },
    body:  { en: '20+ years of understanding Gulf visual language, business culture and audience expectations.', ar: 'أكثر من ٢٠ عامًا من فهم اللغة البصرية الخليجية وثقافة الأعمال وتوقعات الجمهور.' },
  },
]


const svgIcons = {
  '01': <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="3" y="3" width="16" height="16" rx="2" stroke="#01A6A6" strokeWidth="1.5"/><path d="M6 8h10M6 11h7M6 14h9" stroke="#01A6A6" strokeWidth="1.2" strokeLinecap="round"/></svg>,
  '02': <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="8" r="5" stroke="rgba(255,255,255,.7)" strokeWidth="1.5"/><path d="M4 20c0-3.9 3.1-7 7-7s7 3.1 7 7" stroke="rgba(255,255,255,.7)" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  '03': <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 3v4M11 15v4M3 11h4M15 11h4" stroke="rgba(255,255,255,.7)" strokeWidth="1.5" strokeLinecap="round"/><circle cx="11" cy="11" r="4" stroke="rgba(255,255,255,.7)" strokeWidth="1.5"/></svg>,
  '04': <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="3" y="4" width="16" height="14" rx="2" stroke="rgba(255,255,255,.7)" strokeWidth="1.5"/><path d="M7 9h8M7 13h5" stroke="rgba(255,255,255,.7)" strokeWidth="1.2" strokeLinecap="round"/></svg>,
  '05': <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="3" y="3" width="16" height="16" rx="2" stroke="#01A6A6" strokeWidth="1.5"/><path d="M7 7l4 4-4 4M13 15h3" stroke="#01A6A6" strokeWidth="1.2" strokeLinecap="round"/></svg>,
  '06': <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M5 17L11 5l6 12" stroke="rgba(255,255,255,.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 13h8" stroke="rgba(255,255,255,.7)" strokeWidth="1.2" strokeLinecap="round"/></svg>,
}


const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

export default function Home() {
  const [activeTab, setActiveTab] = useState('All')
  const [portfolioCards, setPortfolioCards] = useState([])
  const [clients, setClients] = useState([])
  const [services, setServices] = useState([])
  const [testimonials, setTestimonials] = useState([])
  const [contactInfo, setContactInfo] = useState(null)
  const [hero, setHero] = useState(null)
  const [form, setForm] = useState({ name: '', org: '', email: '', type: '', message: '' })
  const [formErrors, setFormErrors] = useState({})
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { lang } = useLang()
  const isAr = lang === 'ar'

  const t = (obj) => isAr ? obj.ar : obj.en

  useEffect(() => {
    fetchPublishedClients().then(setClients)
    fetchContactInfo().then(setContactInfo)
    fetchPublishedServices().then(setServices)
    fetchPublishedTestimonials().then(setTestimonials)
    fetchHeroContent().then(setHero)
    fetchPublishedPortfolioItems().then(data => {
      setPortfolioCards(data.map(item => ({
        cat: item.category,
        img: item.image_url ? getPublicUrl(item.image_url) : null,
        label: { en: item.label_en ?? '', ar: item.label_ar ?? '' },
        title: item.title,
        sub: { en: item.subtitle_en ?? '', ar: item.subtitle_ar ?? '' },
        year: item.year ?? null,
        project_url: item.project_url ?? null,
        image_position: item.image_position ?? 'center center',
      })))
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
  }, [portfolioCards, activeTab])

  const filtered = portfolioCards.filter(c =>
    activeTab === 'All' || c.cat === activeTab.toLowerCase()
  )

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
              <rect width="190" height="250" rx="6" fill="#01A6A6"/>
              <rect x="12" y="12" width="166" height="226" rx="4" fill="rgba(0,0,0,.2)"/>
              <circle cx="95" cy="100" r="52" fill="rgba(255,255,255,.12)"/>
              <circle cx="95" cy="100" r="36" fill="#E7432B" opacity=".85"/>
              <ellipse cx="95" cy="97" rx="13" ry="9" fill="rgba(255,255,255,.9)"/>
              <circle cx="95" cy="84" r="7" fill="rgba(0,0,0,.75)"/>
              <rect x="20" y="160" width="150" height="60" rx="3" fill="rgba(0,0,0,.25)"/>
              <text x="95" y="182" fontSize="15" fontWeight="900" fill="#fff" textAnchor="middle" fontFamily="system-ui">Safety with</text>
              <text x="95" y="200" fontSize="15" fontWeight="900" fill="#FBEED6" textAnchor="middle" fontFamily="system-ui">Namool</text>
              <text x="95" y="235" fontSize="8" fill="rgba(255,255,255,.5)" textAnchor="middle" fontFamily="system-ui" letterSpacing="1">BAPCO ENERGIES · HSE</text>
            </g>
            {/* Book 2 */}
            <g transform="translate(280,50) rotate(4)">
              <rect width="170" height="220" rx="5" fill="#0058A1"/>
              <rect x="10" y="10" width="150" height="200" rx="3" fill="rgba(0,0,0,.2)"/>
              <text x="85" y="130" fontSize="26" fontWeight="900" fill="#fff" textAnchor="middle" fontFamily="system-ui">خليجية</text>
              <text x="85" y="157" fontSize="7" fill="rgba(255,255,255,.4)" textAnchor="middle" fontFamily="system-ui" letterSpacing="2">KHALEEJIEH</text>
              <text x="85" y="205" fontSize="7" fill="rgba(255,255,255,.3)" textAnchor="middle" fontFamily="system-ui">GPIC · SINCE 2001</text>
            </g>
            {/* Book 3 */}
            <g transform="translate(40,370) rotate(-3)">
              <rect width="160" height="210" rx="5" fill="#773E84"/>
              <rect x="10" y="10" width="140" height="190" rx="3" fill="rgba(0,0,0,.25)"/>
              <circle cx="80" cy="85" r="40" fill="#F9DFB7" opacity=".85"/>
              <circle cx="96" cy="74" r="32" fill="#773E84" opacity=".9"/>
              <text x="80" y="145" fontSize="13" fontWeight="900" fill="#F9DFB7" textAnchor="middle" fontFamily="system-ui">تطير بلا ريش</text>
              <text x="80" y="163" fontSize="8" fill="rgba(249,223,183,.5)" textAnchor="middle" fontFamily="system-ui">Flies Without Wings</text>
            </g>
            {/* Book 4 */}
            <g transform="translate(300,330) rotate(6)">
              <rect width="155" height="200" rx="5" fill="#00AEA2"/>
              <rect x="10" y="10" width="135" height="180" rx="3" fill="rgba(0,0,0,.2)"/>
              <circle cx="77" cy="80" r="44" fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="2"/>
              <circle cx="77" cy="80" r="28" fill="rgba(255,255,255,.15)"/>
              <text x="77" y="76" fontSize="9" fontWeight="900" fill="#fff" textAnchor="middle" fontFamily="system-ui">SDG</text>
              <text x="77" y="140" fontSize="11" fontWeight="700" fill="#fff" textAnchor="middle" fontFamily="system-ui">SDG Booklets</text>
            </g>
            {/* Al Basta banner */}
            <g transform="translate(50,600)">
              <rect width="420" height="80" rx="4" fill="rgba(231,67,43,.12)"/>
              <text x="210" y="28" fontSize="18" fontWeight="900" fill="#E7432B" textAnchor="middle" fontFamily="system-ui">البسطة</text>
              <text x="210" y="47" fontSize="8" fill="rgba(231,67,43,.5)" textAnchor="middle" fontFamily="system-ui" letterSpacing="3">AL BASTA · BAHRAIN TV</text>
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
            <button key={tab.key} className={`${styles.ptab} ${activeTab === tab.key ? styles.ptabOn : ''}`} onClick={() => setActiveTab(tab.key)}>
              {isAr ? tab.ar : tab.en}
            </button>
          ))}
        </div>

        <div className={styles.portGrid}>
          {filtered.map((c, i) => (
            <div key={i} className={`${styles.pcard} js-reveal`} style={{ transitionDelay: `${i * 80}ms` }}>
              <div className={styles.pcardThumb}>
                <img src={c.img} alt={c.title} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: c.image_position || 'center center' }} />
              </div>
              <div className={styles.pcardInfo}>
                <div className={styles.pcardMeta}>
                  {(() => {
                    const cl = CAT_COLORS[c.cat?.toLowerCase()] || { bg: 'rgba(255,255,255,.08)', color: '#888' }
                    return <span className={styles.pcardBadge} style={{ background: cl.bg, color: cl.color }}>{c.cat}</span>
                  })()}
                  {c.year && <span className={styles.pcardYear}>{c.year}</span>}
                </div>
                <div className={styles.pcardCat}>{t(c.label)}</div>
                <div className={styles.pcardTtl}>{c.title}</div>
                <div className={styles.pcardSub}>{t(c.sub)}</div>
                {c.project_url
                  ? <a href={c.project_url} target="_blank" rel="noopener" className={styles.pcardArrow}>{isAr ? 'عرض المشروع ←' : 'View project →'}</a>
                  : <span className={styles.pcardArrow} style={{ opacity: 0.3 }}>{isAr ? 'عرض المشروع ←' : 'View project →'}</span>
                }
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className={styles.portEmpty}>{isAr ? 'لا توجد مشاريع في هذه الفئة بعد.' : 'No projects in this category yet.'}</p>}
        </div>
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
                <div className={styles.svIco}>{svgIcons[num]}</div>
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
            <div key={w.n} className={styles.wi}>
              <span className={styles.wiN}>{w.n}</span>
              <div>
                <strong>{t(w.title)}</strong>
                <p>{t(w.body)}</p>
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
            <p>{isAr ? 'هل أنت مستعد لبدء مطبوعتك أو كتابك أو حملتك القادمة؟ يسعدنا سماع تفاصيل مشروعك.' : 'Ready to start your next publication, book or campaign? We would love to hear about your project.'}</p>
            <button onClick={() => scrollTo('contact')}>{isAr ? 'تواصل معنا ←' : 'Get in touch →'}</button>
          </div>
        </div>
      </section>

      {/* COACHING TEASER */}
      <section id="coaching" className={styles.coaching}>
        <div className={styles.coaL}>
          <span className={styles.coaLbl}>{isAr ? 'التعليم الإبداعي' : 'Creative education'}</span>
          <h2>{isAr ? <>التدريب<br />وورش العمل</> : <>Coaching &amp;<br />Workshops</>}</h2>
          <p>{isAr ? 'تمكين الكتّاب والمربين والمهنيين من خلال التدريب الإبداعي وورش السرد القصصي وجلسات تطوير العلامة التجارية — في البحرين وعبر الإنترنت.' : 'Empowering writers, educators and professionals through creative coaching, storytelling workshops and brand development sessions — in Bahrain and online.'}</p>
          <button className={styles.btnWht} onClick={() => scrollTo('contact')}>{isAr ? 'استفسر عن الجلسات' : 'Enquire about sessions'}</button>
        </div>
        <div className={styles.coaR}>
          <div className={styles.coaRing} style={{ width: 280, height: 280 }} />
          <div className={styles.coaRing} style={{ width: 180, height: 180 }} />
          <div className={styles.coaBig}>20+</div>
          <div className={styles.coaLbl2}>{isAr ? <>عامًا من التدريب<br />وورش العمل الإبداعية</> : <>Years of coaching<br />&amp; creative workshops</>}</div>
        </div>
      </section>

      {/* EVENTS & CSR */}
      <section id="events" className={styles.eventsSection}>
        <div className={styles.eventsTopLine} />
        <div className={styles.eventsInner}>
          <span className="sec-lbl">{isAr ? 'المجتمع والمسؤولية' : 'Community & Responsibility'}</span>
          <h2 className="sec-ttl" style={{ color: '#000', marginBottom: 12 }}>{isAr ? 'الفعاليات والمسؤولية المجتمعية' : 'Events & CSR'}</h2>
          <p className={styles.eventsIntro}>{isAr ? 'بعيداً عن التصميم والنشر، تستثمر توب رايت في مبادرات مجتمعية تُحيي الإبداع. أقمنا أول فعالية لنا ضمن مبادرة "المجسمات المحلية" في البحرين — احتفاءً بالفن والحرف والثقافة المحلية.' : 'Beyond design and publishing, Top Right invests in community-driven initiatives that bring creativity to life. Our first event under the Local Miniatures initiative was held in Bahrain — a celebration of local art, craft and culture.'}</p>
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
          {testimonials.map((testimonial, i) => (
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
      </section>

      {/* CONTACT */}
      <section id="contact" className={styles.contactSection}>
        <div className={styles.contactL}>
          <span className="sec-lbl">{isAr ? 'تواصل معنا' : 'Get in touch'}</span>
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
              <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener" className={styles.waBtn}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp
              </a>
            </div>
            {sent && <div className={styles.formSuccess}>{isAr ? 'شكرًا — سنردّ عليك خلال ٢٤ ساعة.' : 'Thank you — we will get back to you within 24 hours.'}</div>}
          </form>
        </div>
      </section>
    </>
  )
}
