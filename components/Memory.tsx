'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface Memory {
  id?: number;
  name: string;
  year: string;
  emoji: string;
  text: string;
  created_at: string;
}

function relativeTime(isoStr: string): string {
  const diff = Math.floor((Date.now() - new Date(isoStr).getTime()) / 1000);
  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

const EMOJIS = [
  { emoji: '🎉', label: '신남' },
  { emoji: '🎵', label: '음악' },
  { emoji: '🍻', label: '친구' },
  { emoji: '💕', label: '설렘' },
  { emoji: '🌟', label: '감동' },
];

const YEARS = ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '이전'];

export default function Memory() {
  const [memories, setMemories] = useState<Memory[] | null>([]);
  const [loadError, setLoadError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedEmoji, setSelectedEmoji] = useState('🎉');
  const [charCount, setCharCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ msg: '', show: false });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ msg, show: true });
    toastTimerRef.current = setTimeout(
      () => setToast(t => ({ ...t, show: false })),
      2800
    );
  };

  const loadMemories = useCallback(async () => {
    if (!supabase) {
      setMemories([]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) {
      console.error('추억 조회 실패:', error.message);
      setLoadError(true);
      setMemories(null);
    } else {
      setMemories(data as Memory[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadMemories();
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, [loadMemories]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem('memName') as HTMLInputElement).value.trim();
    const year = (form.elements.namedItem('memYear') as HTMLSelectElement).value;
    const text = (form.elements.namedItem('memText') as HTMLTextAreaElement).value.trim();
    if (!name || !text || !supabase) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('memories')
        .insert([{ name, year, emoji: selectedEmoji, text }]);
      if (error) throw error;
      await loadMemories();
      form.reset();
      setCharCount(0);
      setSelectedEmoji('🎉');
      showToast('🎉 추억이 등록되었습니다!');
    } catch (err) {
      console.error('등록 실패:', err);
      showToast('❌ 등록에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="memory-section" id="memory">
      <div className="section-header">
        <p className="section-label">PARTICIPATE</p>
        <h2>추억 남기기</h2>
        <p className="section-desc">당신의 축제 기억을 아카이브에 새겨보세요</p>
      </div>

      <div className="memory-container">
        <form className="memory-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>이름 (닉네임)</label>
              <input
                type="text"
                name="memName"
                placeholder="예) 24학번 한교"
                maxLength={20}
                required
              />
            </div>
            <div className="form-group">
              <label>축제 연도</label>
              <select name="memYear">
                {YEARS.map(y => (
                  <option key={y} value={y}>
                    {y === '이전' ? '2019년 이전' : `${y}년`}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>한 줄 추억</label>
            <textarea
              name="memText"
              placeholder="축제에서의 기억을 짧게 남겨보세요..."
              maxLength={100}
              required
              onChange={e => setCharCount(e.target.value.length)}
            />
            <span className="char-count"><span>{charCount}</span>/100</span>
          </div>
          <div className="form-group emoji-group">
            <label>기분 태그</label>
            <div className="emoji-picker">
              {EMOJIS.map(({ emoji, label }) => (
                <button
                  key={emoji}
                  type="button"
                  className={`emoji-btn${selectedEmoji === emoji ? ' active' : ''}`}
                  onClick={() => setSelectedEmoji(emoji)}
                >
                  {emoji} {label}
                </button>
              ))}
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={submitting}
          >
            {submitting ? '저장 중...' : '추억 등록하기'}
          </button>
        </form>

        <div className="memory-wall">
          <h3>최근 추억들</h3>
          <div className="memory-cards">
            {loading && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '16px 0' }}>
                불러오는 중...
              </p>
            )}
            {loadError && (
              <p style={{ color: '#f87171', fontSize: '0.9rem', padding: '16px 0' }}>
                ⚠️ 데이터를 불러오지 못했습니다. Supabase 설정을 확인해주세요.
              </p>
            )}
            {!loading && !loadError && memories?.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '16px 0' }}>
                아직 등록된 추억이 없어요. 첫 추억을 남겨보세요!
              </p>
            )}
            {!loading && !loadError && memories?.map((mem, i) => (
              <div key={mem.id ?? i} className="memory-card">
                <div className="mc-header">
                  <span className="mc-name">{mem.name}</span>
                  <div className="mc-meta">
                    <span className="mc-year">{mem.year}년</span>
                    <span>{mem.emoji}</span>
                    <span>{relativeTime(mem.created_at)}</span>
                  </div>
                </div>
                <p className="mc-text">{mem.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={`toast${toast.show ? ' show' : ''}`}>{toast.msg}</div>
    </section>
  );
}
