import { useLang } from "../../LangContext";
import styles from "./Navbar.module.css";

const links = [
  { to: "/#work", en: "Work", ar: "أعمالنا" },
  { to: "/#services", en: "Services", ar: "خدماتنا" },
  { to: "/#about", en: "About", ar: "من نحن" },
  { to: "/#coaching", en: "Coaching", ar: "التدريب" },
  { to: "/#contact", en: "Contact", ar: "تواصل" },
  { to: "/#events", en: "Events & CSR", ar: "الفعاليات والمسؤولية" },
];

export default function Navbar() {
  const { lang, toggleLang } = useLang();

  const t = (key) => (lang === "ar" ? key.ar : key.en);

  return (
    <nav className={styles.nav}>
      <a href="/" className={styles.logo}>
        <img src="/logo.png" alt="Top Right" className={styles.logoImg} />
      </a>

      <div className={styles.links}>
        {links.map((l) => (
          <a key={l.to} href={l.to} className={styles.link}>
            {t(l)}
          </a>
        ))}
      </div>

      <div className={styles.right}>
        <button className={styles.langBtn} onClick={toggleLang}>
          {lang === "en" ? "AR" : "EN"}
        </button>
      </div>
    </nav>
  );
}
