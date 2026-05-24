/* 한성대학교 축제 아카이브 */

// Supabase 설정값
const SUPABASE_URL  = 'https://ezbtfgkahhnxkqqaikyr.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6YnRmZ2thaGhueGtxcWFpa3lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0NDExNTMsImV4cCI6MjA4OTAxNzE1M30.tWm2rHGE8fe-CRGeHtSVxq32jm6MUF8FltwKGkOhjdA';

// 유효한 Supabase URL(https://로 시작)일 때만 연결 모드로 동작
const SUPABASE_READY = SUPABASE_URL.startsWith('https://');

// TimelineJS embed URL, Google Sheets CSV URL, or JSON URL.
// ?timeline=URL query parameter overrides this value without changing code.
const TIMELINE_SOURCE_URL = 'https://cdn.knightlab.com/libs/timeline3/latest/embed/index.html?source=v2%3A2PACX-1vSgxNocGPPR4-FJAuYL18lWh49O9oCSr6jn4WjSvx9W_Z4e74eEvZX2VEV0Y3gI1x3MbkNytZd9WUd-&font=Default&lang=en&initial_zoom=2&width=100%25&height=650';

const TIMELINE_FALLBACK_ITEMS = [
  {
    year: '2000',
    title: '한성대학교 대동제',
    date: 'Festival Archive',
    description: '외부 타임라인 데이터를 불러오지 못했을 때 표시되는 기본 예비 장면입니다.',
    background: 'https://archives.hansung.ac.kr/files/large/1e5749f3a1edd77a3c992bb51224183f642e8170.jpg',
    thumbnail: 'https://archives.hansung.ac.kr/files/large/1e5749f3a1edd77a3c992bb51224183f642e8170.jpg',
    mood: '기록'
  },
  {
    year: '2022',
    title: '개교 50주년 기념 대동제',
    date: 'Festival Archive',
    description: '한성대학교 축제의 변화와 기억을 전시형 타임라인으로 보여주는 예비 장면입니다.',
    background: 'https://archives.hansung.ac.kr/files/large/2e73826ba9b9cfe2529ab05d94bac0ef950a2c2b.jpg',
    thumbnail: 'https://archives.hansung.ac.kr/files/large/2e73826ba9b9cfe2529ab05d94bac0ef950a2c2b.jpg',
    mood: '기념'
  },
  {
    year: '2024',
    title: '대동제 행사 진행',
    date: 'Festival Archive',
    description: '현재 프로젝트의 데이터 구조를 유지한 채 같은 시각 시스템으로 자동 렌더링됩니다.',
    background: 'https://archives.hansung.ac.kr/files/large/00a91662de66af8bd071335f8cf0329164449ad3.jpg',
    thumbnail: 'https://archives.hansung.ac.kr/files/large/00a91662de66af8bd071335f8cf0329164449ad3.jpg',
    mood: '참여'
  },
  {
    year: '2025',
    title: '대동제 잔디광장 전경',
    date: 'Festival Archive',
    description: '타임라인 링크가 정상 연결되면 이 예비 데이터 대신 외부 원본 데이터가 표시됩니다.',
    background: 'https://archives.hansung.ac.kr/files/large/1e5749f3a1edd77a3c992bb51224183f642e8170.jpg',
    thumbnail: 'https://archives.hansung.ac.kr/files/large/1e5749f3a1edd77a3c992bb51224183f642e8170.jpg',
    mood: '현재'
  }
];

// 유효한 URL일 때만 클라이언트 초기화 (오류 방지를 위해 try-catch 적용)
let db = null;
try {
  if (SUPABASE_READY) db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
} catch (e) {
  console.error('Supabase 초기화 실패:', e);
}

// XSS 방지용 HTML 이스케이프
function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// created_at 타임스탬프를 "N분 전" 형식으로 변환
function relativeTime(isoStr) {
  const diff = Math.floor((Date.now() - new Date(isoStr)) / 1000);
  if (diff < 60)   return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

// 토스트 알림 표시 후 2.8초 뒤 자동 숨김
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// 숫자를 0에서 target까지 부드럽게 증가시키는 애니메이션 (requestAnimationFrame 기반)
function countUp(el, target, duration = 1600) {
  const step = target / (duration / 16);
  let cur = 0;
  const timer = setInterval(() => {
    cur = Math.min(cur + step, target);
    el.textContent = Math.floor(cur).toLocaleString();
    if (cur >= target) clearInterval(timer);
  }, 16);
}

// 통계 섹션이 뷰포트에 들어올 때 한 번만 카운트업 실행
function initStats() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        document.querySelectorAll('.stat-num').forEach(el => {
          countUp(el, parseInt(el.dataset.target));
        });
        observer.disconnect(); // 한 번 실행 후 해제
      }
    });
  }, { threshold: 0.3 });
  const statsEl = document.querySelector('.stats');
  if (statsEl) observer.observe(statsEl);
}

function getTimelineSourceUrl() {
  const paramUrl = new URLSearchParams(window.location.search).get('timeline');
  if (!paramUrl) return TIMELINE_SOURCE_URL;
  try {
    return decodeURIComponent(paramUrl);
  } catch (e) {
    return paramUrl;
  }
}

function extractTimelineSource(url) {
  try {
    const parsed = new URL(url, window.location.href);
    const source = parsed.searchParams.get('source');
    return source || url;
  } catch (e) {
    return url;
  }
}

function toGoogleCsvUrl(source) {
  let decoded = source;
  try {
    decoded = decodeURIComponent(source);
  } catch (e) {
    decoded = source;
  }
  const pacxMatch = decoded.match(/(?:v2:)?(2PACX-[^&]+)/);
  if (pacxMatch) {
    return `https://docs.google.com/spreadsheets/d/e/${pacxMatch[1]}/pub?output=csv`;
  }
  if (decoded.includes('docs.google.com') && decoded.includes('/pubhtml')) {
    const csvUrl = decoded.replace('/pubhtml', '/pub');
    return `${csvUrl}${csvUrl.includes('?') ? '&' : '?'}output=csv`;
  }
  if (decoded.includes('docs.google.com') && !decoded.includes('output=csv')) {
    return `${decoded}${decoded.includes('?') ? '&' : '?'}output=csv`;
  }
  return decoded;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && quoted && next === '"') {
      cell += '"';
      i++;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      row.push(cell);
      cell = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') i++;
      row.push(cell);
      if (row.some(value => value.trim() !== '')) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }

  row.push(cell);
  if (row.some(value => value.trim() !== '')) rows.push(row);
  return rows;
}

function normalizeKey(key) {
  return key.toLowerCase().replace(/[^a-z0-9가-힣]/g, '');
}

function makeRowObject(headers, values) {
  return headers.reduce((obj, header, index) => {
    obj[normalizeKey(header)] = (values[index] || '').trim();
    return obj;
  }, {});
}

function readField(row, names) {
  for (const name of names) {
    const value = row[normalizeKey(name)];
    if (value) return value;
  }
  return '';
}

function formatTimelineDate(row) {
  const startYear = readField(row, ['year', 'startyear', '시작연도', '연도']);
  const startMonth = readField(row, ['month', 'startmonth', '시작월']);
  const startDay = readField(row, ['day', 'startday', '시작일']);
  const endYear = readField(row, ['endyear', '종료연도']);
  const endMonth = readField(row, ['endmonth', '종료월']);
  const endDay = readField(row, ['endday', '종료일']);
  const start = [startYear, startMonth, startDay].filter(Boolean).join('.');
  const end = [endYear, endMonth, endDay].filter(Boolean).join('.');
  return end ? `${start} — ${end}` : start;
}

function resolveImageUrl(url) {
  if (!url) return '';
  const trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) return '';
  if (trimmed.includes('drive.google.com/drive/folders')) return '';
  const driveMatch = trimmed.match(/(?:drive\.google\.com\/file\/d\/|id=)([-\w]{20,})/);
  if (driveMatch) return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
  return trimmed;
}

function moodForIndex(index, total, title = '') {
  const text = title.toLowerCase();
  if (title.includes('개교') || title.includes('기념')) return '기념';
  if (title.includes('온라인')) return '전환';
  if (title.includes('Magic') || title.includes('DREAM')) return '확장';
  if (text.includes('festival') || title.includes('대동제')) return '축제';
  if (index < total * 0.34) return '탐색';
  if (index < total * 0.68) return '실험';
  return '철학';
}

function accentForMood(mood) {
  const map = {
    '탐색': '#b9a17b',
    '방황': '#8ea0b8',
    '전환': '#d7a86e',
    '기록': '#b9a17b',
    '기념': '#d7a86e',
    '참여': '#c7a35a',
    '현재': '#d8c7ad',
    '축제': '#d7b98a',
    '여행': '#b58b63',
    '실험': '#bfc3c7',
    '도전': '#c7a35a',
    '확장': '#97b3d9',
    '철학': '#d8c7ad',
    '완성': '#ead8b5'
  };
  return map[mood] || '#d7b98a';
}

function normalizeTimelineItems(rawItems) {
  const items = rawItems
    .map((item, index, arr) => {
      const row = Object.keys(item).reduce((obj, key) => {
        obj[normalizeKey(key)] = String(item[key] || '').trim();
        return obj;
      }, {});
      const startDate = item.start_date || item.startDate || {};
      const mediaData = item.media || {};
      const rawTitle = readField(row, ['headline', 'title', '제목']) || item.text?.headline || '';
      const rawDescription = readField(row, ['text', 'description', 'desc', '설명', '내용']) || item.text?.text || item.text || '';
      const description = typeof rawDescription === 'string' ? rawDescription : '';
      const year = readField(row, ['year', 'startyear', '연도']) || startDate.year || String(index + 1);
      const date = readField(row, ['date', '날짜']) || formatTimelineDate(row);
      const backgroundSource = resolveImageUrl(readField(row, ['background', 'backgroundimage', '배경', '배경이미지']));
      const mediaSource = resolveImageUrl(readField(row, ['media', 'image', '이미지'])) ||
        resolveImageUrl(item.background?.url || item.background || mediaData.url);
      if (!rawTitle && !description && !backgroundSource && !mediaSource) return null;
      const title = rawTitle || String(year);
      const background = backgroundSource ||
        mediaSource ||
        TIMELINE_FALLBACK_ITEMS[index % TIMELINE_FALLBACK_ITEMS.length].background;
      const thumbnail = resolveImageUrl(readField(row, ['thumbnail', 'thumb', '썸네일'])) ||
        mediaSource ||
        resolveImageUrl(mediaData.thumbnail || mediaData.url);
      const mood = readField(row, ['mood', 'theme', 'group', '분위기', '테마']) || moodForIndex(index, arr.length, title);

      return {
        title,
        year,
        date,
        description,
        background,
        thumbnail,
        mood,
        accent: accentForMood(mood)
      };
    })
    .filter(Boolean);

  return items.length ? items : TIMELINE_FALLBACK_ITEMS;
}

async function loadTimelineItems(sourceUrl) {
  const source = extractTimelineSource(sourceUrl);
  const dataUrl = toGoogleCsvUrl(source);
  const response = await fetch(dataUrl, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Timeline source request failed: ${response.status}`);
  const text = await response.text();
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('json') || dataUrl.endsWith('.json') || text.trim().startsWith('{') || text.trim().startsWith('[')) {
    const json = JSON.parse(text);
    const events = Array.isArray(json) ? json : (json.events || json.timeline || json.items || []);
    return normalizeTimelineItems(events);
  }

  const rows = parseCsv(text);
  const headers = rows.shift() || [];
  return normalizeTimelineItems(rows.map(row => makeRowObject(headers, row)));
}

function createTimelineScene(item, index) {
  return `
    <article class="timeline-scene" data-index="${index}" style="--scene-accent:${item.accent}">
      <div class="scene-bg" style="background-image:url('${item.background.replace(/'/g, '%27')}')"></div>
      <div class="scene-gradient"></div>
      <div class="scene-texture"></div>
      <div class="scene-content">
        <div class="scene-copy">
          <p class="scene-mood">${escapeHtml(item.mood)}</p>
          <span class="scene-year">${escapeHtml(String(item.year))}</span>
          <h3 class="scene-title">${escapeHtml(item.title)}</h3>
          <p class="scene-date">${escapeHtml(item.date || '')}</p>
          <p class="scene-desc">${escapeHtml(item.description || '')}</p>
        </div>
        ${item.thumbnail ? `<figure class="scene-media"><img src="${item.thumbnail}" alt="${escapeHtml(item.title)}" loading="${index < 2 ? 'eager' : 'lazy'}"></figure>` : ''}
      </div>
    </article>`;
}

function createAxisMarker(item, index) {
  return `
    <button class="axis-marker" type="button" data-index="${index}" style="--scene-accent:${item.accent}" aria-label="${escapeHtml(item.year)} ${escapeHtml(item.title)}">
      <span class="axis-year">${escapeHtml(String(item.year))}</span>
      <span class="axis-title">${escapeHtml(item.title)}</span>
    </button>`;
}

function preloadTimelineImages(items, currentIndex) {
  [currentIndex, currentIndex + 1, currentIndex - 1].forEach(index => {
    const item = items[index];
    if (!item || !item.background) return;
    const image = new Image();
    image.src = item.background;
  });
}

function mountTimeline(items) {
  const app = document.getElementById('timelineApp');
  const scenes = document.getElementById('timelineScenes');
  const axis = document.getElementById('timelineAxis');
  const prev = document.getElementById('timelinePrev');
  const next = document.getElementById('timelineNext');
  const progress = document.getElementById('timelineProgressBar');
  const start = document.getElementById('timelineStartBtn');
  const loading = document.getElementById('timelineLoading');
  const heroBg = document.getElementById('timelineHeroBg');
  if (!app || !scenes || !axis || !prev || !next || !progress) return;

  let activeIndex = 0;
  let wheelLock = false;
  let touchStartX = 0;
  let touchStartY = 0;

  loading.hidden = true;
  if (heroBg && items[0]?.background) {
    heroBg.style.backgroundImage = `linear-gradient(115deg, rgba(0,0,0,0.45), rgba(0,0,0,0.05)), url('${items[0].background.replace(/'/g, '%27')}')`;
  }
  scenes.innerHTML = items.map(createTimelineScene).join('');
  axis.innerHTML = items.map(createAxisMarker).join('');

  const sceneEls = Array.from(scenes.querySelectorAll('.timeline-scene'));
  const markerEls = Array.from(axis.querySelectorAll('.axis-marker'));
  const setActive = (index) => {
    activeIndex = Math.max(0, Math.min(items.length - 1, index));
    sceneEls.forEach((scene, i) => {
      scene.classList.toggle('is-active', i === activeIndex);
      scene.classList.toggle('is-before', i < activeIndex);
      scene.setAttribute('aria-hidden', i === activeIndex ? 'false' : 'true');
    });
    markerEls.forEach((marker, i) => {
      marker.classList.toggle('is-active', i === activeIndex);
      marker.setAttribute('aria-current', i === activeIndex ? 'step' : 'false');
    });
    prev.disabled = activeIndex === 0;
    next.disabled = activeIndex === items.length - 1;
    progress.style.width = `${items.length <= 1 ? 100 : (activeIndex / (items.length - 1)) * 100}%`;
    markerEls[activeIndex]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    preloadTimelineImages(items, activeIndex);
  };

  const move = (direction) => setActive(activeIndex + direction);
  prev.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  markerEls.forEach(marker => {
    marker.addEventListener('click', () => setActive(Number(marker.dataset.index)));
  });
  start?.addEventListener('click', () => scenes.scrollIntoView({ behavior: 'smooth', block: 'start' }));

  app.addEventListener('wheel', (event) => {
    const isInsideScenes = window.scrollY >= app.offsetTop + window.innerHeight * 0.4 &&
      window.scrollY < app.offsetTop + app.offsetHeight - window.innerHeight * 0.2;
    if (!isInsideScenes || Math.abs(event.deltaY) < 18 || wheelLock) return;
    event.preventDefault();
    wheelLock = true;
    move(event.deltaY > 0 ? 1 : -1);
    setTimeout(() => { wheelLock = false; }, 720);
  }, { passive: false });

  app.addEventListener('touchstart', (event) => {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
  }, { passive: true });
  app.addEventListener('touchend', (event) => {
    const dx = event.changedTouches[0].clientX - touchStartX;
    const dy = event.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) move(dx < 0 ? 1 : -1);
  }, { passive: true });

  document.addEventListener('keydown', (event) => {
    const rect = app.getBoundingClientRect();
    const isTimelineInView = rect.top < window.innerHeight * 0.65 && rect.bottom > window.innerHeight * 0.35;
    if (!isTimelineInView && document.activeElement?.closest('#timelineApp') !== app) return;
    if (event.key === 'ArrowRight' || event.key === 'PageDown') {
      event.preventDefault();
      move(1);
    }
    if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
      event.preventDefault();
      move(-1);
    }
  });

  setActive(0);
}

async function initTimeline() {
  const error = document.getElementById('timelineError');
  try {
    const items = await loadTimelineItems(getTimelineSourceUrl());
    mountTimeline(items);
  } catch (err) {
    console.error('Timeline load failed:', err);
    if (error) {
      error.hidden = false;
      error.textContent = '타임라인 데이터를 불러오지 못해 기본 전시 데이터를 표시합니다. Google Sheets가 웹에 게시되어 있는지, TimelineJS URL의 source 값이 올바른지 확인하세요.';
    }
    mountTimeline(TIMELINE_FALLBACK_ITEMS);
  }
}

// 더미 모드일 때 메모리 내 임시 저장소
let localMemories = [];

// Supabase 연결 시 DB 조회, 미연결 시 빈 배열 반환
async function fetchMemories() {
  if (!SUPABASE_READY || !db) return [];
  const { data, error } = await db
    .from('memories')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) {
    console.error('추억 조회 실패 (Supabase 오류):', error.message, error);
    return null; // null = 오류 상태
  }
  return data;
}

// Supabase 연결 시 DB에 저장
async function insertMemory(payload) {
  if (!SUPABASE_READY || !db) throw new Error('Supabase 미연결 상태입니다.');
  const { error } = await db.from('memories').insert([payload]);
  if (error) {
    console.error('추억 저장 실패 (Supabase 오류):', error.message, error);
    throw error;
  }
}

// 추억 객체를 카드 DOM으로 변환
function createMemoryCard(mem) {
  const div = document.createElement('div');
  div.className = 'memory-card';
  div.innerHTML = `
    <div class="mc-header">
      <span class="mc-name">${escapeHtml(mem.name)}</span>
      <div class="mc-meta">
        <span class="mc-year">${mem.year}년</span>
        <span>${mem.emoji}</span>
        <span>${relativeTime(mem.created_at)}</span>
      </div>
    </div>
    <p class="mc-text">${escapeHtml(mem.text)}</p>
  `;
  return div;
}

// 추억 목록을 wall 영역에 렌더링 (로딩·빈 상태 처리 포함)
function renderMemories(list) {
  const wall = document.getElementById('memoryCards');
  wall.innerHTML = '';
  if (list === null) {
    wall.innerHTML = '<p style="color:#f87171;font-size:0.9rem;padding:16px 0">⚠️ 데이터를 불러오지 못했습니다. Supabase 설정을 확인해주세요. (브라우저 콘솔 F12에서 오류 내용 확인)</p>';
    return;
  }
  if (!list.length) {
    wall.innerHTML = '<p style="color:var(--text-muted);font-size:0.9rem;padding:16px 0">아직 등록된 추억이 없어요. 첫 추억을 남겨보세요!</p>';
    return;
  }
  list.forEach(m => wall.appendChild(createMemoryCard(m)));
}

// 추억 섹션 초기화: DB에서 목록 로드 + 폼 제출 처리
async function initMemory() {
  // 더미 모드: 즉시 표시 / DB 모드: 로딩 후 조회
  const wall = document.getElementById('memoryCards');
  if (SUPABASE_READY) {
    wall.innerHTML = '<p style="color:var(--text-muted);font-size:0.9rem;padding:16px 0">불러오는 중...</p>';
  }
  renderMemories(await fetchMemories());

  // 이모지 버튼 단일 선택
  let selectedEmoji = '🎉';
  document.querySelectorAll('.emoji-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedEmoji = btn.dataset.emoji;
    });
  });

  // 글자 수 실시간 카운트
  const textarea = document.getElementById('memText');
  const cnt = document.getElementById('charCnt');
  textarea.addEventListener('input', () => { cnt.textContent = textarea.value.length; });

  // 폼 제출 시 Supabase에 저장 후 목록 갱신
  document.getElementById('memoryForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('memName').value.trim();
    const year = document.getElementById('memYear').value;
    const text = textarea.value.trim();
    if (!name || !text) return;

    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = '저장 중...';

    try {
      await insertMemory({ name, year, emoji: selectedEmoji, text });
      renderMemories(await fetchMemories()); // 저장 후 최신 목록 재조회
      e.target.reset();
      cnt.textContent = '0';
      // 이모지 선택 초기화
      document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('active'));
      document.querySelector('.emoji-btn[data-emoji="🎉"]').classList.add('active');
      selectedEmoji = '🎉';
      showToast('🎉 추억이 등록되었습니다!');
    } catch (err) {
      console.error('등록 실패:', err);
      showToast('❌ 등록에 실패했습니다. 다시 시도해주세요.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = '추억 등록하기';
    }
  });
}

// 규모에 따른 색상 뱃지 반환
function sizeBadge(size) {
  const map = { '대형': 'badge-blue', '중형': 'badge-green', '소형': 'badge-gold' };
  return `<span class="badge ${map[size] || 'badge-blue'}">${size}</span>`;
}

// 공연 데이터를 테이블 행으로 렌더링
// 햄버거 메뉴 토글 및 스크롤 시 내비바 그림자 적용
function initNav() {
  const hamburger = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  const nav = document.getElementById('navbar');

  hamburger.addEventListener('click', () => menu.classList.toggle('open'));
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => menu.classList.remove('open'));
  });

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    const targetId = link.hash.slice(1);
    const target = document.getElementById(targetId);
    if (!target) return;
    link.addEventListener('click', (event) => {
      event.preventDefault();
      menu.classList.remove('open');
      const offset = (nav?.offsetHeight || 72) + 20;
      const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - offset);
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  window.addEventListener('scroll', () => {
    document.getElementById('navbar').style.boxShadow =
      window.scrollY > 20 ? '0 4px 24px rgba(0,0,0,0.3)' : 'none';
  });
}

// 요소가 뷰포트에 진입할 때 페이드인·슬라이드업 애니메이션 적용
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.stat-item, .immersive-timeline').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });
}

// 캔버스 파티클 시스템 (축제 느낌의 떠오르는 빛 입자)
function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // 캔버스를 뷰포트 크기에 맞춤
  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // 파티클 색상 팔레트 (보라·금·핑크·하늘)
  const COLORS = ['rgba(129,140,248,VAL)', 'rgba(245,158,11,VAL)', 'rgba(236,72,153,VAL)', 'rgba(96,165,250,VAL)', 'rgba(255,255,255,VAL)'];

  // 파티클 생성: 화면 하단 랜덤 위치에서 시작
  function makeParticle() {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    return {
      x: Math.random() * canvas.width,
      y: canvas.height + Math.random() * 60,
      r: Math.random() * 2 + 0.8,          // 반지름
      speed: Math.random() * 0.6 + 0.3,    // 상승 속도
      drift: (Math.random() - 0.5) * 0.4,  // 좌우 흔들림
      alpha: Math.random() * 0.5 + 0.3,    // 초기 투명도
      color,
      twinkle: Math.random() * Math.PI * 2 // 반짝임 위상
    };
  }

  // 초기 파티클 풀 생성 (화면 곳곳에 미리 배치)
  const particles = Array.from({ length: 90 }, () => {
    const p = makeParticle();
    p.y = Math.random() * canvas.height; // 초기에는 화면 전체에 분산
    return p;
  });

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const now = Date.now() / 1000;

    particles.forEach((p, i) => {
      // 위로 이동 + 좌우 사인파 흔들림
      p.y -= p.speed;
      p.x += Math.sin(now * 0.8 + p.twinkle) * p.drift;

      // 반짝임: 시간에 따라 투명도 진동
      const flicker = 0.25 * Math.sin(now * 2.5 + p.twinkle);
      const alpha = Math.max(0, Math.min(1, p.alpha + flicker));
      const fillColor = p.color.replace('VAL', alpha.toFixed(2));

      // 원형 글로우 그리기
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = fillColor;
      ctx.shadowColor = fillColor;
      ctx.shadowBlur = p.r * 4;
      ctx.fill();
      ctx.shadowBlur = 0;

      // 화면 위로 벗어나면 하단에서 재생성
      if (p.y < -10) particles[i] = makeParticle();
    });

    requestAnimationFrame(animate);
  }
  animate();
}

// 스크롤 시 히어로 콘텐츠 패럴렉스 + 페이드 효과
function initParallax() {
  const content = document.getElementById('heroContent');
  const hero    = document.querySelector('.hero');
  if (!content || !hero) return;

  window.addEventListener('scroll', () => {
    const scrollY   = window.scrollY;
    const heroH     = hero.offsetHeight;
    if (scrollY > heroH) return;

    // 스크롤 비율 (0 ~ 1)
    const ratio = scrollY / heroH;

    // 콘텐츠를 스크롤 속도의 40%로 올림 (패럴렉스)
    content.style.transform = `translateY(${scrollY * 0.4}px)`;
    // 스크롤할수록 서서히 페이드아웃
    content.style.opacity   = Math.max(0, 1 - ratio * 2).toFixed(2);
  }, { passive: true });
}

// 유튜브 영상 클릭 시 인라인 재생 (썸네일 → iframe 교체)
function initVideos() {
  document.querySelectorAll('.video-card').forEach(card => {
    const thumb = card.querySelector('.video-thumb');
    const vid = card.dataset.vid;
    thumb.addEventListener('click', () => {
      if (thumb.querySelector('iframe')) return;
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${vid}?autoplay=1&rel=0`;
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      thumb.innerHTML = '';
      thumb.appendChild(iframe);
    });
  });
}

// 페이지 로드 후 각 모듈 초기화
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initStats();
  initTimeline();
  initMemory();
  initVideos();
  initHeroCanvas();
  initParallax();
  setTimeout(initScrollReveal, 100);
});
