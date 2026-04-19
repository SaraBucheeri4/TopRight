import { useState, useEffect } from 'react'
import styles from './About.module.css'
import { useLang } from '../../LangContext'
import { fetchAboutContent, getAboutImageUrl } from '../../services/aboutService'

const MEMBER_COLORS = ['#E7432B', '#0058A1', '#01A6A6']

const DEFAULT_MEMBERS = [
  {
    name: '',
    role: { en: 'Creative Director & Founder', ar: 'المدير الإبداعي والمؤسس' },
    bio:  { en: 'Over 20 years leading creative projects across Bahrain and the GCC. Specialises in bilingual publication design and editorial illustration.', ar: 'أكثر من ٢٠ عامًا في قيادة المشاريع الإبداعية في البحرين ومنطقة الخليج. متخصص في تصميم المطبوعات ثنائية اللغة والرسوم التوضيحية التحريرية.' },
  },
  {
    name: '',
    role: { en: 'Senior Designer', ar: 'مصمم أول' },
    bio:  { en: 'Specialises in layout and typographic design for Arabic and English publications. Background in corporate communications and HSE.', ar: 'متخصص في تصميم التخطيط والطباعة للمطبوعات العربية والإنجليزية. خلفية في الاتصالات المؤسسية والسلامة المهنية.' },
  },
  {
    name: '',
    role: { en: 'Illustrator & Animator', ar: 'رسّام ومصمم رسوم متحركة' },
    bio:  { en: "Creates character-driven illustrations for children's books, educational materials and animated digital publications.", ar: 'يبتكر رسومًا توضيحية مبنية على الشخصيات لكتب الأطفال والمواد التعليمية والمنشورات الرقمية المتحركة.' },
  },
]

const milestones = [
  { year: '2001', event: { en: 'Top Right founded in Bahrain',                      ar: 'تأسيس توب رايت في البحرين' } },
  { year: '2003', event: { en: 'First Khaleejieh newsletter issue for GPIC',         ar: 'أول إصدار لنشرة خليجية لصالح GPIC' } },
  { year: '2010', event: { en: 'Expanded into animation and digital publications',   ar: 'التوسع في مجال الرسوم المتحركة والمنشورات الرقمية' } },
  { year: '2015', event: { en: 'Launched coaching and storytelling workshops',       ar: 'إطلاق التدريب وورش السرد القصصي' } },
  { year: '2018', event: { en: '100+ publications milestone',                        ar: 'تجاوز إنجاز ١٠٠ مطبوعة' } },
  { year: '2023', event: { en: 'UN SDG Booklet Series for Bapco Energies',           ar: 'سلسلة كتيبات أهداف التنمية المستدامة لباب كو إينرجيز' } },
  { year: '2025', event: { en: 'Local Miniatures — first community arts event',      ar: 'المنمنمات المحلية — أول فعالية فنون مجتمعية' } },
]

const values = [
  { title: { en: 'Bilingual by nature',  ar: 'ثنائية اللغة بالفطرة' },  body: { en: 'Arabic and English treated equally — never an afterthought or a translation.',    ar: 'العربية والإنجليزية تُعامَلان بالتساوي — ليست إضافة لاحقة أو مجرد ترجمة.' },    color: '#E7432B' },
  { title: { en: 'Rooted in culture',    ar: 'متجذرون في الثقافة' },    body: { en: 'Deep understanding of Gulf visual language, storytelling traditions and audiences.', ar: 'فهم عميق للغة البصرية الخليجية وتقاليد السرد وجمهوره.' },                          color: '#0058A1' },
  { title: { en: 'Direct collaboration', ar: 'تعاون مباشر' },           body: { en: 'Every client works with the creative leads — no account managers in between.',      ar: 'كل عميل يعمل مع القادة الإبداعيين مباشرة — دون مديري حسابات وسطاء.' },           color: '#01A6A6' },
  { title: { en: 'End-to-end ownership', ar: 'ملكية متكاملة من البداية للنهاية' }, body: { en: 'Concept, writing, design, illustration, animation and print — one roof, one team.', ar: 'الفكرة، الكتابة، التصميم، الرسوم، الرسوم المتحركة والطباعة — سقف واحد، فريق واحد.' }, color: '#773E84' },
]

export default function About() {
  const { lang } = useLang()
  const isAr = lang === 'ar'
  const t = (obj) => isAr ? obj.ar : obj.en

  const [about, setAbout] = useState(null)

  useEffect(() => {
    fetchAboutContent().then(data => { if (data) setAbout(data) })
  }, [])

  const storyEn = about?.story_en || "Top Right was founded in Bahrain in 2001 with a single purpose: to tell stories beautifully, in both Arabic and English.\n\nOver two decades we have grown into a full-service creative studio trusted by some of the GCC's most respected organisations — from GPIC and Bapco Energies to the Ministry of Interior and Bahrain Television.\n\nWhat makes us different is our genuine bilingualism. We don't translate — we create in both languages simultaneously, ensuring every piece communicates authentically to every reader."
  const storyAr = about?.story_ar || 'تأسست توب رايت في البحرين عام ٢٠٠١ بهدف واحد: رواية القصص بجمال، بالعربية والإنجليزية معًا.\n\nعلى مدى عقدين نمونا لنصبح استوديو إبداعي متكامل تثق به بعض أبرز المؤسسات في منطقة الخليج — من GPIC وباب كو إينرجيز إلى وزارة الداخلية وتلفزيون البحرين.\n\nما يميزنا هو ثنائيتنا اللغوية الحقيقية. نحن لا نترجم — بل نبتكر بكلتا اللغتين في آنٍ واحد، لضمان أن كل قطعة تتواصل بأصالة مع كل قارئ.'

  const members = [1, 2, 3].map((n, i) => ({
    name:    about?.[`member${n}_name`]    || DEFAULT_MEMBERS[i].name,
    role:    { en: about?.[`member${n}_role_en`] || DEFAULT_MEMBERS[i].role.en, ar: about?.[`member${n}_role_ar`] || DEFAULT_MEMBERS[i].role.ar },
    bio:     { en: about?.[`member${n}_bio_en`]  || DEFAULT_MEMBERS[i].bio.en,  ar: about?.[`member${n}_bio_ar`]  || DEFAULT_MEMBERS[i].bio.ar },
    image:   about?.[`member${n}_image`]   ? getAboutImageUrl(about[`member${n}_image`]) : null,
    color:   MEMBER_COLORS[i],
  }))

  return (
    <>
      <section className="page-hero">
        <div className="hgrid" />
        <div className="page-hero-inner">
          <span className="sec-lbl">{isAr ? 'من نحن' : 'Who we are'}</span>
          <h1>{isAr ? <>من نحن —<br />توب رايت</> : <>About<br />Top Right</>}</h1>
          <p>{isAr ? 'استوديو إبداعي بحريني تأسس عام ٢٠٠١. متخصص في تصميم المطبوعات ثنائية اللغة والرسوم التوضيحية والرسوم المتحركة والتدريب الإبداعي — نفخر بخدمة منطقة الخليج لأكثر من ٢٠ عامًا.' : 'A Bahraini creative studio founded in 2001. Specialising in bilingual publication design, illustration, animation and creative coaching — proudly serving the GCC for over 20 years.'}</p>
        </div>
      </section>

      {/* STORY */}
      <section className={styles.story}>
        <div className={styles.storyL}>
          <span className="sec-lbl">{isAr ? 'قصتنا' : 'Our story'}</span>
          <h2 className="sec-ttl" style={{ color: '#000' }}>{isAr ? <>+٢٠ عامًا<br />من السرد القصصي</> : <>20+ years<br />of storytelling</>}</h2>
          {(isAr ? storyAr : storyEn).split('\n\n').map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
        <div className={styles.storyR}>
          <div className={styles.storyGrid}>
            <div className={styles.storyBox} style={{ background: '#E7432B' }}><strong>20+</strong><span>{isAr ? 'عامًا' : 'Years'}</span></div>
            <div className={styles.storyBox} style={{ background: '#0058A1' }}><strong>100+</strong><span>{isAr ? 'مطبوعة' : 'Publications'}</span></div>
            <div className={styles.storyBox} style={{ background: '#01A6A6' }}><strong>AR+EN</strong><span>{isAr ? 'ثنائي اللغة' : 'Bilingual'}</span></div>
            <div className={styles.storyBox} style={{ background: '#773E84' }}><strong>GCC</strong><span>{isAr ? 'على مستوى المنطقة' : 'Region-wide'}</span></div>
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className={styles.team}>
        <span className="sec-lbl">{isAr ? 'الفريق' : 'The people'}</span>
        <h2 className="sec-ttl">{isAr ? 'تعرّف على الفريق' : 'Meet the team'}</h2>
        <div className={styles.teamGrid}>
          {members.map((m, i) => (
            <div key={i} className={styles.member}>
              <div className={styles.memberImg} style={{ background: m.color, overflow: 'hidden' }}>
                {m.image
                  ? <img src={m.image} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span className={styles.memberInitial}>{m.name ? m.name[0] : '?'}</span>
                }
              </div>
              <div className={styles.memberInfo}>
                <strong className={styles.memberName}>{m.name || (isAr ? 'الاسم' : 'Name')}</strong>
                <span className={styles.memberRole}>{t(m.role)}</span>
                <p className={styles.memberBio}>{t(m.bio)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TIMELINE */}
      <section className={styles.timeline}>
        <span className="sec-lbl">{isAr ? 'رحلتنا' : 'Our journey'}</span>
        <h2 className="sec-ttl">{isAr ? 'المحطات البارزة' : 'Milestones'}</h2>
        <div className={styles.timelineList}>
          {milestones.map((m, i) => (
            <div key={i} className={styles.milestone}>
              <span className={styles.msYear}>{m.year}</span>
              <span className={styles.msDot} />
              <span className={styles.msEvent}>{t(m.event)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* VALUES */}
      <section className={styles.values}>
        <div className={styles.vGrid}>
          {values.map((v, i) => (
            <div key={i} className={styles.value}>
              <div className={styles.valueBar} style={{ background: v.color }} />
              <strong>{t(v.title)}</strong>
              <p>{t(v.body)}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
