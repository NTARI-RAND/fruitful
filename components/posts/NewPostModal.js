'use client';
import { useState } from 'react';
import { Modal, ModalHeader } from '@/components/ui/Modal';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';
import { POST_TYPE_FORMS, buildPostBody } from '@/lib/postTypes';

function Field({ f, value, onChange }) {
  const label = (<label className="form-label">{f.label}{f.required ? ' *' : ''}</label>);
  if (f.kind === 'textarea') {
    return (
      <div className="form-group">{label}
        <textarea className="form-input min-h-[70px] resize-y" value={value || ''} placeholder={f.placeholder || ''} onChange={(e) => onChange(f.key, e.target.value)} />
      </div>
    );
  }
  if (f.kind === 'select') {
    return (
      <div className="form-group">{label}
        <select className="form-input" value={value || ''} onChange={(e) => onChange(f.key, e.target.value)}>
          <option value="">—</option>
          {f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>
    );
  }
  return (
    <div className="form-group">{label}
      <input
        type={f.kind === 'number' ? 'number' : f.kind === 'date' ? 'date' : 'text'}
        className="form-input" value={value || ''} placeholder={f.placeholder || ''}
        onChange={(e) => onChange(f.key, e.target.value)} />
    </div>
  );
}

export default function NewPostModal({ onClose, onCreated, initialType = null }) {
  const toast = useToast();
  const [type, setType] = useState(initialType);
  const [values, setValues] = useState({});
  const [media, setMedia] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setValues((s) => ({ ...s, [k]: v }));
  const API = process.env.NEXT_PUBLIC_API_URL || '';

  async function onFiles(e) {
    const files = Array.from(e.target.files || []).slice(0, 5);
    if (!files.length) return;
    setUploading(true);
    const urls = [];
    for (const file of files) {
      try {
        const fd = new FormData();
        fd.append('image', file);
        const headers = { Authorization: 'Bearer ' + getToken() };
        if (process.env.NEXT_PUBLIC_API_KEY) headers['X-API-Key'] = process.env.NEXT_PUBLIC_API_KEY;
        const res = await fetch(API + '/posts/upload-media', { method: 'POST', headers, body: fd });
        const data = await res.json();
        if (data.url) urls.push(data.url);
      } catch { /* skip failed file */ }
    }
    setMedia((m) => [...m, ...urls].slice(0, 5));
    setUploading(false);
  }

  async function submit() {
    const form = POST_TYPE_FORMS[type];
    const missing = form.fields.filter((f) => f.required && !values[f.key]);
    if (missing.length) return toast('Please fill in: ' + missing.map((f) => f.label).join(', '), 'error');
    setLoading(true);
    try {
      await api('/posts', 'POST', buildPostBody(type, values, media));
      toast('Post published!');
      onClose();
      onCreated?.();
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal onClose={onClose} maxWidth="560px">
      <ModalHeader title={type ? `New ${POST_TYPE_FORMS[type].label}` : 'What are you posting?'} onClose={onClose} />

      {!type ? (
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
          {Object.entries(POST_TYPE_FORMS).map(([k, cfg]) => (
            <button key={k} onClick={() => setType(k)}
              className="card-agro p-4 text-left hover:border-moss transition-colors cursor-pointer">
              <div className="text-2xl mb-1">{cfg.icon}</div>
              <div className="font-semibold text-soil">{cfg.label}</div>
              <div className="text-xs text-text3 mt-1">{cfg.blurb}</div>
            </button>
          ))}
        </div>
      ) : (
        <div>
          {POST_TYPE_FORMS[type].fields.map((f) => (
            <Field key={f.key} f={f} value={values[f.key]} onChange={set} />
          ))}

          <div className="form-group">
            <label className="form-label">Photos (up to 5)</label>
            <input type="file" accept="image/*" multiple onChange={onFiles} className="text-sm" />
            {uploading && <span className="text-xs text-text3 ml-2">Uploading…</span>}
            {media.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {media.map((u, i) => (
                  <img key={i} src={u} alt="" className="w-14 h-14 object-cover rounded-lg border border-[var(--border-c)]" />
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-4">
            <button className="btn btn-ghost" onClick={() => setType(null)}>← Back</button>
            <button className="btn btn-primary flex-1" onClick={submit} disabled={loading}>
              {loading ? 'Publishing…' : 'Publish'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
