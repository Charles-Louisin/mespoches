'use client'

import { useEffect, useState } from 'react'
import { HomeScreen } from './screens'

export default function Phone3D() {
  const [intro, setIntro] = useState(true)
  const [deg, setDeg] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIntro(false)
      return
    }
    const id = window.setTimeout(() => setIntro(false), 1450)
    return () => window.clearTimeout(id)
  }, [])

  const spin = (dir: 1 | -1) => {
    if (intro) return
    setDeg((d) => d + dir * 360)
  }

  return (
    <div className="phone-scene">
      <div
        className={`phone-3d ${intro ? 'is-intro' : ''}`}
        style={intro ? undefined : { transform: `rotateY(${deg}deg)` }}
      >
        <div className="phone-face phone-front">
          <div className="phone-island" />
          <div className="phone-screen">
            <HomeScreen />
          </div>
        </div>
        <div className="phone-face phone-back" aria-hidden>
          <div className="phone-camera">
            <span />
            <span />
            <i />
          </div>
          <AppleMark />
        </div>
        <div className="phone-side phone-side-l" />
        <div className="phone-side phone-side-r" />
      </div>
      <button type="button" className="phone-hit phone-hit-l" aria-label="Tourner vers la gauche" onClick={() => spin(-1)} />
      <button type="button" className="phone-hit phone-hit-r" aria-label="Tourner vers la droite" onClick={() => spin(1)} />
    </div>
  )
}

function AppleMark() {
  return (
    <svg className="phone-apple" viewBox="0 0 24 24" width="42" height="42" aria-hidden>
      <path
        fill="rgba(220,220,225,0.88)"
        d="M16.7 12.4c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.2-2.8.9-3.5.9s-1.8-1-3-1c-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.3 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7 2-.1 2.9-2.3c1-.1 2-1.2 2.5-2.3-6.6-2.5-5.5-9.3-3.8-10.9zM14.8 5.7c.6-.8 1.1-1.9.9-3-1 .1-2.1.7-2.7 1.5-.6.7-1.1 1.8-.9 2.9 1.1.1 2.1-.6 2.7-1.4z"
      />
    </svg>
  )
}
