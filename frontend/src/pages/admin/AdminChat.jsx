import React, { useState, useEffect, useRef } from 'react';
import { loanApi } from '../../api/axiosConfig';
import useAuth from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import { PageHeader, SectionCard, InputField, EmptyState } from '../../components/ui';
import Loader from '../../components/Loader';

const fmtTime = (d) => d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '';

export default function AdminChat() {
  const { user } = useAuth();
  const [allMessages, setAllMessages]     = useState([]);    // all messages from all users
  const [users,       setUsers]           = useState([]);    // unique users who messaged
  const [selectedUid, setSelectedUid]     = useState(null);  // currently open conversation
  const [text,        setText]            = useState('');
  const [loading,     setLoading]         = useState(true);
  const [sending,     setSending]         = useState(false);
  const [search,      setSearch]          = useState('');
  const bottomRef = useRef(null);

  const fetchAll = async () => {
    try {
      const res = await loanApi.get('/api/chat/admin/all');
      const msgs = res.data || [];
      setAllMessages(msgs);

      // Build unique user list from messages
      const uidMap = {};
      msgs.forEach(m => {
        const uid = m.senderType === 'USER' ? m.senderId : m.receiverId;
        if (uid && uid !== 0) {
          if (!uidMap[uid]) uidMap[uid] = { userId: uid, email: m.senderEmail || `User #${uid}`, messages: [] };
          uidMap[uid].messages.push(m);
        }
      });
      setUsers(Object.values(uidMap));
    } catch {
      // silent
    } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedUid, allMessages]);

  // Messages for the selected user
  const conversation = allMessages.filter(m =>
    (m.senderType === 'USER' && String(m.senderId) === String(selectedUid)) ||
    (m.senderType === 'ADMIN' && String(m.receiverId) === String(selectedUid))
  ).sort((a, b) => new Date(a.sentAt || a.timestamp) - new Date(b.sentAt || b.timestamp));

  // Unread count per user
  const unreadFor = (uid) => allMessages.filter(m =>
    m.senderType === 'USER' && String(m.senderId) === String(uid) && !m.read
  ).length;

  // Mark as read when opening conversation
  const openConversation = async (uid) => {
    setSelectedUid(uid);
    const unread = allMessages.filter(m => m.senderType === 'USER' && String(m.senderId) === String(uid) && !m.read);
    await Promise.all(unread.map(m => loanApi.put(`/api/chat/read/${m.id}`).catch(() => {})));
    fetchAll();
  };

  const sendMessage = async () => {
    const content = text.trim();
    if (!content || !selectedUid) return;
    try {
      setSending(true);
      setText('');
      await loanApi.post('/api/chat/send', {
        senderId: user.userId,
        receiverId: Number(selectedUid),
        senderType: 'ADMIN',
        content,
      });
      await fetchAll();
    } catch {
      toast.error('Failed to send reply');
      setText(content);
    } finally { setSending(false); }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  const filteredUsers = users.filter(u =>
    (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
    String(u.userId).includes(search)
  );

  if (loading) return <Loader message="Loading admin chat..." />;

  const selectedUser = users.find(u => String(u.userId) === String(selectedUid));

  return (
    <div style={{ paddingBottom: '40px' }}>
      <PageHeader title="Admin Chat" icon="💬" subtitle="Manage all user support conversations" />

      <div style={{ display: 'flex', gap: '20px', height: '76vh' }}>
        {/* Left panel — user list */}
        <div style={{
          width: '280px', flexShrink: 0, background: '#fff', borderRadius: '14px',
          boxShadow: '0 2px 12px rgba(26,35,126,0.07)', border: '1px solid rgba(26,35,126,0.07)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #F0F0F0' }}>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#1A237E', marginBottom: '10px' }}>
              Users ({users.length})
            </div>
            <InputField
              name="search" placeholder="Search users…" value={search}
              onChange={e => setSearch(e.target.value)} icon="🔍"
              style={{ margin: 0 }}
            />
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredUsers.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: '#BDBDBD', fontSize: '14px' }}>
                No conversations yet
              </div>
            ) : filteredUsers.map(u => {
              const unread = unreadFor(u.userId);
              const last   = u.messages[u.messages.length - 1];
              const active = String(u.userId) === String(selectedUid);
              return (
                <div
                  key={u.userId}
                  onClick={() => openConversation(u.userId)}
                  style={{
                    padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #F5F7FA',
                    background: active ? '#E8EAF6' : '#fff', transition: 'background 0.18s',
                    display: 'flex', alignItems: 'center', gap: '10px',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#F5F7FA'; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = '#fff'; }}
                >
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '50%', background: '#1A237E',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px',
                    color: '#fff', fontWeight: 800, flexShrink: 0,
                  }}>
                    {(u.email || 'U')[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: unread > 0 ? 800 : 600, color: '#1A237E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {u.email || `User #${u.userId}`}
                    </div>
                    <div style={{ fontSize: '12px', color: '#757575', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {last?.content || 'No messages'}
                    </div>
                  </div>
                  {unread > 0 && (
                    <span style={{ background: '#D32F2F', color: '#fff', borderRadius: '100px', padding: '2px 7px', fontSize: '11px', fontWeight: 800, flexShrink: 0 }}>{unread}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right panel — chat window */}
        <div style={{ flex: 1, background: '#fff', borderRadius: '14px', boxShadow: '0 2px 12px rgba(26,35,126,0.07)', border: '1px solid rgba(26,35,126,0.07)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {!selectedUid ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <EmptyState icon="💬" title="Select a conversation" message="Choose a user from the left to start replying." />
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #F0F0F0', background: '#F5F7FA', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#1A237E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', color: '#fff', fontWeight: 800 }}>
                  {(selectedUser?.email || 'U')[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#1A237E' }}>{selectedUser?.email || `User #${selectedUid}`}</div>
                  <div style={{ fontSize: '12px', color: '#757575' }}>User ID: {selectedUid}</div>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {conversation.length === 0 && (
                  <EmptyState icon="💬" title="No messages yet" message="This user hasn't sent any messages." />
                )}
                {conversation.map((msg) => {
                  const isAdmin = msg.senderType === 'ADMIN';
                  return (
                    <div key={msg.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexDirection: isAdmin ? 'row-reverse' : 'row' }}>
                      <div style={{ width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0, background: isAdmin ? '#00897B' : '#1A237E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, color: '#fff' }}>
                        {isAdmin ? 'A' : 'U'}
                      </div>
                      <div style={{ maxWidth: '65%', display: 'flex', flexDirection: 'column', alignItems: isAdmin ? 'flex-end' : 'flex-start' }}>
                        <div style={{ background: isAdmin ? '#00897B' : '#F0F4FF', color: isAdmin ? '#fff' : '#212121', borderRadius: isAdmin ? '16px 16px 4px 16px' : '16px 16px 16px 4px', padding: '10px 14px', fontSize: '14px', lineHeight: 1.5, wordBreak: 'break-word' }}>
                          {msg.content}
                        </div>
                        <div style={{ fontSize: '11px', color: '#BDBDBD', marginTop: '3px' }}>
                          {fmtTime(msg.sentAt || msg.timestamp)} · {isAdmin ? 'You (Admin)' : 'User'}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div style={{ padding: '12px 16px', borderTop: '1px solid #F0F0F0', display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Reply as admin… (Enter to send)"
                  rows={1}
                  style={{ flex: 1, padding: '11px 14px', borderRadius: '22px', border: '1.5px solid #C5CAE9', outline: 'none', resize: 'none', fontSize: '14px', fontFamily: 'inherit', color: '#212121', maxHeight: '80px', overflowY: 'auto', lineHeight: 1.5 }}
                  onFocus={e => e.target.style.borderColor = '#1A237E'}
                  onBlur={e => e.target.style.borderColor = '#C5CAE9'}
                />
                <button
                  onClick={sendMessage}
                  disabled={!text.trim() || sending}
                  style={{ width: '44px', height: '44px', borderRadius: '50%', background: !text.trim() || sending ? '#E8EAF6' : '#00897B', border: 'none', cursor: !text.trim() || sending ? 'default' : 'pointer', color: '#fff', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.18s', flexShrink: 0 }}
                >
                  {sending ? '…' : '➤'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
