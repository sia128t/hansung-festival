/* 한성대학교 축제 아카이브 */

// Supabase 설정값
const SUPABASE_URL  = 'https://ezbtfgkahhnxkqqaikyr.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6YnRmZ2thaGhueGtxcWFpa3lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0NDExNTMsImV4cCI6MjA4OTAxNzE1M30.tWm2rHGE8fe-CRGeHtSVxq32jm6MUF8FltwKGkOhjdA';

// 유효한 Supabase URL(https://로 시작)일 때만 연결 모드로 동작
const SUPABASE_READY = SUPABASE_URL.startsWith('https://');

// 유효한 URL일 때만 클라이언트 초기화 (오류 방지를 위해 try-catch 적용)
let db = null;
try {
  if (SUPABASE_READY) db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
} catch (e) {
  console.error('Supabase 초기화 실패:', e);
}

// 타임라인 정적 데이터
const TIMELINE_DATA = [
  { year: 2000, title: "축제", decade: 2000, desc: "기사 내용 인용.", tags: ["해시", "태그"] },
  { year: 2001, title: "축제", decade: 2000, desc: "기사 내용 인용.", tags: ["해시", "태그"] },
  { year: 2010, title: "축제", decade: 2010, desc: "기사 내용 인용.", tags: ["해시", "태그"] },
  { year: 2011, title: "축제", decade: 2010, desc: "기사 내용 인용.", tags: ["해시", "태그"] },
  { year: 2012, title: "축제", decade: 2010, desc: "기사 내용 인용.", tags: ["해시", "태그"] },
  { year: 2020, title: "축제", decade: 2020, desc: "기사 내용 인용.", tags: ["해시", "태그"] },
  { year: 2021, title: "축제", decade: 2020, desc: "기사 내용 인용.", tags: ["해시", "태그"] },
  { year: 2022, title: "축제", decade: 2020, desc: "기사 내용 인용.", tags: ["해시", "태그"] },
  { year: 2023, title: "축제", decade: 2020, desc: "기사 내용 인용.", tags: ["해시", "태그"] },
];

// 공연 아카이브 정적 데이터
const ARCHIVE_DATA = [
  { year: 2026, name: "대동제 2026",   performers: "연예인1, 연예인, 연예인",   note: "특징1."},
  { year: 2025, name: "대동제 2025",   performers: "연예인2, 연예인, 연예인",   note: "특징2."},
  { year: 2024, name: "대동제 2024",   performers: "연예인3, 연예인, 연예인",   note: "특징3."},
  { year: 2023, name: "대동제 2023",   performers: "연예인4, 연예인, 연예인",   note: "특징."},
];

// XSS 방지용 HTML 이스케이프
function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
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

// 타임라인 카드를 홀짝에 따라 좌우 교차 배치로 렌더링
function renderTimeline(decade) {
  const container = document.getElementById('timelineContainer');
  const filtered = decade === 'all'
    ? TIMELINE_DATA
    : TIMELINE_DATA.filter(d => d.decade === parseInt(decade));

  container.innerHTML = filtered.map((item, i) => {
    // 홀수 인덱스: 왼쪽 카드 / 짝수: 오른쪽 카드
    const card = `
      <span class="tl-year">${item.year}</span>
      <p class="tl-title">${item.title}</p>
      <p class="tl-desc">${item.desc}</p>
      ${item.tags.map(t => `<span class="tl-tag">${t}</span>`).join('')}
    `;
    return `
      <div class="timeline-item" style="animation-delay:${i * 0.08}s">
        ${i % 2 === 0
          ? `<div class="tl-content">${card}</div>
             <div class="tl-dot-col"><div class="tl-dot"></div></div>
             <div class="tl-spacer"></div>`
          : `<div class="tl-spacer"></div>
             <div class="tl-dot-col"><div class="tl-dot"></div></div>
             <div class="tl-content">${card}</div>`
        }
      </div>`;
  }).join('');
}

// 타임라인 초기화 및 10년대 필터 버튼 이벤트 등록
function initTimeline() {
  renderTimeline('all');
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderTimeline(btn.dataset.decade);
    });
  });
}

// 더미 모드일 때 메모리 내 임시 저장소
let localMemories = [...DUMMY_MEMORIES];

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
function renderArchive(data) {
  document.getElementById('archiveBody').innerHTML = data.map(row => `
    <tr>
      <td class="td-year">${row.year}</td>
      <td>${row.name}</td>
      <td>${row.performers}</td>
      <td>${row.note}</td>
      <td>${sizeBadge(row.size)}</td>
    </tr>
  `).join('');
}

// 아카이브 초기 렌더링 + 검색어 필터링 (연도·이름·공연팀·특이사항 대상)
function initArchive() {
  renderArchive(ARCHIVE_DATA);
  document.getElementById('archiveSearch').addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    renderArchive(ARCHIVE_DATA.filter(row =>
      row.year.toString().includes(q) ||
      row.name.toLowerCase().includes(q) ||
      row.performers.toLowerCase().includes(q) ||
      row.note.toLowerCase().includes(q)
    ));
  });
}

// 햄버거 메뉴 토글 및 스크롤 시 내비바 그림자 적용
function initNav() {
  const hamburger = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  hamburger.addEventListener('click', () => menu.classList.toggle('open'));
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => menu.classList.remove('open'));
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

  document.querySelectorAll('.stat-item, .gallery-item, .archive-table tbody tr').forEach(el => {
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

// 페이지 로드 후 각 모듈 초기화 (갤러리 오버레이는 CSS 처리)
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initStats();
  initTimeline();
  initMemory();
  initArchive();
  initVideos();
  initHeroCanvas();
  initParallax();
  setTimeout(initScrollReveal, 100);
});
