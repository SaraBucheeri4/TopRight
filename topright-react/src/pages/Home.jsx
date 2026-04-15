import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Marquee from '../components/Marquee'
import styles from './Home.module.css'
import { useLang } from '../LangContext'

const clients = ['GPIC', 'Bapco Energies', 'Ministry of Interior',
  'Sharjah Heritage Institute', 'GCC Secretariat', 'INJAZ Bahrain', 'Bahrain Television']

const portfolioCards = [
  {
    cat: 'newsletter', img: '/photos/khaleej.jpeg',
    label: { en: 'Newsletter · GPIC', ar: 'نشرة · GPIC' },
    title: 'Khaleejieh · خليجية',
    sub: { en: 'Monthly bilingual newsletter · Print & Digital · 118+ issues since 2001', ar: 'نشرة شهرية ثنائية اللغة · طباعة ورقمية · أكثر من ١١٨ إصدارًا منذ ٢٠٠١' },
  },
  {
    cat: 'newsletter', img: '/photos/injaz.jpeg',
    label: { en: 'Annual Report · INJAZ Bahrain', ar: 'تقرير سنوي · إنجاز البحرين' },
    title: 'INJAZ Annual Report',
    sub: { en: 'Bilingual annual report · Arabic & English · Full design, layout & print', ar: 'تقرير سنوي ثنائي اللغة · عربي وإنجليزي · تصميم وتخطيط وطباعة متكاملة' },
  },
  {
    cat: 'hse', img: '/photos/alnamlah.jpeg',
    label: { en: 'HSE · Bapco Energies', ar: 'السلامة المهنية · باب كو إينرجيز' },
    title: 'Safety with Namool · السلامة مع نمول',
    sub: { en: 'Bilingual illustrated HSE storybook · Full illustration, layout & print · 2024', ar: 'قصة مصورة ثنائية اللغة للسلامة المهنية · رسوم وتخطيط وطباعة متكاملة · ٢٠٢٤' },
  },
  {
    cat: 'hse', img: '/photos/babco.jpeg',
    label: { en: 'HSE Education · Bapco Energies', ar: 'تعليم السلامة · باب كو إينرجيز' },
    title: 'UN SDG Booklet Series',
    sub: { en: 'Bilingual illustrated education series · 3 booklets · Arabic & English', ar: 'سلسلة تعليمية مصورة ثنائية اللغة · ٣ كتيبات · عربي وإنجليزي' },
  },
  {
    cat: 'storybooks', img: '/photos/qadamai.jpeg',
    label: { en: "Children's Book", ar: 'كتاب أطفال' },
    title: 'قدماي متحجرتان',
    sub: { en: 'Full illustration & layout · Author: Hanan Saleh', ar: 'رسوم وتخطيط متكاملة · المؤلفة: حنان صالح' },
  },
  {
    cat: 'illustration', img: '/photos/albasta.jpeg',
    label: { en: 'Illustration · Bahrain TV', ar: 'رسوم توضيحية · تلفزيون البحرين' },
    title: 'Al Basta Market · سوق البسطة',
    sub: { en: 'Character & scene illustration series · Bahrain Television', ar: 'سلسلة رسوم توضيحية للشخصيات والمشاهد · تلفزيون البحرين' },
  },
]

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

const testimonials = [
  {
    quote: { en: '"TopRight understood our brand and delivered the publication exactly as we envisioned — fully bilingual, on time, without needing constant guidance. A studio we trust completely for our annual publications."', ar: '"فهمت توب رايت علامتنا التجارية وسلّمت المطبوع تمامًا كما تصورناه — ثنائي اللغة بالكامل، في الوقت المحدد، دون الحاجة إلى توجيه مستمر. استوديو نثق به تمامًا لمطبوعاتنا السنوية."' },
    name: { en: 'Senior Communications Manager', ar: 'مدير الاتصالات الأول' },
    company: 'GPIC — Gulf Petrochemical Industries Company',
    color: '#01A6A6', initial: 'G',
  },
  {
    quote: { en: '"The illustrated HSE booklets were a major success on our Safety Day. TopRight managed everything from writing and illustration through to print — one team, one contact, zero complications."', ar: '"كانت الكتيبات المصورة للسلامة المهنية نجاحًا كبيرًا في يوم السلامة لدينا. تولّت توب رايت كل شيء من الكتابة والرسوم حتى الطباعة — فريق واحد، جهة تواصل واحدة، صفر تعقيدات."' },
    name: { en: 'HSE Manager', ar: 'مدير السلامة والصحة المهنية' },
    company: 'Bapco Energies',
    color: '#E7432B', initial: 'B',
  },
]

const services = [
  { cls: styles.svA, n: '01', tag: { en: 'Publications',  ar: 'المطبوعات' },  title: { en: 'Publication Design',          ar: 'تصميم المطبوعات' },           desc: { en: 'Books, newsletters, annual reports and HSE manuals — printed and digital, fully bilingual in Arabic and English from concept through to print.',    ar: 'الكتب والنشرات والتقارير السنوية وأدلة السلامة المهنية — مطبوعة ورقمية، ثنائية اللغة من الفكرة حتى الطباعة.' } },
  { cls: styles.svC, n: '02', tag: { en: 'Illustration',  ar: 'الرسوم التوضيحية' }, title: { en: 'Editorial Art & Illustration', ar: 'الفن التحريري والرسوم التوضيحية' }, desc: { en: 'Storybooks and activity books for children and young adults — full character development, graphic art and complete layout from start to finish.', ar: 'كتب القصص والكتب التعليمية للأطفال والشباب — تطوير شخصيات متكامل وفن رسومي وتخطيط كامل.' } },
  { cls: styles.svF, n: '03', tag: { en: 'Animation',     ar: 'الرسوم المتحركة' }, title: { en: 'Animation & Motion',           ar: 'الرسوم المتحركة والحركة' },    desc: { en: 'Character development to full animation. Digital publications with embedded animations — HTML5 eBooks, digital editions and interactive content.', ar: 'من تطوير الشخصيات إلى الرسوم المتحركة الكاملة. منشورات رقمية تتضمن رسومًا متحركة — كتب HTML5 وطبعات رقمية ومحتوى تفاعلي.' } },
  { cls: styles.svD, n: '04', tag: { en: 'Corporate',     ar: 'المؤسسي' },      title: { en: 'Corporate & Guideline Books',  ar: 'الكتب المؤسسية والإرشادية' },  desc: { en: 'Corporate communication books, brand guidelines and process manuals — structured, clear and brand-consistent throughout every spread.',           ar: 'كتب التواصل المؤسسي وإرشادات العلامة التجارية وأدلة العمليات — منظمة وواضحة ومتسقة في كل صفحة.' } },
  { cls: styles.svB, n: '05', tag: { en: 'Digital',       ar: 'الرقمي' },       title: { en: 'Digital Publications',         ar: 'المنشورات الرقمية' },          desc: { en: 'Interactive eBooks, HTML5 mini-websites and digital editions with embedded animations — modern, accessible and shareable on every device.',        ar: 'كتب إلكترونية تفاعلية ومواقع HTML5 مصغرة وطبعات رقمية — حديثة وسهلة الوصول وقابلة للمشاركة على جميع الأجهزة.' } },
  { cls: styles.svE, n: '06', tag: { en: 'Coaching',      ar: 'التدريب' },      title: { en: 'Coaching & Workshops',         ar: 'التدريب وورش العمل' },         desc: { en: 'Creative writing, storytelling and brand development workshops for individuals, teams and organisations — in Bahrain and online.',                 ar: 'ورش عمل في الكتابة الإبداعية والسرد القصصي وتطوير العلامة التجارية للأفراد والفرق والمؤسسات — في البحرين وعبر الإنترنت.' } },
]

export default function Home() {
  const [activeTab, setActiveTab] = useState('All')
  const navigate = useNavigate()
  const { lang } = useLang()
  const isAr = lang === 'ar'

  const t = (obj) => isAr ? obj.ar : obj.en

  const filtered = portfolioCards.filter(c =>
    activeTab === 'All' || c.cat === activeTab.toLowerCase()
  )

  return (
    <>
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroL}>
          <span className={styles.heroTag}>{isAr ? 'البحرين · تأسست ٢٠٠١ · استوديو ثنائي اللغة' : 'Bahrain · Est. 2001 · Bilingual Studio'}</span>
          <h1 className={styles.heroH1}>
            {isAr ? (
              <>نحكي<br />قصتك<br /><span style={{ color: '#01A6A6' }}>بلغة التصميم</span></>
            ) : (
              <>We tell<br />your story<br /><span style={{ color: '#01A6A6' }}>through design</span></>
            )}
          </h1>
          <div className={styles.heroBtns}>
            <button className={styles.btnW} onClick={() => navigate('/work')}>{isAr ? 'استعرض أعمالنا' : 'View our work'}</button>
            <button className={styles.btnG} onClick={() => navigate('/contact')}>{isAr ? 'ابدأ مشروعك ←' : 'Start a project →'}</button>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.hstat}><strong>20+</strong><span>{isAr ? 'عامًا في البحرين' : 'Years in Bahrain'}</span></div>
            <div className={styles.hstat}><strong>100+</strong><span>{isAr ? 'مطبوعة' : 'Publications'}</span></div>
            <div className={styles.hstat}><strong>AR+EN</strong><span>{isAr ? 'ثنائي اللغة' : 'Bilingual'}</span></div>
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
      <div className={styles.clients}>
        <span className={styles.clLbl}>{isAr ? 'يثق بنا' : 'Trusted by'}</span>
        {clients.map((c, i) => (
          <span key={c} className={styles.clGroup}>
            {i > 0 && <span className={styles.clDiv} />}
            <span className={styles.clN}>{c}</span>
          </span>
        ))}
      </div>

      {/* PORTFOLIO */}
      <section className={styles.port}>
        <div className={styles.portHd}>
          <div>
            <span className="sec-lbl">{isAr ? 'أعمال مختارة' : 'Selected work'}</span>
            <h2 className="sec-ttl">{isAr ? <>{'+٢٠ عامًا من<br />القصص المروية'}</> : <>20+ years of<br />stories told</>}</h2>
          </div>
          <a href="/work" className={styles.secLink}>{isAr ? 'عرض جميع المشاريع' : 'View all projects'}</a>
        </div>

        <div className={styles.portTabs}>
          {tabs.map(tab => (
            <button key={tab.key} className={`${styles.ptab} ${activeTab === tab.key ? styles.ptabOn : ''}`} onClick={() => setActiveTab(tab.key)}>
              {isAr ? tab.ar : tab.en}
            </button>
          ))}
        </div>

        <div className={styles.portGrid}>
          {filtered.map((c, i) => (
            <div key={i} className={styles.pcard}>
              <div className={styles.pcardThumb}>
                <img src={c.img} alt={c.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div className={styles.pcardInfo}>
                <div className={styles.pcardCat}>{t(c.label)}</div>
                <div className={styles.pcardTtl}>{c.title}</div>
                <div className={styles.pcardSub}>{t(c.sub)}</div>
                <span className={styles.pcardArrow}>{isAr ? 'عرض المشروع ←' : 'View project →'}</span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className={styles.portEmpty}>{isAr ? 'لا توجد مشاريع في هذه الفئة بعد.' : 'No projects in this category yet.'}</p>}
        </div>
      </section>

      {/* SERVICES */}
      <section className={styles.svcs}>
        <span className="sec-lbl">{isAr ? 'ما نقدمه' : 'What we offer'}</span>
        <h2 className="sec-ttl" style={{ color: '#000' }}>{isAr ? <>خدمات إبداعية متكاملة،<br />من الفكرة حتى الطباعة</> : <>Full-service creative,<br />concept to print</>}</h2>
        <div className={styles.sg}>
          {services.map(s => (
            <div key={s.n} className={`${styles.sv} ${s.cls}`}>
              <div className={styles.svN}>{s.n}</div>
              <span className={styles.svTag}>{t(s.tag)}</span>
              <div className={styles.svTtl}>{t(s.title)}</div>
              <p className={styles.svDesc}>{t(s.desc)}</p>
              <a href="/services" className={styles.svLnk}>{isAr ? 'اكتشف المزيد ←' : 'Explore →'}</a>
            </div>
          ))}
        </div>
      </section>

      {/* WHY */}
      <section className={styles.why}>
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
          <div className={styles.whyBig}>20+</div>
          <div className={styles.whyLbl}>{isAr ? 'عامًا في البحرين' : 'Years in Bahrain'}</div>
          <div className={styles.whyBox}>
            <p>{isAr ? 'هل أنت مستعد لبدء مطبوعتك أو كتابك أو حملتك القادمة؟ يسعدنا سماع تفاصيل مشروعك.' : 'Ready to start your next publication, book or campaign? We would love to hear about your project.'}</p>
            <button onClick={() => navigate('/contact')}>{isAr ? 'تواصل معنا ←' : 'Get in touch →'}</button>
          </div>
        </div>
      </section>

      {/* COACHING TEASER */}
      <section className={styles.coaching}>
        <div className={styles.coaL}>
          <span className={styles.coaLbl}>{isAr ? 'التعليم الإبداعي' : 'Creative education'}</span>
          <h2>{isAr ? <>التدريب<br />وورش العمل</> : <>Coaching &amp;<br />Workshops</>}</h2>
          <p>{isAr ? 'تمكين الكتّاب والمربين والمهنيين من خلال التدريب الإبداعي وورش السرد القصصي وجلسات تطوير العلامة التجارية — في البحرين وعبر الإنترنت.' : 'Empowering writers, educators and professionals through creative coaching, storytelling workshops and brand development sessions — in Bahrain and online.'}</p>
          <button className={styles.btnWht} onClick={() => navigate('/coaching')}>{isAr ? 'استفسر عن الجلسات' : 'Enquire about sessions'}</button>
        </div>
        <div className={styles.coaR}>
          <div className={styles.coaRing} style={{ width: 280, height: 280 }} />
          <div className={styles.coaRing} style={{ width: 180, height: 180 }} />
          <div className={styles.coaBig}>20+</div>
          <div className={styles.coaLbl2}>{isAr ? <>عامًا من التدريب<br />وورش العمل الإبداعية</> : <>Years of coaching<br />&amp; creative workshops</>}</div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className={styles.testi}>
        <span className="sec-lbl">{isAr ? 'أصوات عملائنا' : 'Client voices'}</span>
        <h2 className="sec-ttl" style={{ color: '#000' }}>{isAr ? 'ماذا يقول عملاؤنا' : 'What our clients say'}</h2>
        <div className={styles.tg}>
          {testimonials.map((testimonial, i) => (
            <div key={i} className={styles.tc}>
              <span className={styles.tcQ}>"</span>
              <p className={styles.tcTxt}>{t(testimonial.quote)}</p>
              <div className={styles.tcRow}>
                <div className={styles.tcDot} style={{ background: testimonial.color }}>{testimonial.initial}</div>
                <div>
                  <div className={styles.tcName}>{t(testimonial.name)}</div>
                  <div className={styles.tcCo}>{testimonial.company}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
