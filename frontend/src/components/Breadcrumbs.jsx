import React from 'react'
import { useLocation, Link } from 'react-router-dom'

export default function Breadcrumbs() {
  const loc = useLocation()
  const parts = loc.pathname.split('/').filter(Boolean)
  return (
    <div className="breadcrumbs">
      <Link to="/">Home</Link>
      {parts.map((p, i) => (
        <span key={i}> &raquo; <Link to={'/' + parts.slice(0, i+1).join('/')}>{p}</Link></span>
      ))}
    </div>
  )
}
