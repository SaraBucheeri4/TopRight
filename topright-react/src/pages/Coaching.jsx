import { useNavigate } from 'react-router-dom'
import styles from './Coaching.module.css'
import { useLang } from '../LangContext'

const programmes = [
  {
    title:    { en: 'Creative Writing Workshop',   ar: 'ورشة الكتابة الإبداعية' },
    duration: { en: '2-day workshop',              ar: 'ورشة يومين' },
    audience: { en: 'Individuals & Teams',         ar: 'الأفراد والفرق' },
    desc:     { en: 'A hands-on workshop exploring creative writing techniques, story structure and narrative voice — in Arabic or English. Suitable for beginners and experienced writers alike.', ar: 'ورشة عملية تستعرض تقنيات الكتابة الإبداعية وبنية القصة والصوت السردي — بالعربية أو الإنجليزية. مناسبة للمبتدئين والكتّاب ذوي الخبرة على حدٍّ سواء.' },
    topics: {
      en: ['Story structure & plot', 'Character development', 'Finding your voice', 'Writing for children', 'Editing and self-review'],
      ar: ['بنية القصة والحبكة', 'تطوير الشخصيات', 'اكتشاف صوتك الأدبي', 'الكتابة للأطفال', 'التحرير والمراجعة الذاتية'],
    },
    color: '#E7432B',
  },
  {
    title:    { en: 'Storytelling for Business',   ar: 'السرد القصصي للأعمال' },
    duration: { en: 'Half-day session',            ar: 'جلسة نصف يوم' },
    audience: { en: 'Corporate Teams',             ar: 'الفرق المؤسسية' },
    desc:     { en: 'Transform the way your organisation communicates. This workshop helps teams find their brand story and tell it consistently, powerfully — in both Arabic and English.', ar: 'غيّر أسلوب تواصل مؤسستك. تساعد هذه الورشة الفرق على اكتشاف قصة علامتها التجارية وسردها بثبات وقوة — بالعربية والإنجليزية معًا.' },
    topics: {
      en: ['Brand narrative development', 'Audience-centred writing', 'Bilingual communication', 'Presentation storytelling', 'Internal communications'],
      ar: ['تطوير السرد الخاص بالعلامة التجارية', 'الكتابة الموجّهة للجمهور', 'التواصل ثنائي اللغة', 'السرد في العروض التقديمية', 'الاتصالات الداخلية'],
    },
    color: '#0058A1',
  },
  {
    title:    { en: "Children's Book Masterclass", ar: 'ماستركلاس كتاب الأطفال' },
    duration: { en: '3-day programme',             ar: 'برنامج ثلاثة أيام' },
    audience: { en: 'Authors & Educators',         ar: 'المؤلفون والمربون' },
    desc:     { en: "Develop a complete children's book concept — from story idea through character design and layout. Guided by our creative team with 20+ years in Gulf children's publishing.", ar: 'طوّر مفهومًا متكاملًا لكتاب أطفال — من فكرة القصة حتى تصميم الشخصيات والتخطيط. بتوجيه من فريقنا الإبداعي ذو الخبرة التي تتجاوز ٢٠ عامًا في نشر كتب الأطفال الخليجية.' },
    topics: {
      en: ['Concept development', 'Age-appropriate writing', 'Illustration briefing', 'Layout principles', 'Publishing overview'],
      ar: ['تطوير المفهوم', 'الكتابة المناسبة للعمر', 'الإحاطة بالرسوم التوضيحية', 'مبادئ التخطيط', 'نظرة عامة على النشر'],
    },
    color: '#01A6A6',
  },
  {
    title:    { en: 'One-to-one Coaching',         ar: 'التدريب الفردي' },
    duration: { en: 'Flexible sessions',           ar: 'جلسات مرنة' },
    audience: { en: 'Individuals',                 ar: 'الأفراد' },
    desc:     { en: 'Personalised coaching for writers, creatives and professionals looking to develop their skills, complete a project or build their creative practice — in Bahrain or online.', ar: 'تدريب شخصي للكتّاب والمبدعين والمهنيين الراغبين في تطوير مهاراتهم أو استكمال مشروع أو بناء ممارستهم الإبداعية — في البحرين أو عبر الإنترنت.' },
    topics: {
      en: ['Bespoke programme', 'Flexible scheduling', 'In-person or online', 'Arabic & English', 'Progress-focused'],
      ar: ['برنامج مخصص', 'جدولة مرنة', 'حضوريًا أو عبر الإنترنت', 'عربي وإنجليزي', 'مرتكز على التقدم'],
    },
    color: '#773E84',
  },
]

const whoTags = [
  { en: 'Authors',        ar: 'المؤلفون' },
  { en: 'Educators',      ar: 'المربون' },
  { en: 'Marketing Teams',ar: 'فرق التسويق' },
  { en: 'HR Professionals',ar: 'متخصصو الموارد البشرية' },
  { en: 'NGOs',           ar: 'المنظمات غير الربحية' },
  { en: 'Publishers',     ar: 'الناشرون' },
  { en: 'Corporate Teams',ar: 'الفرق المؤسسية' },
  { en: 'Individuals',    ar: 'الأفراد' },
]

export default function Coaching() {
  const navigate = useNavigate()
  const { lang } = useLang()
  const isAr = lang === 'ar'
  const t = (obj) => isAr ? obj.ar : obj.en

  return (
    <>
      <section className="page-hero">
        <div className="hgrid" />
        <div className="page-hero-inner">
          <span className="sec-lbl">{isAr ? 'التعليم الإبداعي' : 'Creative education'}</span>
          <h1>{isAr ? <>التدريب<br />وورش العمل</> : <>Coaching &amp;<br />Workshops</>}</h1>
          <p>{isAr ? 'تمكين الكتّاب والمربين والمهنيين من خلال التدريب الإبداعي وورش السرد القصصي وجلسات تطوير العلامة التجارية — في البحرين وعبر الإنترنت.' : 'Empowering writers, educators and professionals through creative coaching, storytelling workshops and brand development sessions — in Bahrain and online.'}</p>
        </div>
      </section>

      {/* STATS */}
      <div className={styles.stats}>
        <div className={styles.stat}><strong>20+</strong><span>{isAr ? 'عامًا من التدريب' : 'Years coaching'}</span></div>
        <div className={styles.statDiv} />
        <div className={styles.stat}><strong>AR+EN</strong><span>{isAr ? 'برامج ثنائية اللغة' : 'Bilingual programmes'}</span></div>
        <div className={styles.statDiv} />
        <div className={styles.stat}><strong>{isAr ? 'عبر الإنترنت' : 'Online'}</strong><span>{isAr ? 'وحضوريًا' : '& in-person'}</span></div>
        <div className={styles.statDiv} />
        <div className={styles.stat}><strong>{isAr ? 'مخصص' : 'Custom'}</strong><span>{isAr ? 'مصمَّم لك' : 'Tailored to you'}</span></div>
      </div>

      {/* PROGRAMMES */}
      <section className={styles.programmes}>
        <span className="sec-lbl">{isAr ? 'برامجنا' : 'Our programmes'}</span>
        <h2 className="sec-ttl">{isAr ? 'ورش العمل والجلسات' : 'Workshops & sessions'}</h2>
        <div className={styles.grid}>
          {programmes.map((p, i) => (
            <div key={i} className={styles.card}>
              <div className={styles.cardBar} style={{ background: p.color }} />
              <div className={styles.cardHead}>
                <span className={styles.cardTag} style={{ color: p.color, borderColor: p.color }}>{t(p.duration)}</span>
                <span className={styles.cardAudience}>{t(p.audience)}</span>
              </div>
              <h3 className={styles.cardTitle}>{t(p.title)}</h3>
              <p className={styles.cardDesc}>{t(p.desc)}</p>
              <ul className={styles.topics}>
                {t(p.topics).map(topic => (
                  <li key={topic}><span className={styles.topicDot} style={{ background: p.color }} />{topic}</li>
                ))}
              </ul>
              <button className={styles.enquireBtn} style={{ background: p.color }} onClick={() => navigate('/contact')}>{isAr ? 'استفسر ←' : 'Enquire →'}</button>
            </div>
          ))}
        </div>
      </section>

      {/* WHO */}
      <section className={styles.who}>
        <div className={styles.whoL}>
          <span className="sec-lbl">{isAr ? 'من يحضر' : 'Who attends'}</span>
          <h2 className="sec-ttl" style={{ color: '#000' }}>{isAr ? <>مصمَّم<br />للمبدعين</> : <>Built for<br />creators</>}</h2>
          <p className={styles.whoP}>{isAr ? 'ورشاتنا مصممة لكل من لديه قصة يريد روايتها. سواء كنت مؤلفًا طموحًا أو مربيًا أو متخصصًا في التسويق أو صاحب عمل — لدينا برنامج مناسب لك.' : 'Our workshops are designed for anyone with a story to tell. Whether you are an aspiring author, an educator, a marketing professional or a business owner — we have a programme for you.'}</p>
          <div className={styles.whoTags}>
            {whoTags.map(tag => (
              <span key={tag.en} className={styles.whoTag}>{isAr ? tag.ar : tag.en}</span>
            ))}
          </div>
        </div>
        <div className={styles.whoR}>
          <div className={styles.whoBox}>
            <div className={styles.whoBig}>20+</div>
            <div className={styles.whoLbl}>{isAr ? <>عامًا من التدريب<br />وورش العمل الإبداعية</> : <>Years of coaching<br />&amp; creative workshops</>}</div>
          </div>
          <p className={styles.whoQuote}>{isAr ? '"غيّرت الورشة طريقة تفكيري في الكتابة للأطفال. عملية، ملهِمة، ووتيرتها مثالية." — أحد المشاركين' : '"The workshop transformed how I think about writing for children. Practical, inspiring and perfectly paced." — Workshop Participant'}</p>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <h2>{isAr ? 'هل أنت مستعد للبدء؟' : 'Ready to get started?'}</h2>
        <p>{isAr ? 'تواصل معنا لمناقشة البرنامج المناسب لك أو لفريقك.' : 'Get in touch to discuss the right programme for you or your team.'}</p>
        <button className={styles.ctaBtn} onClick={() => navigate('/contact')}>{isAr ? 'استفسر عن الجلسات ←' : 'Enquire about sessions →'}</button>
      </section>
    </>
  )
}
