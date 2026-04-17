import { useState, useEffect } from "react";
import styles from "./Services.module.css";
import { useLang } from "../../LangContext";
import { fetchPublishedServices } from "../../services/servicesService";


export default function Services() {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const [services, setServices] = useState([]);

  useEffect(() => { fetchPublishedServices().then(setServices) }, []);

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
        {services.map((s, i) => {
          const color = s.card_color || "#E7432B";
          const num = String(i + 1).padStart(2, "0");
          return (
            <div key={s.id} className={styles.card} style={{ "--accent": color }}>
              <div className={styles.cardTop}>
                <span className={styles.n}>{num}</span>
                <span className={styles.tag} style={{ borderColor: color, color }}>
                  {s.tag_label}
                </span>
              </div>
              <h3 className={styles.title}>{isAr ? s.title_ar : s.title_en}</h3>
              <p className={styles.desc}>{isAr ? s.description_ar : s.description_en}</p>
              <a href="/contact" className={styles.cta} style={{ color, borderColor: color }}>
                {isAr ? "ابدأ مشروعك ←" : "Start a project →"}
              </a>
            </div>
          );
        })}
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
