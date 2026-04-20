import { useState } from "react";
import { useLang } from "../../LangContext";
import styles from "./Navbar.module.css";

const links = [
  { to: "/#work", en: "Portfolio", ar: "أعمالنا" },
  { to: "/#services", en: "Services", ar: "خدماتنا" },
  { to: "/#about", en: "About", ar: "من نحن" },
  { to: "/#coaching", en: "Coaching", ar: "التدريب" },
  { to: "/#contact", en: "Contact", ar: "تواصل" },
  { to: "/#events", en: "Events & CSR", ar: "الفعاليات والمسؤولية" },
];

export default function Navbar() {
  const { lang, toggleLang } = useLang();
  const [open, setOpen] = useState(false);

  const t = (key) => (lang === "ar" ? key.ar : key.en);

  return (
    <nav className={styles.nav}>
      <a href="/" className={styles.logo}>
        <img src="/logo.png" alt="Top Right" className={styles.logoImg} />
      </a>

      <div className={`${styles.links} ${open ? styles.linksOpen : ''}`}>
        {links.map((l) => (
          <a key={l.to} href={l.to} className={styles.link} onClick={() => setOpen(false)}>
            {t(l)}
          </a>
        ))}
        <button className={`${styles.langBtn} ${styles.langBtnMobile}`} onClick={() => { toggleLang(); setOpen(false); }}>
          {lang === "en" ? "AR" : "EN"}
        </button>
      </div>

      <div className={styles.right}>
        <button className={styles.langBtn} onClick={toggleLang}>
          {lang === "en" ? "AR" : "EN"}
        </button>
        <button className={styles.burger} onClick={() => setOpen(o => !o)} aria-label="Menu">
          <span /><span /><span />
        </button>
      </div>

      {open && <div className={styles.overlay} onClick={() => setOpen(false)} />}
    </nav>
  );
}
