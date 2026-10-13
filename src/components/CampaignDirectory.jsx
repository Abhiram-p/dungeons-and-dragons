import React, { useMemo, useState } from 'react'
import DemoNotice from './DemoNotice.jsx'

function SeatRequestForm({ campaign, onCancel, onSubmit }) {
  const [playerName, setPlayerName] = useState('')
  const [contact, setContact] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  function submit(event) {
    event.preventDefault()
    if (!playerName.trim()) {
      setError('Enter a name so the DM knows who is applying.')
      return
    }
    if (!message.trim()) {
      setError('Add a short note about the kind of character or game you have in mind.')
      return
    }
    onSubmit({ campaignId: campaign.id, campaignTitle: campaign.title, playerName: playerName.trim(), contact: contact.trim(), message: message.trim() })
  }

  return (
    <div className="paper-form-wrap">
      <div className="panel-kicker">PETITION TO JOIN</div>
      <h3>{campaign.title}</h3>
      <p className="muted-text">Public listings are reviewed by the DM before a seat is confirmed.</p>
      <form className="paper-form" onSubmit={submit}>
        <label>Player name<input value={playerName} onChange={(event) => setPlayerName(event.target.value)} maxLength={80} autoComplete="name" required placeholder="Name to use at the table" /></label>
        <label>Contact (optional)<input value={contact} onChange={(event) => setContact(event.target.value)} maxLength={120} placeholder="Discord handle or preferred contact" /></label>
        <label>Tell the DM a little about your interest<textarea value={message} onChange={(event) => setMessage(event.target.value)} maxLength={700} required rows={4} placeholder="Character idea, experience level, or what sounds fun about this campaign" /></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="form-actions"><button className="button-secondary" type="button" onClick={onCancel}>Cancel</button><button className="button-primary" type="submit">Send request <span aria-hidden="true">↗</span></button></div>
      </form>
      <p className="form-fine-print">Demo only: details remain in local browser storage and are not transmitted.</p>
    </div>
  )
}

export default function CampaignDirectory({ campaigns, applications, onSubmitApplication, onNavigate }) {
  const [selectedCampaignId, setSelectedCampaignId] = useState(null)
  const [filter, setFilter] = useState('all')
  const [submissionNotice, setSubmissionNotice] = useState('')
  const selectedCampaign = campaigns.find((campaign) => campaign.id === selectedCampaignId)
  const visibleCampaigns = useMemo(() => campaigns.filter((campaign) => campaign.visibility !== 'private').filter((campaign) => {
    if (filter === 'open') return campaign.status === 'open'
    if (filter === 'paused') return campaign.status === 'paused'
    return true
  }), [campaigns, filter])

  const acceptedCount = (campaignId) => applications.filter((application) => application.campaignId === campaignId && application.status === 'approved').length
  const pendingCount = (campaignId) => applications.filter((application) => application.campaignId === campaignId && application.status === 'pending').length

  function sendApplication(application) {
    onSubmitApplication(application)
    setSelectedCampaignId(null)
    setSubmissionNotice(`Your request for ${application.campaignTitle} was added to this browser's demo inbox. It has not been sent to the DM.`)
  }

  return (
    <main className="product-view campaign-view">
      <section className="product-hero">
        <div className="eyebrow">THE GUILD REGISTRY · PUBLIC CONTRACTS</div>
        <h1>Find your next <em>adventure.</em></h1>
        <p>Browse the campaigns currently listed in this realm. Send a seat request and the DM can review it before confirming your place.</p>
        <div className="product-hero-actions"><button className="button-primary" onClick={() => onNavigate('dashboard')}>Open DM console <span aria-hidden="true">↗</span></button><button className="button-secondary" onClick={() => onNavigate('realm')}>Return to the gate</button></div>
      </section>
      <DemoNotice />
      {submissionNotice && <div className="action-feedback" role="status"><span aria-hidden="true">✦</span><p>{submissionNotice}</p><button onClick={() => setSubmissionNotice('')} aria-label="Dismiss confirmation">✕</button></div>}
      <div className="directory-toolbar">
        <div><div className="panel-kicker">CAMPAIGN LEDGER</div><h2>Available stories <span className="count-chip">{visibleCampaigns.length}</span></h2></div>
        <div className="filter-tabs" aria-label="Filter campaigns">
          {[['all', 'All listings'], ['open', 'Open'], ['paused', 'Paused']].map(([value, label]) => <button key={value} className={filter === value ? 'filter-tab active' : 'filter-tab'} onClick={() => setFilter(value)} aria-pressed={filter === value}>{label}</button>)}
        </div>
      </div>
      {visibleCampaigns.length ? <div className="campaign-grid">
        {visibleCampaigns.map((campaign) => {
          const approved = acceptedCount(campaign.id)
          const pending = pendingCount(campaign.id)
          const remaining = Math.max(0, campaign.capacity - approved)
          const isOpen = campaign.status === 'open' && remaining > 0
          return <article className="campaign-card" key={campaign.id}>
            <div className="campaign-card-topline"><span className="campaign-seal" aria-hidden="true">{campaign.title.toLowerCase().includes('pokemon') ? '✧' : '⚔'}</span><span className={`status-pill ${campaign.status}`}>{campaign.status === 'open' ? 'Taking requests' : 'Paused'}</span></div>
            <div className="panel-kicker">{campaign.system}</div>
            <h3>{campaign.title}</h3>
            <p className="campaign-description">{campaign.description}</p>
            <div className="campaign-meta"><span><b>Levels</b>{campaign.levelRange || 'Not set'}</span><span><b>Format</b>{campaign.format || 'To be confirmed'}</span><span><b>Schedule</b>{campaign.schedule || 'To be confirmed'}</span></div>
            <div className="seat-meter"><div><span>Seats approved</span><b>{approved} / {campaign.capacity}</b></div><span className="seat-meter-track"><i style={{ width: `${campaign.capacity ? Math.min(100, approved / campaign.capacity * 100) : 0}%` }} /></span><small>{pending ? `${pending} request${pending === 1 ? '' : 's'} awaiting review` : isOpen ? `${remaining} seat${remaining === 1 ? '' : 's'} available in this demo` : 'No seats currently available'}</small></div>
            <div className="campaign-card-footer"><span className="approval-note">DM approval required</span><button className="button-primary" disabled={!isOpen} onClick={() => setSelectedCampaignId(campaign.id)}>{isOpen ? 'Request a seat' : 'Unavailable'} <span aria-hidden="true">↗</span></button></div>
          </article>
        })}
      </div> : <div className="empty-ledger"><span>✧</span><h3>No listings in this ledger</h3><p>Try another filter or add a campaign from the DM console.</p><button className="button-primary" onClick={() => onNavigate('dashboard')}>Manage campaigns</button></div>}
      <footer className="product-footer"><span>THE REALM AWAITS</span><span>A LIVING ARCHIVE OF ADVENTURE</span></footer>
      {selectedCampaign && <div className="modal-backdrop product-modal-backdrop" role="presentation" onClick={() => setSelectedCampaignId(null)}>
        <section className="notice-modal request-modal" role="dialog" aria-modal="true" aria-label={`Request a seat in ${selectedCampaign.title}`} onClick={(event) => event.stopPropagation()}>
          <button className="modal-close" onClick={() => setSelectedCampaignId(null)} aria-label="Close seat request">✕</button>
          <SeatRequestForm campaign={selectedCampaign} onCancel={() => setSelectedCampaignId(null)} onSubmit={sendApplication} />
        </section>
      </div>}
    </main>
  )
}
