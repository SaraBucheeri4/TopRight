import styles from "./Events.module.css";
import { useLang } from "../../LangContext";

const csrCards = [
  {
    title: "Supporting local artists",
    titleAr: "دعم الفنانين المحليين",
    body: "Providing platforms and opportunities for Bahrain-based creatives to exhibit and sell their work.",
    bodyAr: "توفير منصات وفرص للمبدعين البحرينيين لعرض أعمالهم وبيعها.",
    color: "#E7432B",
  },
  {
    title: "Cultural preservation",
    titleAr: "الحفاظ على الموروث الثقافي",
    body: "Documenting and celebrating Gulf heritage through publication, illustration and storytelling.",
    bodyAr:
      "توثيق التراث الخليجي والاحتفاء به من خلال النشر والرسوم التوضيحية والسرد القصصي.",
    color: "#0058A1",
  },
  {
    title: "Educational outreach",
    titleAr: "التوعية التعليمية",
    body: "Free and subsidised workshops for schools, community centres and non-profit organisations.",
    bodyAr:
      "ورش عمل مجانية ومدعومة للمدارس ومراكز المجتمع والمنظمات غير الربحية.",
    color: "#01A6A6",
  },
  {
    title: "Bilingual accessibility",
    titleAr: "إمكانية الوصول بلغتين",
    body: "Ensuring creative and educational content is equally accessible in Arabic and English.",
    bodyAr:
      "ضمان إتاحة المحتوى الإبداعي والتعليمي بالتساوي باللغتين العربية والإنجليزية.",
    color: "#773E84",
  },
];

export default function Events() {
  const { lang } = useLang();
  const isAr = lang === "ar";

  return (
    <>
      <section className="page-hero">
        <div className="hgrid" />
        <div className="page-hero-inner">
          <span className="sec-lbl">
            {isAr ? "المجتمع والمسؤولية" : "Community & Responsibility"}
          </span>
          <h1>
            {isAr ? (
              <>
                الفعاليات
                <br />
                والمسؤولية
              </>
            ) : (
              <>
                Events &amp;
                <br />
                CSR
              </>
            )}
          </h1>
          <p>
            {isAr
              ? "بعيدًا عن التصميم والنشر، تستثمر توب رايت في المبادرات المجتمعية التي تجسّد الإبداع في البحرين ومنطقة الخليج."
              : "Beyond design and publishing, Top Right invests in community-driven initiatives that bring creativity to life in Bahrain and the wider Gulf."}
          </p>
        </div>
      </section>

      {/* LOCAL MINIATURES */}
      <section className={styles.initiative}>
        <div className={styles.initL}>
          <span className={styles.initLabel}>
            {isAr ? "/ مبادرة" : "/ Initiative"}
          </span>
          <h2>
            {isAr ? (
              <>
                المنمنمات
                <br />
                المحلية
              </>
            ) : (
              <>
                Local
                <br />
                Miniatures
              </>
            )}
          </h2>
          <p>
            {isAr
              ? "مبادرة من توب رايت للاحتفاء بفن المنمنمات والثقافة الإبداعية المحلية في البحرين. جمع حفلنا الافتتاحي الفنانين والهواة وأفراد المجتمع في تجربة غامرة من الحرفية البحرينية والإبداع."
              : "A Top Right initiative celebrating miniature art and local creative culture in Bahrain. Our inaugural event brought together artists, collectors and community members for an immersive experience of Bahraini craft and creativity."}
          </p>
          <p>
            {isAr
              ? "يهدف مشروع المنمنمات المحلية إلى إنشاء منصة منتظمة للفنانين البحرينيين العاملين في مجالات الفنون المنمنمة — من النحت والرسم إلى صنع النماذج والوسائط المتعددة."
              : "The Local Miniatures project aims to create a regular platform for Bahrain-based artists working in miniature-scale disciplines — from sculpture and painting to model-making and mixed media."}
          </p>
          <div className={styles.initMeta}>
            <div className={styles.metaItem}>
              <span>{isAr ? "الموقع" : "Location"}</span>
              <strong>{isAr ? "البحرين" : "Bahrain"}</strong>
            </div>
            <div className={styles.metaItem}>
              <span>{isAr ? "العام" : "Year"}</span>
              <strong>2025</strong>
            </div>
            <div className={styles.metaItem}>
              <span>{isAr ? "فعاليات منظَّمة" : "Events held"}</span>
              <strong>1</strong>
            </div>
          </div>
          <a
            href="https://www.instagram.com/local_miniatures"
            target="_blank"
            rel="noopener"
            className={styles.igBtn}
          >
            {isAr ? "تابعنا على إنستغرام ←" : "Follow on Instagram →"}
          </a>
        </div>
        <div className={styles.initR}>
          <div className={styles.initCircle}>
            <div className={styles.initCircleInner} />
            <span className={styles.initNum}>1</span>
          </div>
          <span className={styles.initSubLabel}>
            {isAr ? "فعالية منظَّمة" : "Event held"}
          </span>
          <span className={styles.initDetail}>
            {isAr ? (
              <>
                البحرين · ٢٠٢٥
                <br />
                المزيد من الفعاليات قادمة قريبًا
              </>
            ) : (
              <>
                Bahrain · 2025
                <br />
                More events coming soon
              </>
            )}
          </span>
        </div>
      </section>

      {/* CSR COMMITMENT */}
      <section className={styles.csr}>
        <span className="sec-lbl">{isAr ? "التزامنا" : "Our commitment"}</span>
        <h2 className="sec-ttl">
          {isAr ? "المسؤولية الإبداعية" : "Creative responsibility"}
        </h2>
        <div className={styles.csrGrid}>
          {csrCards.map((c, i) => (
            <div key={i} className={styles.csrCard}>
              <div className={styles.csrBar} style={{ background: c.color }} />
              <strong>{isAr ? c.titleAr : c.title}</strong>
              <p>{isAr ? c.bodyAr : c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* UPCOMING */}
      <section className={styles.upcoming}>
        <div className={styles.upcomingInner}>
          <span className="sec-lbl">{isAr ? "ما هو قادم" : "What's next"}</span>
          <h2 className="sec-ttl">{isAr ? "قريبًا" : "Coming soon"}</h2>
          <div className={styles.upcomingCards}>
            <div className={styles.upCard}>
              <span className={styles.upTag}>
                {isAr ? "/ قادم" : "/ Upcoming"}
              </span>
              <h3>
                {isAr
                  ? "المنمنمات المحلية — الإصدار الثاني"
                  : "Local Miniatures — Edition 2"}
              </h3>
              <p>
                {isAr
                  ? "النسخة الثانية من احتفالنا بفن المنمنمات. سيُعلَن عن الموقع والتاريخ لاحقًا. تابع حسابنا على إنستغرام للاطلاع على آخر المستجدات."
                  : "The second instalment of our miniature art celebration. Location and date to be announced. Follow our Instagram for updates."}
              </p>
              <span className={styles.upDate}>
                {isAr ? "البحرين · ٢٠٢٦ (سيُحدَّد)" : "Bahrain · 2026 (TBC)"}
              </span>
            </div>
            <div className={styles.upCard}>
              <span className={styles.upTag}>
                {isAr ? "/ قيد التطوير" : "/ In development"}
              </span>
              <h3>
                {isAr
                  ? "برنامج المدارس الإبداعية"
                  : "Creative Schools Programme"}
              </h3>
              <p>
                {isAr
                  ? "برنامج توعوي منظَّم يجلب ورش الكتابة الإبداعية والرسوم التوضيحية إلى المدارس في جميع أنحاء البحرين."
                  : "A structured outreach programme bringing creative writing and illustration workshops to schools across Bahrain."}
              </p>
              <span className={styles.upDate}>
                {isAr ? "الإطلاق في ٢٠٢٦" : "Launching 2026"}
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
