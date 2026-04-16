import styles from "./Services.module.css";
import { useLang } from "../../LangContext";

const services = [
  {
    n: "01",
    tag: "Publications",
    tagAr: "المطبوعات",
    color: "#E7432B",
    title: "Publication Design",
    titleAr: "تصميم المطبوعات",
    desc: "Books, newsletters, annual reports and HSE manuals — printed and digital, fully bilingual in Arabic and English from concept through to print. We handle writing, editing, layout and production.",
    descAr:
      "الكتب والنشرات والتقارير السنوية وأدلة السلامة المهنية — مطبوعة ورقمية، ثنائية اللغة بالكامل من الفكرة حتى الطباعة. نتولى الكتابة والتحرير والتخطيط والإنتاج.",
    items: [
      "Annual Reports",
      "Corporate Newsletters",
      "HSE Manuals & Booklets",
      "Company Profiles",
      "Magazines & Journals",
    ],
    itemsAr: [
      "التقارير السنوية",
      "النشرات المؤسسية",
      "أدلة وكتيبات السلامة المهنية",
      "ملفات تعريف الشركات",
      "المجلات والدوريات",
    ],
  },
  {
    n: "02",
    tag: "Illustration",
    tagAr: "الرسوم التوضيحية",
    color: "#01A6A6",
    title: "Editorial Art & Illustration",
    titleAr: "الفن التحريري والرسوم التوضيحية",
    desc: "Storybooks and activity books for children and young adults — full character development, graphic art and complete layout from start to finish. Bilingual and culturally rooted in the Gulf.",
    descAr:
      "كتب القصص والكتب التعليمية للأطفال والشباب — تطوير شخصيات متكامل وفن رسومي وتخطيط كامل من البداية إلى النهاية. ثنائية اللغة ومتجذرة ثقافيًا في الخليج.",
    items: [
      "Children's Story Books",
      "Activity & Educational Books",
      "Character Development",
      "Cover Art",
      "Infographic Illustration",
    ],
    itemsAr: [
      "كتب القصص للأطفال",
      "الكتب التعليمية والتفاعلية",
      "تطوير الشخصيات",
      "فن الأغلفة",
      "الرسوم التوضيحية الإنفوغرافية",
    ],
  },
  {
    n: "03",
    tag: "Animation",
    tagAr: "الرسوم المتحركة",
    color: "#1a1a1a",
    title: "Animation & Motion",
    titleAr: "الرسوم المتحركة والحركة",
    desc: "Character development to full animation. Digital publications with embedded animations — HTML5 eBooks, digital editions and interactive content that can be shared across devices.",
    descAr:
      "من تطوير الشخصيات إلى الرسوم المتحركة الكاملة. منشورات رقمية تتضمن رسومًا متحركة — كتب HTML5 وطبعات رقمية ومحتوى تفاعلي قابل للمشاركة على جميع الأجهزة.",
    items: [
      "Character Animation",
      "Explainer Videos",
      "HTML5 Animated eBooks",
      "Motion Graphics",
      "Digital Interactive Content",
    ],
    itemsAr: [
      "رسوم شخصيات متحركة",
      "فيديوهات شرح",
      "كتب HTML5 متحركة",
      "الرسوم الجرافيكية المتحركة",
      "المحتوى الرقمي التفاعلي",
    ],
  },
  {
    n: "04",
    tag: "Corporate",
    tagAr: "المؤسسي",
    color: "#0058A1",
    title: "Corporate & Guideline Books",
    titleAr: "الكتب المؤسسية والإرشادية",
    desc: "Corporate communication books, brand guidelines and process manuals — structured, clear and brand-consistent throughout every spread. Bilingual where required.",
    descAr:
      "كتب التواصل المؤسسي وإرشادات العلامة التجارية وأدلة العمليات — منظمة وواضحة ومتسقة مع الهوية المؤسسية في كل صفحة. ثنائية اللغة عند الحاجة.",
    items: [
      "Brand Guidelines",
      "Policy & Procedure Manuals",
      "Employee Handbooks",
      "Training Materials",
      "Process Documentation",
    ],
    itemsAr: [
      "إرشادات العلامة التجارية",
      "أدلة السياسات والإجراءات",
      "أدلة الموظفين",
      "مواد التدريب",
      "توثيق العمليات",
    ],
  },
  {
    n: "05",
    tag: "Digital",
    tagAr: "الرقمي",
    color: "#000",
    title: "Digital Publications",
    titleAr: "المنشورات الرقمية",
    desc: "Interactive eBooks, HTML5 mini-websites and digital editions with embedded animations — modern, accessible and shareable on every device. Perfect for organisations going paperless.",
    descAr:
      "كتب إلكترونية تفاعلية ومواقع HTML5 مصغرة وطبعات رقمية تتضمن رسومًا متحركة — حديثة وسهلة الوصول وقابلة للمشاركة على جميع الأجهزة. مثالية للمؤسسات التي تتجه نحو العمل الرقمي.",
    items: [
      "Interactive eBooks (PDF & HTML5)",
      "Digital Annual Reports",
      "Online Magazines",
      "Embedded Video & Animation",
      "Accessible Digital Formats",
    ],
    itemsAr: [
      "كتب إلكترونية تفاعلية (PDF وHTML5)",
      "تقارير سنوية رقمية",
      "مجلات إلكترونية",
      "فيديو ورسوم متحركة مدمجة",
      "صيغ رقمية سهلة الوصول",
    ],
  },
  {
    n: "06",
    tag: "Coaching",
    tagAr: "التدريب",
    color: "#773E84",
    title: "Coaching & Workshops",
    titleAr: "التدريب وورش العمل",
    desc: "Creative writing, storytelling and brand development workshops for individuals, teams and organisations — in Bahrain and online. Tailored programmes for all levels.",
    descAr:
      "ورش عمل في الكتابة الإبداعية والسرد القصصي وتطوير العلامة التجارية للأفراد والفرق والمؤسسات — في البحرين وعبر الإنترنت. برامج مصممة لجميع المستويات.",
    items: [
      "Creative Writing Workshops",
      "Storytelling for Business",
      "Brand Voice Development",
      "Bilingual Writing Skills",
      "One-to-one Coaching",
    ],
    itemsAr: [
      "ورش الكتابة الإبداعية",
      "السرد القصصي للأعمال",
      "تطوير صوت العلامة التجارية",
      "مهارات الكتابة ثنائية اللغة",
      "التدريب الفردي",
    ],
  },
];

export default function Services() {
  const { lang } = useLang();
  const isAr = lang === "ar";

  const processSteps = [
    {
      n: "01",
      title: "Brief & Discovery",
      titleAr: "الإحاطة والاستكشاف",
      body: "We learn about your goals, audience and timeline — in Arabic, English or both.",
      bodyAr:
        "نتعرف على أهدافك وجمهورك والجدول الزمني — بالعربية أو الإنجليزية أو كلتيهما.",
    },
    {
      n: "02",
      title: "Concept & Strategy",
      titleAr: "المفهوم والاستراتيجية",
      body: "Our creative team develops a direction and presents options for your approval.",
      bodyAr: "يطور فريقنا الإبداعي توجهًا ويعرض خيارات لاعتمادك.",
    },
    {
      n: "03",
      title: "Design & Production",
      titleAr: "التصميم والإنتاج",
      body: "We bring it to life — fully bilingual, to specification, on time.",
      bodyAr:
        "نحوّله إلى واقع — ثنائي اللغة بالكامل، وفق المواصفات، في الموعد المحدد.",
    },
    {
      n: "04",
      title: "Review & Delivery",
      titleAr: "المراجعة والتسليم",
      body: "You review, we refine. Final files delivered print-ready or web-optimised.",
      bodyAr:
        "تراجع، ونحسّن. يُسلَّم الملف النهائي جاهزًا للطباعة أو محسَّنًا للويب.",
    },
  ];

  return (
    <>
      <section className="page-hero">
        <div className="hgrid" />
        <div className="page-hero-inner">
          <span className="sec-lbl">{isAr ? "ما نقدمه" : "What we offer"}</span>
          <h1>
            {isAr ? (
              <>خدماتنا</>
            ) : (
              <>
                Our
                <br />
                Services
              </>
            )}
          </h1>
          <p>
            {isAr
              ? "خدمات إبداعية متكاملة من الفكرة حتى الطباعة. فريق واحد، جهة تواصل واحدة — كتابة وتصميم ورسوم توضيحية ورسوم متحركة وتدريب، كل ذلك بلغتين."
              : "Full-service creative from concept to print. One team, one contact — writing, design, illustration, animation and coaching, all bilingual."}
          </p>
        </div>
      </section>

      <section className={styles.grid}>
        {services.map((s) => (
          <div
            key={s.n}
            className={styles.card}
            style={{ "--accent": s.color }}
          >
            <div className={styles.cardTop}>
              <span className={styles.n}>{s.n}</span>
              <span
                className={styles.tag}
                style={{ borderColor: s.color, color: s.color }}
              >
                {isAr ? s.tagAr : s.tag}
              </span>
            </div>
            <h3 className={styles.title}>{isAr ? s.titleAr : s.title}</h3>
            <p className={styles.desc}>{isAr ? s.descAr : s.desc}</p>
            <ul className={styles.list}>
              {(isAr ? s.itemsAr : s.items).map((item) => (
                <li key={item}>
                  <span
                    className={styles.bullet}
                    style={{ background: s.color }}
                  />
                  {item}
                </li>
              ))}
            </ul>
            <a
              href="/contact"
              className={styles.cta}
              style={{ color: s.color, borderColor: s.color }}
            >
              {isAr ? "ابدأ مشروعك ←" : "Start a project →"}
            </a>
          </div>
        ))}
      </section>

      {/* PROCESS */}
      <section className={styles.process}>
        <span className="sec-lbl">{isAr ? "كيف نعمل" : "How we work"}</span>
        <h2 className="sec-ttl">{isAr ? "منهجيتنا" : "Our process"}</h2>
        <div className={styles.steps}>
          {processSteps.map((s) => (
            <div key={s.n} className={styles.step}>
              <span className={styles.stepN}>{s.n}</span>
              <strong>{isAr ? s.titleAr : s.title}</strong>
              <p>{isAr ? s.bodyAr : s.body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
