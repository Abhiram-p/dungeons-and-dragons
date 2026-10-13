import React, { useMemo, useState } from 'react'
import CampaignForm from './CampaignForm.jsx'
import DemoNotice from './DemoNotice.jsx'
import { createId } from '../data/demoData.js'

export default function DmDashboard({ campaigns, applications, onNavigate, onSaveCampaign, onDeleteCampaign, onUpdateApplication }) {
  const [editor, setEditor] = useState(null)
  const [tab, setTab] = useState('applications')
  const pending = useMemo(() => applications.filter((application) => application.status === 'pending'), [applications])
  const approved = useMemo(() => applications.filter((application) => application.status === 'approved'), [applications])

  function saveCampaign(campaign) {
    onSaveCampaign({ ...campaign, id: campaign.id || createId('campaign') })
    setEditor(null)
    setTab('campaigns')
  }

  function deleteCampaign(campaign) {
    const stillHasApplications = applications.some((application) => application.campaignId === campaign.id && application.status !== 'declined')
    const warning = stillHasApplications
      ? `Delete “${campaign.title}”? Its demo applications will also be removed from this browser.`
      : `Delete “${campaign.title}”?`
    if (window.confirm(warning)) onDeleteCampaign(campaign.id)
  }

  return (
    <main className="product-view dashboard-view">
      <section className="product-hero dashboard-hero">
        <div className="eyebrow">THE CHRONICLER'S STUDY · DM TOOLS</div>
        <h1>Keep the story <em>in motion.</em></h1>
        <p>Review requests, keep your campaign ledger current, and prepare the next chapter. This console is in local demo mode.</p>
        <div className="product-hero-actions"><button className="button-primary" onClick={() => { setEditor({ mode: 'create' }); setTab('campaigns') }}>Create campaign <span aria-hidden="true">＋</span></button><button className="button-secondary" onClick={() => onNavigate('campaigns')}>View public listings</button></div>
      </section>
      <DemoNotice />
      <div className="dashboard-stats">
        <article><span className="stat-icon">⚔</span><span className="stat-label">CAMPAIGN LISTINGS</span><strong>{campaigns.length}</strong><small>{campaigns.filter((campaign) => campaign.status === 'open').length} currently open</small></article>
        <article><span className="stat-icon">✉</span><span className="stat-label">REQUESTS TO REVIEW</span><strong>{pending.length}</strong><small>Waiting for your decision</small></article>
        <article><span className="stat-icon">✦</span><span className="stat-label">APPROVED PLAYERS</span><strong>{approved.length}</strong><small>From demo applications</small></article>
      </div>
      <div className="dashboard-workspace">
        <aside className="dashboard-sidebar"><div className="panel-kicker">YOUR DESK</div><button className={tab === 'applications' ? 'sidebar-tab active' : 'sidebar-tab'} onClick={() => { setTab('applications'); setEditor(null) }}><span>✉</span> Seat requests <b>{pending.length}</b></button><button className={tab === 'campaigns' ? 'sidebar-tab active' : 'sidebar-tab'} onClick={() => { setTab('campaigns'); setEditor(null) }}><span>⚔</span> Campaign ledger <b>{campaigns.length}</b></button><div className="sidebar-note">Later milestones will add session scheduling, world archives, handouts, and player accounts.</div></aside>
        <section className="dashboard-main">
          {editor ? <CampaignForm campaign={editor.mode === 'edit' ? editor.campaign : null} onCancel={() => setEditor(null)} onSave={saveCampaign} /> : tab === 'applications' ? <>
            <div className="section-heading"><div><div className="panel-kicker">THE INBOX</div><h2>Seat requests</h2><p>Approve the player to reserve a seat, or decline the application.</p></div><span className="count-chip">{pending.length} pending</span></div>
            {applications.length ? <div className="application-list">{applications.slice().sort((a, b) => b.createdAt - a.createdAt).map((application) => {
              const campaign = campaigns.find((item) => item.id === application.campaignId)
              return <article className="application-card" key={application.id}>
                <div className="application-top"><div className="application-avatar" aria-hidden="true">{application.playerName.slice(0, 1).toUpperCase()}</div><div className="application-person"><h3>{application.playerName}</h3><span>For <b>{application.campaignTitle}</b></span></div><span className={`status-pill ${application.status}`}>{application.status}</span></div>
                <p className="application-message">“{application.message}”</p>
                {application.contact && <p className="application-contact"><span>CONTACT</span> {application.contact}</p>}
                {application.status === 'pending' && <div className="application-actions"><button className="button-secondary danger-button" onClick={() => onUpdateApplication(application.id, 'declined')}>Decline</button><button className="button-primary" disabled={!campaign || applications.filter((item) => item.campaignId === application.campaignId && item.status === 'approved').length >= campaign.capacity} onClick={() => onUpdateApplication(application.id, 'approved')}>Approve & reserve seat <span aria-hidden="true">↗</span></button></div>}
                {application.status === 'approved' && <div className="application-outcome">Seat approved in this browser demo.</div>}
                {application.status === 'declined' && <div className="application-outcome declined-outcome">Application declined in this browser demo.</div>}
              </article>
            })}</div> : <div className="empty-ledger"><span>✉</span><h3>The inbox is quiet</h3><p>New seat requests from the public campaign directory will appear here.</p><button className="button-secondary" onClick={() => onNavigate('campaigns')}>Open campaign directory</button></div>}
          </> : <>
            <div className="section-heading"><div><div className="panel-kicker">THE CAMPAIGN LEDGER</div><h2>Your campaigns</h2><p>Keep public listings up to date before players apply.</p></div><button className="button-primary" onClick={() => setEditor({ mode: 'create' })}>New listing ＋</button></div>
            {campaigns.length ? <div className="managed-campaign-list">{campaigns.map((campaign) => {
              const approvedCount = applications.filter((application) => application.campaignId === campaign.id && application.status === 'approved').length
              const pendingCount = applications.filter((application) => application.campaignId === campaign.id && application.status === 'pending').length
              return <article className="managed-campaign" key={campaign.id}>
                <div className="managed-campaign-main"><span className="managed-seal" aria-hidden="true">{campaign.title.toLowerCase().includes('pokemon') ? '✧' : '⚔'}</span><div><span className="panel-kicker">{campaign.system}</span><h3>{campaign.title}</h3><p>{campaign.levelRange || 'Levels to be confirmed'} · {campaign.format || 'Format to be confirmed'} · {approvedCount}/{campaign.capacity} seats</p><div className="managed-meta"><span className={`status-pill ${campaign.status}`}>{campaign.status === 'open' ? 'Open for requests' : 'Paused'}</span><span>{pendingCount} pending</span><span>{campaign.visibility === 'public' ? 'Public' : 'Private'}</span></div></div></div>
                <div className="managed-campaign-actions"><button className="button-secondary" onClick={() => setEditor({ mode: 'edit', campaign })}>Edit</button><button className="button-secondary" onClick={() => onSaveCampaign({ ...campaign, status: campaign.status === 'open' ? 'paused' : 'open' })}>{campaign.status === 'open' ? 'Pause' : 'Reopen'}</button><button className="button-text danger-text" onClick={() => deleteCampaign(campaign)}>Delete</button></div>
              </article>
            })}</div> : <div className="empty-ledger"><span>⚔</span><h3>No campaigns yet</h3><p>Write your first notice and invite players to apply.</p><button className="button-primary" onClick={() => setEditor({ mode: 'create' })}>Create a campaign</button></div>}
          </>}
        </section>
      </div>
      <footer className="product-footer"><span>THE REALM AWAITS</span><span>THE CHRONICLER'S STUDY · LOCAL PROTOTYPE</span></footer>
    </main>
  )
}
