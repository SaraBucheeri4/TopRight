import styles from './Marquee.module.css'

const items = [
  'Publication Design', "Children's Books", 'HSE Publications',
  'Annual Reports', 'Animation', 'Bilingual AR+EN',
  'Coaching & Workshops', 'Corporate Newsletters',
]

export default function Marquee() {
  const doubled = [...items, ...items]
  return (
    <div className={styles.marquee}>
      <div className={styles.track}>
        {doubled.map((item, i) => (
          <span key={i} className={styles.item}>
            {item}
            <span className={styles.dot} />
          </span>
        ))}
      </div>
    </div>
  )
}
