import { useState, useEffect } from "react";
import styles from "./Work.module.css";
import { useLang } from "../LangContext";
import { supabase } from "../lib/supabase";

const tabs = [
  { key: "All", en: "All", ar: "الكل" },
  { key: "Newsletter", en: "Newsletter", ar: "النشرات" },
  { key: "HSE", en: "HSE", ar: "السلامة" },
  { key: "Storybooks", en: "Storybooks", ar: "كتب القصص" },
  { key: "Illustration", en: "Illustration", ar: "الرسوم" },
  { key: "Animation", en: "Animation", ar: "الرسوم المتحركة" },
  { key: "Corporate", en: "Corporate", ar: "المؤسسي" },
];

function getPublicUrl(filename) {
  if (!filename) return null;
  const { data } = supabase.storage.from("portfolio-images").getPublicUrl(filename);
  return data.publicUrl;
}

export default function Work() {
  const [activeTab, setActiveTab] = useState("All");
  const [projects, setProjects] = useState([]);
  const { lang } = useLang();
  const isAr = lang === "ar";

  useEffect(() => {
    supabase
      .from("portfolio_items")
      .select("*")
      .eq("is_published", true)
      .order("display_order")
      .then(({ data }) => {
        if (!data) return;
        setProjects(data.map(item => ({
          cat: item.category,
          img: item.image_url ? getPublicUrl(item.image_url) : null,
          label: item.label_en ?? "",
          labelAr: item.label_ar ?? "",
          title: item.title,
          sub: item.subtitle_en ?? "",
          subAr: item.subtitle_ar ?? "",
          year: item.year ?? "",
        })));
      });
  }, []);

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
