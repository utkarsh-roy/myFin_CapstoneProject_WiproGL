import React, {
  useState,
  useEffect,
  useRef
} from 'react';
import { loanApi } from '../../api/axiosConfig';
import useAuth from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import { PageHeader, SectionCard, EmptyState } from '../../components/ui';
import Loader from '../../components/Loader';

/* ── Helpers ── */
const fmtTime = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const fmtDate = (d) => {
  if (!d) return '';
  const date = new Date(d);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString())
    return 'Today';
  if (date.toDateString() === yesterday.toDateString())
    return 'Yesterday';
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

/* ── Quick reply chips ── */
const QUICK_CHIPS = [
  { label: '👋 Hello', text: 'Hello' },
  { label: '💰 Balance Info', text: 'How to check balance' },
  { label: '🏦 Loan Status', text: 'My loan status' },
  { label: '🔄 Transfer Help', text: 'How to transfer money' },
  { label: '🔑 PIN Help', text: 'I need help with PIN' },
  { label: '📊 Interest Rates', text: 'What are interest rates' },
  { label: '📈 Investments', text: 'Investment options' },
  { label: '🆘 Help', text: 'Help' },
];

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  /* ── Fetch messages ── */
  const fetchMessages = async () => {
    try {
      const res = await loanApi.get(
        `/api/chat/${user.userId}`);
      setMessages(res.data || []);

      // ✅ Fixed - use isRead not read
      (res.data || [])
        .filter(m =>
          !m.isRead &&
          m.senderType !== 'USER')
        .forEach(m =>
          loanApi.put(`/api/chat/read/${m.id}`)
            .then(() => window.dispatchEvent(new Event('notificationsUpdated')))
            .catch(() => { })
        );
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  };

  /* ── Poll every 4 seconds for new messages ── */
  useEffect(() => {
    if (!user?.userId) return;
    fetchMessages();
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, [user]);

  /* ── Auto scroll to bottom ── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages]);

  /* ── Send message ── */
  const sendMessage = async () => {
    const content = text.trim();
    if (!content || sending) return;

    try {
      setSending(true);
      setText('');

      await loanApi.post('/api/chat/send', {
        senderId: user.userId,
        receiverId: 0,
        senderType: 'USER',
        content,
      });

      // ✅ Fetch immediately to get auto reply
      await fetchMessages();

    } catch {
      toast.error('Failed to send message');
      setText(content); // Restore on error
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  /* ── Chip click ── */
  const handleChipClick = (chipText) => {
    setText(chipText);
    inputRef.current?.focus();
  };

  /* ── Enter to send ── */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  /* ── Group messages by date ── */
  const groupByDate = (msgs) => {
    const groups = {};
    msgs.forEach(msg => {
      const key = fmtDate(msg.sentAt);
      if (!groups[key]) groups[key] = [];
      groups[key].push(msg);
    });
    return groups;
  };

  if (loading) return <Loader message="Loading chat..." />;

  const grouped = groupByDate(messages);
  const unreadCount = messages.filter(
    m => !m.isRead && m.senderType !== 'USER'
  ).length;

  return (
    <div style={{
      paddingBottom: '40px',
      maxWidth: '760px'
    }}>
      <PageHeader
        title="Support Chat"
        icon="💬"
        subtitle="Ask anything — banking assistant replies instantly"
      />

      <SectionCard
        padding="0"
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '76vh',
          overflow: 'hidden'
        }}
      >
        {/* ── Chat Header ── */}
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid #F0F0F0',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: '#F5F7FA',
          flexShrink: 0
        }}>
          {/* Bank avatar */}
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1A237E, #00897B)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            color: '#fff',
            fontWeight: 800,
            flexShrink: 0
          }}>
            🏦
          </div>

          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '15px',
              fontWeight: 800,
              color: '#1A237E'
            }}>
              MyFin Support
            </div>
            <div style={{
              fontSize: '12px',
              color: '#388E3C',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#388E3C',
                display: 'inline-block'
              }} />
              Online · Auto-reply enabled
            </div>
          </div>

          {/* Unread badge */}
          {unreadCount > 0 && (
            <div style={{
              background: '#C62828',
              color: '#fff',
              borderRadius: '20px',
              padding: '2px 10px',
              fontSize: '12px',
              fontWeight: 700
            }}>
              {unreadCount} new
            </div>
          )}

          <div style={{
            fontSize: '12px',
            color: '#9E9E9E'
          }}>
            {messages.length} messages
          </div>
        </div>

        {/* ── Messages Area ── */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          background: '#FAFAFA'
        }}>

          {/* ── Empty state ── */}
          {messages.length === 0 && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: '12px',
              color: '#9E9E9E'
            }}>
              <div style={{ fontSize: '52px' }}>
                💬
              </div>
              <div style={{
                fontSize: '18px',
                fontWeight: 800,
                color: '#1A237E'
              }}>
                Welcome to MyFin Support!
              </div>
              <div style={{
                fontSize: '14px',
                color: '#757575',
                textAlign: 'center',
                maxWidth: '320px',
                lineHeight: 1.6
              }}>
                Type <strong>help</strong> to see
                available options, or click a
                quick reply below!
              </div>

              {/* ── Auto reply welcome ── */}
              <div style={{
                background: '#F0F4FF',
                borderRadius: '16px 16px 16px 4px',
                padding: '12px 16px',
                maxWidth: '340px',
                fontSize: '14px',
                color: '#212121',
                lineHeight: 1.6,
                border: '1px solid #C7D2FE',
                marginTop: '8px'
              }}>
                👋 Hello! I am the MyFin
                Banking Assistant. I can help
                you with balance, loans,
                transfers, PIN and more!
                <br /><br />
                Type <strong>help</strong> to
                see all options.
              </div>
            </div>
          )}

          {/* ── Grouped messages ── */}
          {Object.entries(grouped).map(
            ([date, msgs]) => (
              <div key={date}>

                {/* Date separator */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  margin: '12px 0 8px'
                }}>
                  <div style={{
                    flex: 1,
                    height: '1px',
                    background: '#E5E7EB'
                  }} />
                  <span style={{
                    fontSize: '11px',
                    color: '#9CA3AF',
                    fontWeight: 600,
                    background: '#FAFAFA',
                    padding: '2px 10px',
                    borderRadius: '20px',
                    border: '1px solid #E5E7EB',
                    whiteSpace: 'nowrap'
                  }}>
                    {date}
                  </span>
                  <div style={{
                    flex: 1,
                    height: '1px',
                    background: '#E5E7EB'
                  }} />
                </div>

                {/* Messages */}
                {msgs.map(msg => {
                  const isUser =
                    msg.senderType === 'USER';
                  return (
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'flex-end',
                        flexDirection: isUser
                          ? 'row-reverse'
                          : 'row',
                        marginBottom: '6px'
                      }}
                    >
                      {/* Avatar */}
                      <div style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        background: isUser
                          ? '#00897B'
                          : '#1A237E',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '13px',
                        fontWeight: 800,
                        color: '#fff',
                        flexShrink: 0
                      }}>
                        {isUser
                          ? (user?.username
                            || 'U')[0]
                            .toUpperCase()
                          : '🏦'
                        }
                      </div>

                      <div style={{
                        maxWidth: '65%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isUser
                          ? 'flex-end'
                          : 'flex-start'
                      }}>
                        {/* Bubble */}
                        <div style={{
                          background: isUser
                            ? '#1A237E'
                            : '#F0F4FF',
                          color: isUser
                            ? '#fff'
                            : '#212121',
                          borderRadius: isUser
                            ? '16px 16px 4px 16px'
                            : '16px 16px 16px 4px',
                          padding: '10px 14px',
                          fontSize: '14px',
                          lineHeight: 1.6,
                          wordBreak: 'break-word',
                          whiteSpace: 'pre-wrap',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                          border: isUser
                            ? 'none'
                            : '1px solid #C7D2FE'
                        }}>
                          {msg.content}
                        </div>

                        {/* Time + read tick */}
                        <div style={{
                          fontSize: '11px',
                          color: '#BDBDBD',
                          marginTop: '3px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          paddingLeft: isUser
                            ? 0 : '2px',
                          paddingRight: isUser
                            ? '2px' : 0
                        }}>
                          {fmtTime(msg.sentAt)}
                          {/* ✅ Fixed isRead */}
                          {isUser && (
                            <span style={{
                              color: msg.isRead
                                ? '#00897B'
                                : '#BDBDBD',
                              fontSize: '13px'
                            }}>
                              {msg.isRead
                                ? '✓✓'
                                : '✓'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}

          {/* Typing indicator */}
          {sending && (
            <div style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'flex-end'
            }}>
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: '#1A237E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                flexShrink: 0
              }}>
                🏦
              </div>
              <div style={{
                background: '#F0F4FF',
                borderRadius: '16px 16px 16px 4px',
                padding: '12px 16px',
                border: '1px solid #C7D2FE',
                fontSize: '18px',
                letterSpacing: '4px',
                color: '#9E9E9E'
              }}>
                ● ● ●
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* ── Quick Reply Chips ── */}
        <div style={{
          padding: '8px 16px',
          display: 'flex',
          gap: '6px',
          flexWrap: 'wrap',
          borderTop: '1px solid #F0F0F0',
          background: '#FAFAFA',
          flexShrink: 0
        }}>
          {QUICK_CHIPS.map(chip => (
            <button
              key={chip.label}
              onClick={() =>
                handleChipClick(chip.text)}
              style={{
                padding: '5px 12px',
                borderRadius: '20px',
                border: '1.5px solid #C5CAE9',
                background: '#F0F4FF',
                color: '#1A237E',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background
                  = '#1A237E';
                e.currentTarget.style.color
                  = '#FFFFFF';
                e.currentTarget.style.borderColor
                  = '#1A237E';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background
                  = '#F0F4FF';
                e.currentTarget.style.color
                  = '#1A237E';
                e.currentTarget.style.borderColor
                  = '#C5CAE9';
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* ── Input Area ── */}
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid #F0F0F0',
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-end',
          background: '#fff',
          flexShrink: 0
        }}>
          <textarea
            ref={inputRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message… (Enter to send)"
            rows={1}
            style={{
              flex: 1,
              padding: '11px 14px',
              borderRadius: '22px',
              border: '1.5px solid #C5CAE9',
              outline: 'none',
              resize: 'none',
              fontSize: '14px',
              fontFamily: 'inherit',
              color: '#212121',
              maxHeight: '100px',
              overflowY: 'auto',
              lineHeight: 1.5,
              transition: 'border-color 0.2s',
              background: '#FAFAFA'
            }}
            onFocus={e => {
              e.target.style.borderColor
                = '#1A237E';
              e.target.style.background
                = '#FFFFFF';
            }}
            onBlur={e => {
              e.target.style.borderColor
                = '#C5CAE9';
              e.target.style.background
                = '#FAFAFA';
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!text.trim() || sending}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: !text.trim() || sending
                ? '#E8EAF6'
                : '#1A237E',
              border: 'none',
              cursor: !text.trim() || sending
                ? 'not-allowed'
                : 'pointer',
              color: '#fff',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.18s',
              flexShrink: 0,
              transform: !text.trim() || sending
                ? 'none'
                : 'scale(1)',
            }}
            onMouseEnter={e => {
              if (text.trim() && !sending) {
                e.currentTarget.style.transform
                  = 'scale(1.08)';
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform
                = 'scale(1)';
            }}
          >
            {sending ? '⏳' : '➤'}
          </button>
        </div>
      </SectionCard>
    </div>
  );
}