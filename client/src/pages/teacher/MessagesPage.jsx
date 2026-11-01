import { useMemo, useState } from 'react';
import {
  Check,
  CheckCircle2,
  Clock,
  Eye,
  Mail,
  RotateCcw,
  Search,
  Trash2,
  User as UserIcon,
} from 'lucide-react';
import { api } from '../../api/client.js';
import { useFetch } from '../../hooks/useFetch.js';
import { useToast } from '../../context/ToastContext.jsx';
import Async from '../../components/Async.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Modal from '../../components/Modal.jsx';
import { fmtDateTime } from '../../utils/format.js';

export default function MessagesPage() {
  const toast = useToast();
  const state = useFetch(() => api.get('/contact/messages'), []);

  const [filter, setFilter] = useState('all'); // 'all' | 'new' | 'resolved'
  const [search, setSearch] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const messages = state.data || [];

  const counts = useMemo(() => {
    return {
      all: messages.length,
      new: messages.filter((m) => m.status === 'new').length,
      resolved: messages.filter((m) => m.status === 'resolved').length,
    };
  }, [messages]);

  const filteredMessages = useMemo(() => {
    return messages.filter((m) => {
      if (filter !== 'all' && m.status !== filter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q)
      );
    });
  }, [messages, filter, search]);

  async function toggleStatus(message, targetStatus) {
    setBusyId(message.id);
    try {
      await api.put(`/contact/messages/${message.id}/status`, {
        status: targetStatus,
      });
      toast.success(`Message marked as ${targetStatus}`);
      state.reload();
      if (selectedMessage?.id === message.id) {
        setSelectedMessage((prev) => (prev ? { ...prev, status: targetStatus } : null));
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(message) {
    if (!window.confirm(`Delete message from "${message.name}" (${message.subject})?`)) return;

    setBusyId(message.id);
    try {
      await api.del(`/contact/messages/${message.id}`);
      toast.success('Message deleted');
      if (selectedMessage?.id === message.id) {
        setSelectedMessage(null);
      }
      state.reload();
    } catch (err) {
      toast.error(err.message || 'Failed to delete message');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Messages"
        subtitle="View and respond to inquiries, feedback, and problem reports sent by students and visitors."
      />

      <div className="row-wrap spread" style={{ marginBottom: 20, gap: 14 }}>
        <div className="chips">
          <button
            type="button"
            className={`chip ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All messages ({counts.all})
          </button>
          <button
            type="button"
            className={`chip ${filter === 'new' ? 'active' : ''}`}
            onClick={() => setFilter('new')}
          >
            New ({counts.new})
          </button>
          <button
            type="button"
            className={`chip ${filter === 'resolved' ? 'active' : ''}`}
            onClick={() => setFilter('resolved')}
          >
            Resolved ({counts.resolved})
          </button>
        </div>

        <div className="search" style={{ width: 280 }}>
          <Search size={17} />
          <input
            className="input"
            placeholder="Search sender, subject, message…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search messages"
          />
        </div>
      </div>

      <Async state={state}>
        {() =>
          filteredMessages.length === 0 ? (
            <div className="card">
              <EmptyState
                icon={Mail}
                title={messages.length === 0 ? 'No messages yet' : 'No messages match your filters'}
                text={
                  messages.length === 0
                    ? 'When someone sends a message via Contact Us, it will appear here.'
                    : 'Try selecting a different filter or clearing your search.'
                }
              />
            </div>
          ) : (
            <div className="card table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: 110 }}>Status</th>
                    <th>Sender</th>
                    <th>Subject</th>
                    <th>Date</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMessages.map((m) => {
                    const isNew = m.status === 'new';
                    return (
                      <tr key={m.id} style={{ background: isNew ? 'var(--surface-2)' : undefined }}>
                        <td>
                          {isNew ? (
                            <span className="badge badge-warn" style={{ gap: 4 }}>
                              <Clock size={12} /> New
                            </span>
                          ) : (
                            <span className="badge badge-good" style={{ gap: 4 }}>
                              <CheckCircle2 size={12} /> Resolved
                            </span>
                          )}
                        </td>

                        <td>
                          <div style={{ fontWeight: 600 }}>{m.name}</div>
                          <div className="small muted row" style={{ gap: 6, marginTop: 2 }}>
                            <span>{m.email}</span>
                            {m.user && (
                              <span
                                className="badge badge-muted"
                                style={{ padding: '1px 6px', fontSize: '0.7rem' }}
                              >
                                {m.user.role}
                              </span>
                            )}
                          </div>
                        </td>

                        <td>
                          <strong>{m.subject}</strong>
                          <div
                            className="small muted"
                            style={{
                              maxWidth: 340,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              marginTop: 2,
                            }}
                          >
                            {m.message}
                          </div>
                        </td>

                        <td className="muted small" style={{ whiteSpace: 'nowrap' }}>
                          {fmtDateTime(m.createdAt || m.created_at)}
                        </td>

                        <td>
                          <div className="row" style={{ justifyContent: 'flex-end', gap: 6 }}>
                            <button
                              type="button"
                              className="btn btn-soft btn-sm"
                              onClick={() => setSelectedMessage(m)}
                            >
                              <Eye size={14} /> Open
                            </button>

                            {isNew ? (
                              <button
                                type="button"
                                className="btn btn-ghost btn-sm"
                                title="Mark as resolved"
                                disabled={busyId === m.id}
                                onClick={() => toggleStatus(m, 'resolved')}
                              >
                                <Check size={14} /> Resolve
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="btn btn-ghost btn-sm"
                                title="Mark as new"
                                disabled={busyId === m.id}
                                onClick={() => toggleStatus(m, 'new')}
                              >
                                <RotateCcw size={14} /> Reopen
                              </button>
                            )}

                            <button
                              type="button"
                              className="icon-btn"
                              style={{ width: 32, height: 32 }}
                              aria-label="Delete message"
                              title="Delete message"
                              disabled={busyId === m.id}
                              onClick={() => handleDelete(m)}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        }
      </Async>

      {/* Detail Modal */}
      {selectedMessage && (
        <Modal
          wide
          title={selectedMessage.subject}
          onClose={() => setSelectedMessage(null)}
          footer={
            <>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => handleDelete(selectedMessage)}
              >
                <Trash2 size={15} /> Delete
              </button>

              <div className="right row" style={{ gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setSelectedMessage(null)}
                >
                  Close
                </button>

                {selectedMessage.status === 'new' ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={busyId === selectedMessage.id}
                    onClick={() => toggleStatus(selectedMessage, 'resolved')}
                  >
                    <Check size={16} /> Mark as resolved
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-soft"
                    disabled={busyId === selectedMessage.id}
                    onClick={() => toggleStatus(selectedMessage, 'new')}
                  >
                    <RotateCcw size={16} /> Mark as new
                  </button>
                )}
              </div>
            </>
          }
        >
          <div className="stack" style={{ gap: 16 }}>
            <div className="card-flat" style={{ padding: '14px 18px', borderRadius: 12 }}>
              <div className="row spread" style={{ flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div className="row" style={{ gap: 8, alignItems: 'center' }}>
                    <UserIcon size={16} className="muted" />
                    <strong>{selectedMessage.name}</strong>
                    <span className="muted">&lt;{selectedMessage.email}&gt;</span>
                  </div>
                  {selectedMessage.user && (
                    <div className="small muted" style={{ marginTop: 4 }}>
                      Registered account: {selectedMessage.user.name} ({selectedMessage.user.role})
                    </div>
                  )}
                </div>

                <div className="row" style={{ gap: 8 }}>
                  <span
                    className={`badge ${
                      selectedMessage.status === 'new' ? 'badge-warn' : 'badge-good'
                    }`}
                  >
                    {selectedMessage.status === 'new' ? 'New' : 'Resolved'}
                  </span>
                  <span className="small muted">
                    {fmtDateTime(selectedMessage.createdAt || selectedMessage.created_at)}
                  </span>
                </div>
              </div>
            </div>

            <div className="field">
              <label className="label">Message content</label>
              <div
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--line)',
                  borderRadius: 12,
                  padding: '18px 20px',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.65,
                  fontSize: '0.98rem',
                }}
              >
                {selectedMessage.message}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
