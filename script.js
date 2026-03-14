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
  { year: 1996, title: "제1회 대동제",          decade: 2000, desc: "한성대학교 대동제의 역사가 시작되었습니다. 소규모 교내 공연과 동아리 전시로 첫걸음을 내딛었습니다.",              tags: ["첫 회", "교내"] },
  { year: 2005, title: "야외 무대 첫 도입",      decade: 2000, desc: "본격적인 야외 무대를 갖추고 외부 아티스트를 처음으로 초청하며 축제의 규모가 한층 커졌습니다.",                tags: ["야외무대", "아티스트초청"] },
  { year: 2010, title: "참여형 프로그램 확대",   decade: 2010, desc: "야시장·플리마켓 등 학생이 직접 운영하는 참여형 부스가 대폭 늘어나며 축제가 더욱 풍성해졌습니다.",             tags: ["야시장", "플리마켓"] },
  { year: 2014, title: "소셜미디어 축제",        decade: 2010, desc: "SNS 연계 이벤트와 실시간 투표를 도입하여 더 많은 학생이 축제에 참여할 수 있는 새로운 장을 열었습니다.",       tags: ["SNS", "실시간투표"] },
  { year: 2018, title: "역대 최대 규모",         decade: 2010, desc: "3일간 진행된 역대 최대 규모의 축제로, 방문객이 약 5,000명에 달하며 한성대 축제 역사에 새 기록을 세웠습니다.", tags: ["5000명", "3일"] },
  { year: 2020, title: "온라인 전환 (코로나19)", decade: 2020, desc: "전 세계적 팬데믹으로 인해 처음으로 완전 온라인 비대면 방식으로 축제를 진행했습니다.",                        tags: ["온라인", "코로나19"] },
  { year: 2022, title: "하이브리드 축제",        decade: 2020, desc: "온·오프라인을 결합한 하이브리드 방식으로 축제가 돌아왔으며, 라이브 스트리밍을 통해 더 많은 이들과 함께했습니다.", tags: ["하이브리드", "라이브스트리밍"] },
  { year: 2023, title: "아카이브 프로젝트 시작", decade: 2020, desc: "학생 주도로 디지털 아카이브 프로젝트가 시작되어, 과거의 소중한 축제 기록들이 디지털로 보존되기 시작했습니다.",  tags: ["아카이브", "디지털화"] },
  { year: 2024, title: "대동제 리뉴얼",          decade: 2020, desc: "참여형 디지털 아카이브가 본격적으로 운영되며, 누구나 자신의 추억을 남기고 공유할 수 있는 플랫폼이 열렸습니다.", tags: ["리뉴얼", "참여형", "플랫폼"] },
];

// 공연 아카이브 정적 데이터
const ARCHIVE_DATA = [
  { year: 2024, name: "봄 대동제 2024",   performers: "아이유, 세이수미, 잔나비",   note: "아카이브 웹사이트가 처음으로 공개되었습니다.",          size: "대형" },
  { year: 2023, name: "봄 대동제 2023",   performers: "DAY6, 선우정아",            note: "코로나 이후 완전한 대면 축제로 돌아왔습니다.",          size: "대형" },
  { year: 2022, name: "하이브리드 대동제", performers: "온라인 스트리밍 아티스트",   note: "온·오프라인을 병행하여 더 많은 학생이 참여했습니다.",    size: "중형" },
  { year: 2021, name: "랜선 대동제",      performers: "유튜브 라이브 공연팀",       note: "100% 온라인으로 진행된 비대면 축제였습니다.",           size: "소형" },
  { year: 2020, name: "온라인 대동제",    performers: "비대면 공연팀 다수",         note: "코로나19로 인해 처음으로 온라인 전환이 이루어졌습니다.", size: "소형" },
  { year: 2019, name: "봄 대동제 2019",   performers: "10cm, 오반, 버스커버스커",   note: "역대 가장 큰 호응을 이끌어낸 축제였습니다.",            size: "대형" },
  { year: 2018, name: "제22회 대동제",    performers: "크러쉬, 멜로망스",           note: "역대 최다 방문객을 기록하며 새 역사를 썼습니다.",        size: "대형" },
  { year: 2017, name: "제21회 대동제",    performers: "볼빨간사춘기, 에디킴",       note: "-",                                                    size: "중형" },
  { year: 2016, name: "제20회 대동제",    performers: "헤이즈, 오혁",              note: "개교 20주년을 기념하는 특별 공연이 펼쳐졌습니다.",        size: "중형" },
  { year: 2015, name: "제19회 대동제",    performers: "루시드폴, 백아연",           note: "-",                                                    size: "중형" },
];

// 더미 추억 데이터 (Supabase 미연결 시 표시)
const DAY = 1000 * 60 * 60 * 24;
const DUMMY_MEMORIES = [
  { name: "22학번 컴퓨터공학부",     year: "2024", emoji: "🎉", text: "잔나비 공연에서 밤새 같이 소리질렀던 친구들, 어디있어요?",           created_at: new Date(Date.now() - DAY *  2).toISOString() },
  { name: "24학번 글로벌패션산업학부", year: "2024", emoji: "💕", text: "입학하자마자 대동제 참여! 선배들이랑 어울려서 너무 재밌었어요 🥹",    created_at: new Date(Date.now() - DAY *  5).toISOString() },
  { name: "23학번 패션디자인학부",    year: "2024", emoji: "🌟", text: "처음 온 대동제인데 부스 구경만 세 바퀴 돌았어요. 내년에 또 오고 싶다!", created_at: new Date(Date.now() - DAY *  9).toISOString() },
  { name: "19학번 경영학부",         year: "2023", emoji: "🌟", text: "코로나 끝나고 처음 온 대동제... 진짜 너무 감동이었다.",               created_at: new Date(Date.now() - DAY * 14).toISOString() },
  { name: "21학번 미디어디자인학부",  year: "2022", emoji: "🎉", text: "하이브리드라 어색했지만 오프라인으로 친구들 만나서 너무 좋았다 ㅠㅠ",   created_at: new Date(Date.now() - DAY * 21).toISOString() },
  { name: "20학번 역사문화학부",      year: "2020", emoji: "🎵", text: "온라인 대동제였지만... 방구석에서 혼자 응원봉 흔들었다.",              created_at: new Date(Date.now() - DAY * 30).toISOString() },
  { name: "익명의 선배",             year: "2019", emoji: "🍻", text: "2019년 10cm 공연, 그날 비가 왔는데 아무도 자리를 안 떠났잖아요ㅜㅜ",   created_at: new Date(Date.now() - DAY * 45).toISOString() },
  { name: "18학번 사회과학부",        year: "2019", emoji: "🍻", text: "버스커버스커 공연 때 비 맞으면서 떼창했던 거 아직도 생생해.",           created_at: new Date(Date.now() - DAY * 60).toISOString() },
  { name: "17학번 산업디자인학부",    year: "2018", emoji: "💕", text: "축제 야시장에서 만난 사람이랑 지금 결혼했어요 😊",                    created_at: new Date(Date.now() - DAY * 80).toISOString() },
  { name: "16학번 디지털인문정보학부", year: "2018", emoji: "🎵", text: "크러쉬 공연 보고 음악의 길로 입문했습니다... 지금도 후회 없어요.",     created_at: new Date(Date.now() - DAY * 102).toISOString() },
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
