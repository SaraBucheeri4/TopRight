import { useLang } from "../../LangContext";
import styles from "./Footer.module.css";

export default function Footer() {
  const { lang } = useLang();
  const isAr = lang === "ar";

  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>
        <div className={styles.brand}>
          <img src="/logo.png" alt="Top Right" className={styles.logo} />
          <p className={styles.tagline}>
            {isAr ? "خدمات التصميم والدعم · البحرين · CR: 46817-1" : "Design & Support Services · Bahrain · CR: 46817-1"}
          </p>
          <p className={styles.desc}>
            {isAr ? "استوديو إبداعي بحريني متخصص في الرسم التوضيحي ثنائي اللغة وتصميم المطبوعات وتطوير الهوية، يخدم مؤسسات منطقة الخليج منذ عام ٢٠٠١." : "A Bahraini creative studio specialising in bilingual illustration, publication design and brand development. Partnering organisations across the GCC since 2001."}
          </p>
        </div>

        <div className={styles.col}>
          <h4>{isAr ? "الخدمات" : "Services"}</h4>
          <a href="/#services">{isAr ? "تصميم المطبوعات" : "Publication Design"}</a>
          <a href="/#services">{isAr ? "الرسم التوضيحي" : "Illustration & Art"}</a>
          <a href="/#services">{isAr ? "الرسوم المتحركة" : "Animation"}</a>
          <a href="/#services">{isAr ? "الكتب المؤسسية" : "Corporate Books"}</a>
          <a href="/#services">{isAr ? "المنشورات الرقمية" : "Digital Publications"}</a>
          <a href="/#coaching">{isAr ? "التدريب" : "Coaching"}</a>
        </div>

        <div className={styles.col}>
          <h4>{isAr ? "أعمالنا" : "Portfolio"}</h4>
          <a href="/#work">{isAr ? "كتب الأطفال" : "Children's Books"}</a>
          <a href="/#work">{isAr ? "مطبوعات السلامة المهنية" : "HSE Publications"}</a>
          <a href="/#work">{isAr ? "مؤسسي" : "Corporate"}</a>
          <a href="/#work">{isAr ? "الرسم التوضيحي" : "Illustration"}</a>
          <a href="/#work">{isAr ? "الرسوم المتحركة" : "Animation"}</a>
        </div>

        <div className={styles.col}>
          <h4>{isAr ? "تواصل" : "Contact"}</h4>
          <a href="mailto:info@topright.bh">info@topright.bh</a>
          <a href="tel:+97336622100">(+973) 36622100</a>
          <a href="https://wa.me/97336622100" target="_blank" rel="noopener">WhatsApp</a>
          <a href="/#about">{isAr ? "من نحن" : "About us"}</a>
        </div>
      </div>

      <div className={styles.bottom}>
        <span className={styles.copy}>
          {isAr ? "© ٢٠٢٥ توب رايت لخدمات التصميم والدعم · البحرين · CR: 46817-1" : "© 2025 TopRight Design & Support Services · Bahrain · CR: 46817-1"}
        </span>
        <div className={styles.social}>
          <a href="#" className={styles.sb}>in</a>
          <a href="#" className={styles.sb}>ig</a>
          <a href="https://wa.me/97336622100" target="_blank" rel="noopener" className={`${styles.sb} ${styles.wa}`}>wa</a>
        </div>
      </div>
    </footer>
  );
}
