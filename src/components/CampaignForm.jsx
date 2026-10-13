import React, { useEffect, useState } from 'react'

const blankCampaign = { title: '', system: 'D&D 5e · 2024 rules', levelRange: 'Level 1+', format: 'Online tabletop', schedule: '', capacity: 5, status: 'open', description: '', visibility: 'public' }

export default function CampaignForm({ campaign, onSave, onCancel }) {
  const [form, setForm] = useState(campaign ? { ...campaign } : { ...blankCampaign })
  const [error, setError] = useState('')

  useEffect(() => setForm(campaign ? { ...campaign } : { ...blankCampaign }), [campaign])

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function submit(event) {
    event.preventDefault()
    if (!form.title.trim() || !form.description.trim()) {
      setError('A title and short description are required.')
      return
    }
    onSave({ ...form, title: form.title.trim(), description: form.description.trim(), capacity: Math.max(1, Math.min(30, Number(form.capacity) || 1)), schedule: form.schedule.trim() || 'Schedule to be confirmed' })
  }

  return (
    <form className="campaign-editor paper-form" onSubmit={submit}>
      <div className="editor-heading"><div><div className="panel-kicker">{campaign ? 'REVISE CONTRACT' : 'WRITE A NEW CONTRACT'}</div><h3>{campaign ? 'Edit campaign listing' : 'Create a campaign listing'}</h3></div><button className="icon-button" type="button" onClick={onCancel} aria-label="Close editor">✕</button></div>
      <label>Campaign title<input value={form.title} onChange={(event) => update('title', event.target.value)} required maxLength={100} placeholder="The name written on the notice" /></label>
      <div className="form-two-column"><label>System<input value={form.system} onChange={(event) => update('system', event.target.value)} required maxLength={80} /></label><label>Levels<input value={form.levelRange} onChange={(event) => update('levelRange', event.target.value)} maxLength={50} placeholder="Level 1–4" /></label></div>
      <div className="form-two-column"><label>Format<input value={form.format} onChange={(event) => update('format', event.target.value)} maxLength={80} placeholder="Online tabletop" /></label><label>Seat limit<input type="number" min="1" max="30" value={form.capacity} onChange={(event) => update('capacity', event.target.value)} required /></label></div>
      <label>Schedule<input value={form.schedule} onChange={(event) => update('schedule', event.target.value)} maxLength={160} placeholder="e.g. Sundays, 4 PM IST" /></label>
      <label>Description<textarea value={form.description} onChange={(event) => update('description', event.target.value)} rows={4} maxLength={1000} required placeholder="Set the scene. What kind of adventure will players find?" /></label>
      <div className="form-two-column"><label>Listing status<select value={form.status} onChange={(event) => update('status', event.target.value)}><option value="open">Open for requests</option><option value="paused">Paused / hidden from requests</option></select></label><label>Visibility<select value={form.visibility} onChange={(event) => update('visibility', event.target.value)}><option value="public">Public listing</option><option value="private">Private / invite later</option></select></label></div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="form-actions"><button className="button-secondary" type="button" onClick={onCancel}>Cancel</button><button className="button-primary" type="submit">{campaign ? 'Save changes' : 'Create listing'} <span aria-hidden="true">↗</span></button></div>
      <p className="form-fine-print">Saved only to this browser in prototype mode.</p>
    </form>
  )
}
