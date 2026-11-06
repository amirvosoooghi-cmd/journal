
'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Activity, BarChart3, CalendarDays, ChevronDown, ChevronRight,
  Filter, Plus, Search, SlidersHorizontal, Target, Trash2, X
} from 'lucide-react';

type Trade = {
  id: number;
  tradeDate: string;
  tag: string | null;
  symbol: string;
  session: string | null;
  move: string | null;
  position: string;
  entry: string | null;
  riskPct: string | null;
  pnl: string | null;
  rr: string | null;
  mfe: string | null;
  rangeTime: string | null;
  breakoutType: string | null;
  rangeQuality: string | null;
  touches: number | null;
  emotions: string[] | null;
  notes: string | null;
};

const emotions = [
  '😰 Stress',
  '🏃 FOMO',
  '💪 Confidence',
  '🎯 Plan Discipline',
  '🛑 Stop-Loss Fear',
  '😊 Happiness',
  '🌤️ Hope',
  '😤 Frustration',
  '😞 Disappointment',
  '⏳ Impatience',
  '🧘 Calm',
  '⚡ Overconfidence'
];

const blank = {
  tradeDate: new Date().toISOString().slice(0, 16),
  tag: '',
  symbol: '',
  session: 'NEW YORK',
  move: '',
  position: 'LONG',
  entry: 'STOP B/S',
  riskPct: '0.25',
  pnl: '',
  rr: '',
  mfe: '',
  rangeTime: '',
  breakoutType: '',
  rangeQuality: '',
  touches: '',
  emotions: [] as string[],
  notes: ''
};

function coinLogoCandidates(symbol: string) {
  const s = symbol.trim().toLowerCase();

  return [
    `https://assets.coincap.io/assets/icons/${s}@2x.png`,
    `https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/${s}.png`
  ];
}

function classKey(value: string | null | undefined) {
  return (value || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function n(v: string | number | null | undefined) {
  return Number(v || 0);
}

function money(v: number) {
  return `${v < 0 ? '−' : '+'}$${Math.abs(v).toFixed(2)}`;
}

function pct(w: number, l: number) {
  return w + l ? `${(w / (w + l) * 100).toFixed(1)}%` : '—';
}

function getTradeDate(value: string) {
  return new Date(value);
}

export default function JournalApp() {
  const [rows, setRows] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all');
  const [pnlPeriod, setPnlPeriod] = useState('all');
  const [rPeriod, setRPeriod] = useState('all');
  const [query, setQuery] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [detail, setDetail] = useState<Trade | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);

    try {
      const r = await fetch('/api/trades');

      if (!r.ok) {
        throw new Error('Could not load trades.');
      }

      const data = await r.json();
      setRows(Array.isArray(data) ? data : []);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load trades.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const twoMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const sortedRows = useMemo(
    () => [...rows].sort(
      (a, b) => getTradeDate(b.tradeDate).getTime() -
        getTradeDate(a.tradeDate).getTime()
    ),
    [rows]
  );

  const recent20 = sortedRows.slice(0, 20);

  const monthRows = sortedRows.filter(
    t => getTradeDate(t.tradeDate) >= monthStart
  );

  const twoRows = sortedRows.filter(
    t => getTradeDate(t.tradeDate) >= twoMonthStart
  );

  function metrics(list: Trade[]) {
    const wins = list.filter(t => n(t.rr) > 0).length;
    const losses = list.filter(t => n(t.rr) < 0).length;

    return {
      win: pct(wins, losses),
      pnl: list.reduce((s, t) => s + n(t.pnl), 0),
      rr: list.reduce((s, t) => s + n(t.rr), 0),
      count: list.length
    };
  }

  const winRows = period === 'month'
    ? monthRows
    : period === 'recent'
      ? recent20
      : sortedRows;

  const pnlRows = pnlPeriod === 'month'
    ? monthRows
    : pnlPeriod === 'two'
      ? twoRows
      : sortedRows;

  const rRows = rPeriod === 'month'
    ? monthRows
    : rPeriod === 'two'
      ? twoRows
      : sortedRows;

  const wm = metrics(winRows);
  const pm = metrics(pnlRows);
  const rm = metrics(rRows);

  const filtered = useMemo(
    () => sortedRows.filter(t =>
      [
        t.symbol,
        t.tag || '',
        t.session || '',
        t.breakoutType || '',
        t.rangeQuality || ''
      ]
        .join(' ')
        .toLowerCase()
        .includes(query.toLowerCase())
    ),
    [sortedRows, query]
  );

  async function addTrade(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const url = editingId
        ? `/api/trades/${editingId}`
        : '/api/trades';

      const r = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...form,
          tradeDate: new Date(form.tradeDate).toISOString(),
          touches: form.touches === '' ? null : Number(form.touches),
          emotions: form.emotions
        })
      });

      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        throw new Error(d.error || 'Unable to save trade.');
      }

      setShowAdd(false);
      setEditingId(null);
      setForm(blank);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to save trade.');
    } finally {
      setSaving(false);
    }
  }

  function editTrade(t: Trade) {
    const d = new Date(t.tradeDate);
    const pad = (v: number) => String(v).padStart(2, '0');

    const dateValue =
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
      `T${pad(d.getHours())}:${pad(d.getMinutes())}`;

    setForm({
      tradeDate: dateValue,
      tag: t.tag || '',
      symbol: t.symbol,
      session: t.session || 'NEW YORK',
      move: t.move || '',
      position: t.position,
      entry: t.entry || 'STOP B/S',
      riskPct: t.riskPct || '0.25',
      pnl: t.pnl || '',
      rr: t.rr || '',
      mfe: t.mfe || '',
      rangeTime: t.rangeTime || '',
      breakoutType: t.breakoutType || '',
      rangeQuality: t.rangeQuality || '',
      touches: t.touches == null ? '' : String(t.touches),
      emotions: t.emotions || [],
      notes: t.notes || ''
    });

    setEditingId(t.id);
    setDetail(null);
    setShowAdd(true);
  }

  async function removeTrade(t: Trade) {
    if (!confirm(`Delete ${t.symbol} trade? This cannot be undone.`)) return;

    try {
      const r = await fetch(`/api/trades/${t.id}`, {
        method: 'DELETE'
      });

      if (!r.ok) throw new Error('Unable to delete trade.');

      setDetail(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to delete trade.');
    }
  }

  function field(key: keyof typeof blank, value: string) {
    setForm(f => ({ ...f, [key]: value }));
  }

  function openNewTrade() {
    setEditingId(null);
    setForm(blank);
    setError('');
    setShowAdd(true);
  }

  const monthly = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);

    const list = sortedRows.filter(t => {
      const x = getTradeDate(t.tradeDate);
      return x.getFullYear() === d.getFullYear() &&
        x.getMonth() === d.getMonth();
    });

    return {
      label: d.toLocaleDateString('en-US', {
        month: 'short',
        year: '2-digit'
      }),
      ...metrics(list)
    };
  });

  return (
    <main className="app-shell">
      <section className="main-area">
        <header className="topbar">
          <div>
            <div className="breadcrumb">
              WORKSPACE <span>/</span> JOURNAL
            </div>
            <div className="top-title">Trading journal</div>
          </div>

          <div className="top-actions">
            <span className="live-status">
              <i /> DATABASE CONNECTED
            </span>

            <button className="primary-btn" onClick={openNewTrade}>
              <Plus size={16} /> Add trade
            </button>
          </div>
        </header>

        <div className="content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">YOUR PERFORMANCE, IN FOCUS</div>
              <h1>Overview<span>.</span></h1>
              <p>Track the process. Understand the numbers. Refine your edge.</p>
            </div>

            <div className="date-chip">
              <CalendarDays size={15} />
              {now.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric'
              })}
            </div>
          </div>

          <div className="stats-grid">
            <article className="stat-card">
              <div className="stat-top">
                <span>WIN RATE</span>
                <Target size={16} />
              </div>

              <div className="stat-value">{wm.win}</div>

              <div className="stat-bottom">
                <span>
                  {winRows.length} trades · {' '}
                  {winRows.filter(t => n(t.rr) === 0).length} breakeven
                </span>

                <select
                  value={period}
                  onChange={e => setPeriod(e.target.value)}
                >
                  <option value="all">All time</option>
                  <option value="month">This month</option>
                  <option value="recent">Last 20 trades</option>
                </select>
              </div>
            </article>

            <article className="stat-card">
              <div className="stat-top">
                <span>NET P&amp;L</span>
                <BarChart3 size={16} />
              </div>

              <div className={`stat-value ${pm.pnl >= 0 ? 'positive' : 'negative'}`}>
                {money(pm.pnl)}
              </div>

              <div className="stat-bottom">
                <span>{pnlRows.length} trades included</span>

                <select
                  value={pnlPeriod}
                  onChange={e => setPnlPeriod(e.target.value)}
                >
                  <option value="all">All time</option>
                  <option value="month">This month</option>
                  <option value="two">Last 2 months</option>
                </select>
              </div>
            </article>

            <article className="stat-card">
              <div className="stat-top">
                <span>NET R</span>
                <Activity size={16} />
              </div>

              <div className={`stat-value ${rm.rr >= 0 ? 'positive' : 'negative'}`}>
                {rm.rr >= 0 ? '+' : ''}{rm.rr.toFixed(2)}R
              </div>

              <div className="stat-bottom">
                <span>Risk-adjusted return</span>

                <select
                  value={rPeriod}
                  onChange={e => setRPeriod(e.target.value)}
                >
                  <option value="all">All time</option>
                  <option value="month">This month</option>
                  <option value="two">Last 2 months</option>
                </select>
              </div>
            </article>
          </div>

          <div className="section-head">
            <div>
              <h2>Trade history</h2>
              <p>Your complete execution log</p>
            </div>

            <div className="table-actions">
              <div className="search-box">
                <Search size={15} />
                <input
                  placeholder="Search symbol, session…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />
              </div>

              <button className="icon-btn" title="Filters">
                <Filter size={16} />
              </button>

              <button className="icon-btn" title="Display settings">
                <SlidersHorizontal size={16} />
              </button>

              <button className="primary-btn small" onClick={openNewTrade}>
                <Plus size={15} /> New trade
              </button>
            </div>
          </div>

          {error && !showAdd && (
            <div className="form-error page-error">{error}</div>
          )}

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {[
                    'DATE', 'TAG', 'SYMBOL', 'SESSION', 'MOVE',
                    'POSITION', 'ENTRY', 'RISK %', 'P&L', 'R:R',
                    'MFE (R)', 'RANGE TIME', 'BREAKOUT',
                    'RANGE QUALITY', 'TOUCHES', 'EMOTIONS', 'NOTES'
                  ].map(x => <th key={x}>{x}</th>)}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={17} className="empty-state">
                      Loading your journal…
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={17} className="empty-state">
                      <div className="empty-icon">
                        <BarChart3 size={22} />
                      </div>

                      <b>{query ? 'No matching trades' : 'Your journal starts here'}</b>

                      <span>
                        {query
                          ? 'Try another search term.'
                          : 'Add your first trade to start building your performance history.'}
                      </span>

                      {!query && (
                        <button
                          className="primary-btn small"
                          onClick={openNewTrade}
                        >
                          <Plus size={15} /> Add your first trade
                        </button>
                      )}
                    </td>
                  </tr>
                ) : filtered.map(t => (
                  <tr
                    key={t.id}
                    onClick={() => setDetail(t)}
                    className="click-row"
                  >
                    <td className="date-cell">
                      {getTradeDate(t.tradeDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: '2-digit',
                        year: 'numeric'
                      })}
                    </td>

                    <td className="muted-cell">{t.tag || '—'}</td>

                    <td className="symbol-cell">
                      <span className="coin-symbol">
                        <img
                          src={coinLogoCandidates(t.symbol)[0]}
                          alt=""
                          loading="lazy"
                          onError={e => {
                            const img = e.currentTarget;
                            const urls = coinLogoCandidates(t.symbol);
                            const next = Number(
                              img.dataset.fallbackIndex || '0'
                            ) + 1;

                            if (next < urls.length) {
                              img.dataset.fallbackIndex = String(next);
                              img.src = urls[next];
                            } else {
                              img.style.display = 'none';
                            }
                          }}
                        />
                        <span>{t.symbol}</span>
                      </span>
                    </td>

                    <td>
                      <span className={`session-pill ${classKey(t.session)}`}>
                        {t.session || '—'}
                      </span>
                    </td>

                    <td>{t.move || '—'}</td>

                    <td>
                      <span className={`position-pill ${classKey(t.position)}`}>
                        {t.position}
                      </span>
                    </td>

                    <td>{t.entry || '—'}</td>
                    <td>{t.riskPct == null ? '—' : `${t.riskPct}%`}</td>

                    <td className={n(t.pnl) >= 0 ? 'positive' : 'negative'}>
                      {t.pnl == null ? '—' : money(n(t.pnl))}
                    </td>

                    <td className={n(t.rr) >= 0 ? 'positive' : 'negative'}>
                      {t.rr == null
                        ? '—'
                        : `${n(t.rr) > 0 ? '+' : ''}${n(t.rr).toFixed(2)}R`}
                    </td>

                    <td>{t.mfe ?? '—'}</td>
                    <td>{t.rangeTime || '—'}</td>

                    <td>
                      <span className={`type-pill ${classKey(t.breakoutType)}`}>
                        {t.breakoutType || '—'}
                      </span>
                    </td>

                    <td>
                      <span className={`quality-pill ${classKey(t.rangeQuality)}`}>
                        {t.rangeQuality || '—'}
                      </span>
                    </td>

                    <td>{t.touches ?? '—'}</td>

                    <td>
                      {t.emotions?.length
                        ? t.emotions.map(e => e.split(' ')[0]).join(' ')
                        : '—'}
                    </td>

                    <td className="notes-cell">
                      {t.notes ? 'View note' : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            <span>
              Showing <b>{filtered.length}</b> of <b>{rows.length}</b> trades
            </span>

            <span>
              Click any trade to view details
              <ChevronRight size={13} />
            </span>
          </div>

          <section className="monthly-section">
            <div className="section-head">
              <div>
                <h2>Monthly reports</h2>
                <p>A rolling view of your consistency</p>
              </div>

              <button className="text-btn">
                Last 6 months <ChevronDown size={14} />
              </button>
            </div>

            <div className="monthly-grid">
              {monthly.map(m => (
                <article className="month-card" key={m.label}>
                  <div className="month-title">{m.label}</div>
                  <div className="month-win">{m.win}</div>
                  <div className="month-label">WIN RATE</div>

                  <div className="month-divider" />

                  <div className="month-meta">
                    <span>Net P&amp;L</span>
                    <b className={m.pnl >= 0 ? 'positive' : 'negative'}>
                      {money(m.pnl)}
                    </b>
                  </div>

                  <div className="month-meta">
                    <span>Net R</span>
                    <b className={m.rr >= 0 ? 'positive' : 'negative'}>
                      {m.rr >= 0 ? '+' : ''}{m.rr.toFixed(2)}R
                    </b>
                  </div>

                  <div className="month-meta">
                    <span>Trades</span>
                    <b>{m.count}</b>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <footer className="app-footer">
            I-JOURNAL
            <span>BUILT FOR PROCESS. DESIGNED FOR PERFORMANCE.</span>
            <span>v1.0.0</span>
          </footer>
        </div>
      </section>

      {showAdd && (
        <div
          className="overlay"
          onMouseDown={e => {
            if (e.target === e.currentTarget) setShowAdd(false);
          }}
        >
          <form className="modal wide-modal" onSubmit={addTrade}>
            <div className="modal-head">
              <div>
                <div className="eyebrow">TRADE MANAGEMENT</div>
                <h2>{editingId ? 'Edit trade' : 'New trade'}</h2>
                <p>Capture the setup, execution and mindset.</p>
              </div>

              <button
                type="button"
                className="icon-btn"
                onClick={() => setShowAdd(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="form-grid">
              <label>Date &amp; time
                <input
                  type="datetime-local"
                  value={form.tradeDate}
                  onChange={e => field('tradeDate', e.target.value)}
                  required
                />
              </label>

              <label>Symbol
                <input
                  placeholder="BTC"
                  value={form.symbol}
                  onChange={e => field('symbol', e.target.value.toUpperCase())}
                  required
                />
              </label>

              <label>Trade ID / Tag
                <input
                  placeholder="e.g. #043"
                  value={form.tag}
                  onChange={e => field('tag', e.target.value)}
                />
              </label>

              <label>Session
                <select
                  value={form.session}
                  onChange={e => field('session', e.target.value)}
                >
                  <option>NEW YORK</option>
                  <option>LONDON</option>
                  <option>SHANGHAI</option>
                  <option>OTHER</option>
                </select>
              </label>

              <label>Move
                <input
                  value={form.move}
                  onChange={e => field('move', e.target.value)}
                />
              </label>

              <label>Position
                <select
                  value={form.position}
                  onChange={e => field('position', e.target.value)}
                >
                  <option>LONG</option>
                  <option>SHORT</option>
                </select>
              </label>

              <label>Entry type
                <select
                  value={form.entry}
                  onChange={e => field('entry', e.target.value)}
                >
                  <option>STOP B/S</option>
                  <option>LIMIT</option>
                  <option>MARKET</option>
                  <option>CC</option>
                  <option>OTHER</option>
                </select>
              </label>

              <label>Risk %
                <input
                  type="number"
                  step="0.01"
                  value={form.riskPct}
                  onChange={e => field('riskPct', e.target.value)}
                />
              </label>

              <label>P&amp;L ($)
                <input
                  type="number"
                  step="0.01"
                  value={form.pnl}
                  onChange={e => field('pnl', e.target.value)}
                />
              </label>

              <label>R:R
                <input
                  type="number"
                  step="0.01"
                  value={form.rr}
                  onChange={e => field('rr', e.target.value)}
                />
              </label>

              <label>MFE (R)
                <input
                  type="number"
                  step="0.01"
                  value={form.mfe}
                  onChange={e => field('mfe', e.target.value)}
                />
              </label>

              <label>Range time
                <input
                  value={form.rangeTime}
                  onChange={e => field('rangeTime', e.target.value)}
                />
              </label>

              <label>Breakout type
                <select
                  value={form.breakoutType}
                  onChange={e => field('breakoutType', e.target.value)}
                >
                  <option value="">Select type</option>
                  {['SHARP', 'NOISE', 'FAKE', 'EXPANSION'].map(x =>
                    <option key={x}>{x}</option>
                  )}
                </select>
              </label>

              <label>Range quality
                <select
                  value={form.rangeQuality}
                  onChange={e => field('rangeQuality', e.target.value)}
                >
                  <option value="">Select quality</option>
                  {[
                    'GOOD',
                    'AVERAGE',
                    'INVALID',
                    'CLEAN & STRONG',
                    'MESSY'
                  ].map(x => <option key={x}>{x}</option>)}
                </select>
              </label>

              <label>Touches
                <input
                  type="number"
                  min="0"
                  value={form.touches}
                  onChange={e => field('touches', e.target.value)}
                />
              </label>
            </div>

            <div className="emotion-block">
              <div className="field-title">
                PRE-TRADE EMOTIONS
                <span>SELECT ALL THAT APPLY</span>
              </div>

              <div className="emotion-list">
                {emotions.map(x => (
                  <button
                    type="button"
                    key={x}
                    className={`emotion-chip ${
                      form.emotions.includes(x) ? 'selected' : ''
                    }`}
                    onClick={() => setForm(f => ({
                      ...f,
                      emotions: f.emotions.includes(x)
                        ? f.emotions.filter(v => v !== x)
                        : [...f.emotions, x]
                    }))}
                  >
                    {form.emotions.includes(x) ? '✓ ' : ''}{x}
                  </button>
                ))}
              </div>
            </div>

            <label className="notes-label">
              Trade notes
              <textarea
                rows={4}
                placeholder="What did you see? How did you execute? What would you improve?"
                value={form.notes}
                onChange={e => field('notes', e.target.value)}
              />
            </label>

            {error && <p className="form-error">{error}</p>}

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setShowAdd(false)}
              >
                Cancel
              </button>

              <button className="primary-btn" disabled={saving}>
                {saving
                  ? 'Saving…'
                  : <><Plus size={15} /> {editingId ? 'Save changes' : 'Save trade'}</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {detail && (
        <div
          className="overlay"
          onMouseDown={e => {
            if (e.target === e.currentTarget) setDetail(null);
          }}
        >
          <div className="modal detail-modal">
            <div className="modal-head">
              <div>
                <div className="eyebrow">
                  TRADE #{detail.tag || detail.id}
                </div>

                <h2>
                  {detail.symbol}
                  <span className="detail-position">
                    {detail.position}
                  </span>
                </h2>

                <p>
                  {getTradeDate(detail.tradeDate).toLocaleString('en-US', {
                    dateStyle: 'full',
                    timeStyle: 'short'
                  })}
                </p>
              </div>

              <button
                className="icon-btn"
                onClick={() => setDetail(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="detail-stats">
              <div>
                <span>P&amp;L</span>
                <b className={n(detail.pnl) >= 0 ? 'positive' : 'negative'}>
                  {detail.pnl == null ? '—' : money(n(detail.pnl))}
                </b>
              </div>

              <div>
                <span>R MULTIPLE</span>
                <b>
                  {detail.rr == null ? '—' : `${n(detail.rr).toFixed(2)}R`}
                </b>
              </div>

              <div>
                <span>MFE</span>
                <b>{detail.mfe ?? '—'}{detail.mfe ? 'R' : ''}</b>
              </div>
            </div>

            <div className="detail-grid">
              {[
                ['Session', detail.session],
                ['Entry', detail.entry],
                ['Risk', detail.riskPct ? `${detail.riskPct}%` : null],
                ['Move', detail.move],
                ['Range time', detail.rangeTime],
                ['Touches', detail.touches],
                ['Breakout', detail.breakoutType],
                ['Range quality', detail.rangeQuality]
              ].map(([k, v]) => (
                <div key={String(k)}>
                  <span>{k}</span>
                  <b>{v ?? '—'}</b>
                </div>
              ))}
            </div>

            <div className="detail-section">
              <div className="field-title">PRE-TRADE EMOTIONS</div>

              <div className="emotion-list">
                {detail.emotions?.length
                  ? detail.emotions.map(e => (
                    <span className="emotion-chip selected" key={e}>
                      {e}
                    </span>
                  ))
                  : <span className="muted-cell">No emotions recorded.</span>}
              </div>
            </div>

            <div className="detail-section">
              <div className="field-title">TRADE NOTES</div>
              <p className="note-content">
                {detail.notes || 'No notes added for this trade.'}
              </p>
            </div>

            <div className="modal-actions spread">
              <button
                className="primary-btn"
                onClick={() => editTrade(detail)}
              >
                Edit trade
              </button>

              <button
                className="danger-btn"
                onClick={() => removeTrade(detail)}
              >
                <Trash2 size={15} /> Delete trade
              </button>

              <button
                className="secondary-btn"
                onClick={() => setDetail(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
