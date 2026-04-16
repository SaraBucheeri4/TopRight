import { NavLink, useNavigate } from "react-router-dom";
import { useLang } from "../../LangContext";
import styles from "./Navbar.module.css";

const links = [
  { to: "/work", en: "Work", ar: "أعمالنا" },
  { to: "/services", en: "Services", ar: "خدماتنا" },
  { to: "/about", en: "About", ar: "من نحن" },
  { to: "/coaching", en: "Coaching", ar: "التدريب" },
  { to: "/contact", en: "Contact", ar: "تواصل" },
  {
    to: "/events",
    en: "Events & CSR",
    ar: "الفعاليات والمسؤولية",
    highlight: true,
  },
];

export default function Navbar() {
  const { lang, toggleLang } = useLang();
  const navigate = useNavigate();

  const t = (key) => (lang === "ar" ? key.ar : key.en);

  return (
    <nav className={styles.nav}>
      <NavLink to="/" className={styles.logo}>
        <img src="/logo.png" alt="Top Right" className={styles.logoImg} />
      </NavLink>

      <div className={styles.links}>
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              [
                styles.link,
                l.highlight ? styles.events : "",
                isActive ? styles.active : "",
              ].join(" ")
            }
          >
            {t(l)}
          </NavLink>
        ))}
      </div>

      <div className={styles.right}>
        <button className={styles.langBtn} onClick={toggleLang}>
          {lang === "en" ? "AR | EN" : "EN | عربي"}
        </button>
        <button
          className={styles.startBtn}
          onClick={() => navigate("/contact")}
        >
          {lang === "en" ? "Start a project" : "ابدأ مشروعك"}
        </button>
      </div>
    </nav>
  );
}
