import React from 'react'

export default function DemoNotice() {
  return (
    <aside className="demo-notice" role="note">
      <span className="demo-notice-sigil" aria-hidden="true">✦</span>
      <div>
        <strong>Prototype mode</strong>
        <p>This is sample data saved only in this browser. Requests and edits are not sent to the DM and will not sync across devices. Real accounts and secure cloud storage are a later milestone.</p>
      </div>
    </aside>
  )
}
