import { useState } from "react";
import styles from "./Work.module.css";
import { useLang } from "../LangContext";

const tabs = [
  { key: "All", en: "All", ar: "الكل" },
  { key: "Newsletter", en: "Newsletter", ar: "النشرات" },
  { key: "HSE", en: "HSE", ar: "السلامة" },
  { key: "Storybooks", en: "Storybooks", ar: "كتب القصص" },
  { key: "Illustration", en: "Illustration", ar: "الرسوم" },
  { key: "Animation", en: "Animation", ar: "الرسوم المتحركة" },
  { key: "Corporate", en: "Corporate", ar: "المؤسسي" },
];

const projects = [
  {
    cat: "newsletter",
    img: "/photos/khaleej.jpeg",
    label: "Newsletter · GPIC",
    labelAr: "نشرة · GPIC",
    title: "Khaleejieh · خليجية",
    sub: "Monthly bilingual newsletter · Print & Digital · 118+ issues since 2001",
    subAr:
      "نشرة شهرية ثنائية اللغة · طباعة ورقمية · أكثر من ١١٨ إصدارًا منذ ٢٠٠١",
    year: "2001–present",
  },
  {
    cat: "newsletter",
    img: "/photos/injaz.jpeg",
    label: "Annual Report · INJAZ Bahrain",
    labelAr: "تقرير سنوي · إنجاز البحرين",
    title: "INJAZ Annual Report",
    sub: "Bilingual annual report · Arabic & English · Full design, layout & print",
    subAr:
      "تقرير سنوي ثنائي اللغة · عربي وإنجليزي · تصميم وتخطيط وطباعة متكاملة",
    year: "2023",
  },
  {
    cat: "hse",
    img: "/photos/alnamlah.jpeg",
    label: "HSE · Bapco Energies",
    labelAr: "السلامة المهنية · باب كو إينرجيز",
    title: "Safety with Namool · السلامة مع نمول",
    sub: "Bilingual illustrated HSE storybook · Full illustration, layout & print",
    subAr:
      "قصة مصورة ثنائية اللغة للسلامة المهنية · رسوم وتخطيط وطباعة متكاملة",
    year: "2024",
  },
  {
    cat: "hse",
    img: "/photos/babco.jpeg",
    label: "HSE Education · Bapco Energies",
    labelAr: "تعليم السلامة · باب كو إينرجيز",
    title: "UN SDG Booklet Series",
    sub: "Bilingual illustrated education series · 3 booklets · Arabic & English",
    subAr: "سلسلة تعليمية مصورة ثنائية اللغة · ٣ كتيبات · عربي وإنجليزي",
    year: "2023",
  },
  {
    cat: "storybooks",
    img: "/photos/qadamai.jpeg",
    label: "Children's Book",
    labelAr: "كتاب أطفال",
    title: "قدماي متحجرتان",
    sub: "Full illustration & layout · Author: Hanan Saleh",
    subAr: "رسوم وتخطيط متكاملة · المؤلفة: حنان صالح",
    year: "2022",
  },
  {
    cat: "illustration",
    img: "/photos/albasta.jpeg",
    label: "Illustration · Bahrain TV",
    labelAr: "رسوم توضيحية · تلفزيون البحرين",
    title: "Al Basta Market · سوق البسطة",
    sub: "Character & scene illustration series · Bahrain Television",
    subAr: "سلسلة رسوم توضيحية للشخصيات والمشاهد · تلفزيون البحرين",
    year: "2022",
  },
  {
    cat: "animation",
    img: null,
    label: "Animation",
    labelAr: "رسوم متحركة",
    title: "Animated eBook Series",
    sub: "HTML5 embedded animation · Digital publication · GCC Secretariat",
    subAr: "رسوم متحركة HTML5 مدمجة · منشور رقمي · أمانة مجلس التعاون الخليجي",
    year: "2023",
  },
  {
    cat: "corporate",
    img: null,
    label: "Corporate · Ministry of Interior",
    labelAr: "مؤسسي · وزارة الداخلية",
    title: "Annual Corporate Report",
    sub: "Full bilingual design, layout and print · Ministry of Interior, Bahrain",
    subAr: "تصميم وتخطيط وطباعة متكاملة ثنائية اللغة · وزارة الداخلية، البحرين",
    year: "2024",
  },
];

export default function Work() {
  const [activeTab, setActiveTab] = useState("All");
  const { lang } = useLang();
  const isAr = lang === "ar";

  const filtered = projects.filter(
    (p) => activeTab === "All" || p.cat === activeTab.toLowerCase(),
  );

  return (
    <>
      {/* HERO */}
      <section className="page-hero">
        <div className="hgrid" />
        <div className="page-hero-inner">
          <span className="sec-lbl">
            {isAr ? "أعمال مختارة" : "Selected work"}
          </span>
          <h1>
            {isAr ? (
              "معرض\nأعمالنا"
            ) : (
              <>
                Our
                <br />
                Portfolio
              </>
            )}
          </h1>
          <p>
            {isAr
              ? "أكثر من ٢٠ عامًا من العمل الإبداعي ثنائي اللغة في البحرين ومنطقة الخليج — تصميم مطبوعات، رسوم توضيحية، رسوم متحركة، كتب أطفال والمزيد."
              : "20+ years of bilingual creative work across Bahrain and the GCC — publication design, illustration, animation, children's books and more."}
          </p>
        </div>
      </section>

      {/* FILTER TABS */}
      <section className={styles.section}>
        <div className={styles.tabs}>
          {tabs.map((t) => (
            <button
              key={t.key}
              className={`${styles.tab} ${activeTab === t.key ? styles.tabOn : ""}`}
              onClick={() => setActiveTab(t.key)}
            >
              {isAr ? t.ar : t.en}
            </button>
          ))}
        </div>

        <div className={styles.grid}>
          {filtered.map((p, i) => (
            <div key={i} className={styles.card}>
              <div className={styles.thumb}>
                {p.img ? (
                  <img
                    src={p.img}
                    alt={p.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div className="ph-card" style={{ height: "100%" }}>
                    {isAr ? "الصورة قادمة قريبًا" : "Image Coming Soon"}
                  </div>
                )}
              </div>
              <div className={styles.info}>
                <span className={styles.cardCat}>
                  {isAr ? p.labelAr : p.label}
                </span>
                <h3 className={styles.cardTtl}>{p.title}</h3>
                <p className={styles.cardSub}>{isAr ? p.subAr : p.sub}</p>
                <span className={styles.cardYear}>{p.year}</span>
                <span className={styles.cardArrow}>
                  {isAr ? "عرض المشروع ←" : "View project →"}
                </span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className={styles.empty}>
              {isAr
                ? "لا توجد مشاريع في هذه الفئة بعد — تابعونا قريبًا."
                : "No projects in this category yet — check back soon."}
            </p>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <h2>{isAr ? "لديك مشروع في ذهنك؟" : "Have a project in mind?"}</h2>
        <p>
          {isAr
            ? "من الفكرة حتى الطباعة — نتولى كل شيء، بلغتين."
            : "From concept to print — we handle it all, fully bilingual."}
        </p>
        <a href="/contact" className={styles.ctaBtn}>
          {isAr ? "ابدأ مشروعك ←" : "Start a project →"}
        </a>
      </section>
    </>
  );
}
