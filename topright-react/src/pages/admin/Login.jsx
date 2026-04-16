import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import styles from './Login.module.css'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (authError) {
      setError(authError.message)
    } else {
      navigate('/admin')
    } 
  }
 
  return (
    <>
      <div className={styles.tbar} />
      <div className={styles.pageWrap}>

        {/* LEFT: Brand */}
        <div className={styles.brandPanel}>
          <div className={styles.brandLogo}>
            <img src="/logo.png" alt="Top Right" />
          </div>

          <div className={styles.brandCenter}>
            <span className={styles.brandEyebrow}>Admin Access</span>
            <h1 className={styles.brandH}>
              Content<br /><span>Control</span><br />Panel
            </h1>
            <p className={styles.brandSub}>
              Restricted area for TopRight administrators. Manage website content,
              portfolio items, services, testimonials, and more from a single dashboard.
            </p>
          </div>

          <div className={styles.brandBottom}>
            <div className={styles.notice}>
              <div className={styles.noticeIcon}>!</div>
              <div>
                <strong>Restricted Access</strong>
                <p>This portal is for authorised TopRight staff only. Unauthorised access attempts are logged and reported.</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Login Form */}
        <div className={styles.loginPanel}>
          <div className={styles.loginBox}>

            <div className={styles.loginTag}>Admin Portal</div>

            <h2 className={styles.loginTtl}>Sign In</h2>
            <p className={styles.loginSub}>Enter your admin credentials to access the content management panel.</p>

            {error && (
              <div className={styles.errorMsg}>
                <span>⚠ {error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className={styles.fg}>
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@topright.bh"
                  required
                  autoComplete="email"
                />
              </div>

              <div className={styles.fg}>
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>

              <div className={styles.fgRowCheck}>
                <label className={styles.remember}>
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={e => setRemember(e.target.checked)}
                  />
                  <span>Keep me signed in</span>
                </label>
              </div>

              <button type="submit" className={styles.btnLogin} disabled={loading}>
                {loading ? 'Signing in…' : 'Sign In →'}
              </button>
            </form>

            <div className={styles.loginDivider}><span>Secured</span></div>

            <div className={styles.securityNote}>
              <div className={styles.secDot} />
              <span>Sessions expire after 2 hours of inactivity for security.</span>
            </div>

          </div>

          <div className={styles.loginFooter}>
            <p>Top Right Design &amp; Support Services · Bahrain · CR: 46817-1</p>
          </div>
        </div>

      </div>
    </>
  )
}
