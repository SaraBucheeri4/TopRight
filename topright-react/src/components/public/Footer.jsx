import { useState, useEffect } from "react";
import { useLang } from "../../LangContext";
import styles from "./Footer.module.css";
import { fetchFooter } from "../../services/footerService";

export default function Footer() {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const [footer, setFooter] = useState(null);

  useEffect(() => { fetchFooter().then(setFooter) }, []);

  const desc = footer
    ? (isAr ? footer.description_ar : footer.description_en)
    : (isAr ? "استوديو إبداعي بحريني متخصص في الرسم التوضيحي ثنائي اللغة وتصميم المطبوعات وتطوير الهوية، يخدم مؤسسات منطقة الخليج منذ عام ٢٠٠١." : "A Bahraini creative studio specialising in bilingual illustration, publication design and brand development. Partnering organisations across the GCC since 2001.")

  const copyright = footer?.copyright_text
    ?? (isAr ? "© ٢٠٢٥ توب رايت لخدمات التصميم والدعم · البحرين · CR: 46817-1" : "© 2025 TopRight Design & Support Services · Bahrain · CR: 46817-1")

  function parseLinks(col, fallback) {
    try {
      const v = footer?.[col]
      return (v && typeof v === 'string') ? JSON.parse(v) : fallback
    } catch { return fallback }
  }

  const servicesLinks = parseLinks('services_links', [
    { en: 'Publication Design', ar: 'تصميم المطبوعات', url: '/#services' },
    { en: 'Illustration & Art', ar: 'الرسم التوضيحي', url: '/#services' },
    { en: 'Animation', ar: 'الرسوم المتحركة', url: '/#services' },
    { en: 'Corporate Books', ar: 'الكتب المؤسسية', url: '/#services' },
    { en: 'Digital Publications', ar: 'المنشورات الرقمية', url: '/#services' },
    { en: 'Coaching', ar: 'التدريب', url: '/#coaching' },
  ])

  const portfolioLinks = parseLinks('portfolio_links', [
    { en: "Children's Books", ar: 'كتب الأطفال', url: '/#work' },
    { en: 'HSE Publications', ar: 'مطبوعات السلامة المهنية', url: '/#work' },
    { en: 'Corporate', ar: 'مؤسسي', url: '/#work' },
    { en: 'Illustration', ar: 'الرسم التوضيحي', url: '/#work' },
    { en: 'Animation', ar: 'الرسوم المتحركة', url: '/#work' },
  ])

  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>
        <div className={styles.brand}>
          <img src="/logo.png" alt="Top Right" className={styles.logo} />
          <p className={styles.tagline}>
            {isAr ? "خدمات التصميم والدعم · البحرين · CR: 46817-1" : "Design & Support Services · Bahrain · CR: 46817-1"}
          </p>
          <p className={styles.desc}>{desc}</p>
        </div>

        <div className={styles.col}>
          <h4>{isAr ? (footer?.services_heading_ar || "الخدمات") : (footer?.services_heading_en || "Services")}</h4>
          {servicesLinks.map((l, i) => (
            <a key={i} href={l.url || '/#services'}>{isAr ? l.ar : l.en}</a>
          ))}
        </div>

        <div className={styles.col}>
          <h4>{isAr ? (footer?.portfolio_heading_ar || "أعمالنا") : (footer?.portfolio_heading_en || "Portfolio")}</h4>
          {portfolioLinks.map((l, i) => (
            <a key={i} href={l.url || '/#work'}>{isAr ? l.ar : l.en}</a>
          ))}
        </div>

        <div className={styles.col}>
          <h4>{isAr ? (footer?.contact_heading_ar || "تواصل") : (footer?.contact_heading_en || "Contact")}</h4>
          <a href="mailto:info@topright.bh">info@topright.bh</a>
          <a href="tel:+97336622100">(+973) 36622100</a>
          <a href={footer?.whatsapp_url || 'https://wa.me/97336622100'} target="_blank" rel="noopener">WhatsApp</a>
          <a href="/#about">{isAr ? "من نحن" : "About us"}</a>
        </div>
      </div>

      <div className={styles.bottom}>
        <span className={styles.copy}>{copyright}</span>
        <div className={styles.social}>
          <a href={footer?.linkedin_url || '#'} target={footer?.linkedin_url ? '_blank' : undefined} rel="noopener" className={styles.sb}>in</a>
          <a href={footer?.instagram_url || '#'} target={footer?.instagram_url ? '_blank' : undefined} rel="noopener" className={styles.sb}>ig</a>
          <a href={footer?.whatsapp_url || 'https://wa.me/97336622100'} target="_blank" rel="noopener" className={`${styles.sb} ${styles.wa}`}>wa</a>
        </div>
      </div>
    </footer>
  );
}
