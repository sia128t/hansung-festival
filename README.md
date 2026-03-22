# 한성대학교 축제 아카이브 — HSU FESTA

한성대학교 대동제의 역사를 디지털로 기록하고, 재학생·졸업생 누구나 자신의 추억을 남길 수 있는 참여형 아카이브 웹사이트입니다.

**배포 주소:** https://hansung-festival.vercel.app

**공식 유튜브:** https://www.youtube.com/user/HansungUvi

---

## 웹페이지 사용 설명서

### 전체 구성

| 섹션 | 설명 |
|---|---|
| Hero (메인 화면) | 사이트 타이틀과 주요 버튼, 파티클 애니메이션 |
| 역사 (Timeline) | 1996년 1회 대동제부터 현재까지의 연도별 역사 카드 |
| 갤러리 (Gallery) | 역대 대동제 공식 사진 그리드 |
| 추억 남기기 (Memory) | 누구나 자신의 축제 기억을 직접 등록하고 공유 |
| 영상 (Videos) | 한성대 공식 유튜브 영상 인라인 재생 |
| 공연 아카이브 (Archive) | 연도별 공연팀·행사 정보 테이블 및 검색 |

---

### 섹션별 사용 방법

#### Hero — 메인 화면
- 상단 고정 내비바로 각 섹션 바로 이동
- **역사 탐방** 버튼 → 타임라인 섹션으로 스크롤
- **추억 남기기** 버튼 → 참여 폼으로 바로 이동
- 모바일에서는 오른쪽 상단 햄버거 메뉴(☰)로 내비게이션 열기

#### 역사 — 축제 타임라인
- **전체 / 2000년대 / 2010년대 / 2020년대** 버튼으로 연도대 필터
- 카드에는 연도, 축제명, 설명, 태그가 표시됨
- 1990년대 이전 기록은 배너의 **전체 역사 타임라인 보기** 링크 클릭

#### 갤러리 — 축제 사진
- 이미지에 마우스를 올리면 연도와 설명 오버레이 표시
- 이미지 출처: 한성디지털사진아카이브 / 한성대 성곽마을 아카이빙 프로젝트

#### 추억 남기기 — 참여 기능
1. 이름(닉네임), 축제 연도 입력
2. 최대 100자의 한 줄 추억 작성
3. 기분 태그(🎉 신남 / 🎵 음악 / 🍻 친구 / 💕 설렘 / 🌟 감동) 선택
4. **추억 등록하기** 버튼 클릭
5. 오른쪽 추억 벽(Wall)에 최신순으로 즉시 표시

> Supabase 연결 시 DB에 영구 저장되어 모든 기기에서 공유됩니다.
> 미연결 시에는 더미 데이터가 표시되며 새로고침하면 초기화됩니다.

#### 영상 — 한성대 공식 유튜브
- 영상 썸네일의 ▶ 버튼 클릭 → **유튜브 이동 없이 페이지 내에서 바로 재생**
- 더 많은 영상은 하단 **한성대학교 공식 유튜브 채널 바로가기** 버튼 클릭

#### 공연 아카이브 — 역대 공연 정보
- 연도, 축제명, 공연팀, 특이사항이 테이블로 정리됨
- 검색창에 입력하면 연도·공연팀·행사명·특이사항 전체에서 실시간 필터링
- 규모 뱃지 색상: 🔵 대형 / 🟢 중형 / 🟡 소형

---

## 코드 로직 설명

### 파일 구조

```
hansung-festival/
├── index.html   # 페이지 구조 및 마크업 (섹션별 HTML)
├── style.css    # 다크 테마, 레이아웃, 애니메이션, 반응형
├── script.js    # 전체 동작 로직, Supabase 연동
└── README.md
```

---

### script.js 주요 로직

#### 1. Supabase 연결 판단
```
SUPABASE_URL이 'https://'로 시작하면 DB 모드
└─ db 클라이언트 초기화 (supabase.createClient)
   아니면 더미 데이터 모드 (로컬 메모리만 사용)
```
`SUPABASE_READY` 플래그 하나로 DB 모드·더미 모드를 전환합니다.

#### 2. 타임라인 렌더링 (renderTimeline)
```
TIMELINE_DATA 배열
└─ decade 필터 적용 (전체 / 2000 / 2010 / 2020)
   └─ 인덱스 짝수: 카드를 왼쪽에 배치
      인덱스 홀수: 카드를 오른쪽에 배치
      (CSS grid 3열: 카드 | 점 | 빈칸 또는 빈칸 | 점 | 카드)
```

#### 3. 추억 저장 흐름 (initMemory → insertMemory)
```
폼 제출
└─ SUPABASE_READY?
   ├─ Yes → Supabase INSERT → 성공 시 SELECT 재조회 → 렌더링
   └─ No  → localMemories 배열 앞에 push → 즉시 렌더링
```
XSS 방지를 위해 사용자 입력값은 `escapeHtml()`로 이스케이프 후 렌더링합니다.

#### 4. 통계 카운트업 (initStats + countUp)
```
IntersectionObserver로 .stats 섹션 감지
└─ 뷰포트 진입 시 한 번만 실행
   └─ 16ms 간격 setInterval로 0 → target까지 증가
      (목표값 / 1600ms × 16ms = 스텝 크기)
```

#### 5. 캔버스 파티클 (initHeroCanvas)
```
90개의 파티클 생성 (보라·금·핑크·하늘·흰색)
└─ requestAnimationFrame 루프
   ├─ y 좌표를 speed만큼 감소 (위로 이동)
   ├─ x 좌표에 sin파 적용 (좌우 흔들림)
   ├─ alpha에 sin파 적용 (반짝임)
   └─ y < -10 이면 하단에서 파티클 재생성
```

#### 6. 히어로 패럴렉스 (initParallax)
```
scroll 이벤트
└─ scrollY / hero높이 = ratio (0~1)
   ├─ transform: translateY(scrollY × 0.4px)  → 스크롤의 40% 속도로 이동
   └─ opacity: 1 - ratio × 2                  → 절반 스크롤 시점에 완전 페이드아웃
```

#### 7. 유튜브 인라인 재생 (initVideos)
```
.video-thumb 클릭
└─ 이미 iframe 있으면 무시
   없으면 <iframe> 생성
   └─ src: youtube.com/embed/{vid}?autoplay=1&rel=0
      기존 썸네일·버튼 DOM 교체
```

#### 8. 스크롤 페이드인 (initScrollReveal)
```
IntersectionObserver (threshold: 0.08)
└─ .stat-item, .gallery-item, .archive-table tbody tr 대상
   └─ 뷰포트 진입 시 opacity: 0→1, translateY: 20px→0
      (DOMContentLoaded 후 100ms 딜레이로 실행 — 초기 레이아웃 계산 완료 대기)
```

---

## 데이터 수정 방법

| 수정 항목 | 파일 | 위치 |
|---|---|---|
| 타임라인 내용 | `script.js` | `TIMELINE_DATA` 배열 |
| 공연 아카이브 | `script.js` | `ARCHIVE_DATA` 배열 |
| 더미 추억 데이터 | `script.js` | `DUMMY_MEMORIES` 배열 |
| 갤러리 이미지·설명 | `index.html` | `<!-- GALLERY -->` 섹션 |
| 통계 숫자 | `index.html` | `data-target` 속성 값 |
| 영상 유튜브 ID | `index.html` | `<!-- VIDEOS -->` 섹션 |

---

## 영상 섹션 유튜브 ID 교체 방법

영상 카드의 video ID는 직접 교체해야 합니다.

### 1단계 — 공식 채널에서 영상 URL 복사

1. [한성대학교 공식 유튜브](https://www.youtube.com/user/HansungUvi) 접속
2. 원하는 영상 클릭
3. 주소창 URL 확인:
   ```
   https://www.youtube.com/watch?v=ABC123xyz
                                    ↑ 이 부분이 video ID
   ```

### 2단계 — index.html에서 ID 교체

`index.html`의 `<!-- VIDEOS -->` 섹션에서 각 카드의 `data-vid`와 `img src` 두 곳을 모두 교체합니다.

```html
<!-- 변경 전 -->
<div class="video-card" data-vid="ZgQ-NN3nErw">
  <img src="https://img.youtube.com/vi/ZgQ-NN3nErw/maxresdefault.jpg" ... />

<!-- 변경 후 -->
<div class="video-card" data-vid="ABC123xyz">
  <img src="https://img.youtube.com/vi/ABC123xyz/maxresdefault.jpg" ... />
```

### 3단계 — 제목·연도·채널명 수정

```html
<div class="video-info">
  <span class="video-year">2024</span>           <!-- 연도 -->
  <p class="video-title">영상 제목</p>            <!-- 제목 -->
  <span class="video-channel">채널명</span>       <!-- 채널명 -->
</div>
```

썸네일이 정상적으로 보이면 ID가 맞는 것입니다. 검은 화면만 보이면 ID를 다시 확인하세요.

---

## 추억 영구 저장 설정 (Supabase 연결)

현재는 더미 데이터 모드로 동작합니다. 아래 순서대로 설정하면 추억이 DB에 영구 저장됩니다.

### 1단계 — Supabase 프로젝트 생성

1. [supabase.com](https://supabase.com) 접속 후 GitHub 계정으로 로그인
2. **New project** 클릭 → 프로젝트 이름 입력 (예: `hansung-festival`) → Create

### 2단계 — 테이블 생성

좌측 메뉴에서 **SQL Editor → New query** → 아래 SQL 전체 복사 후 **Run**

```sql
create table memories (
  id         uuid        default gen_random_uuid() primary key,
  name       text        not null,
  year       text        not null,
  emoji      text        not null,
  text       text        not null,
  created_at timestamptz default now()
);

alter table memories enable row level security;

create policy "read all"
  on memories for select
  using (true);

create policy "insert all"
  on memories for insert
  with check (true);
```

### 3단계 — API 키 복사

**Settings → API** 메뉴에서 두 값을 복사합니다.

| 항목 | 형식 |
|---|---|
| Project URL | `https://xxxx.supabase.co` |
| anon / public 키 | `eyJhbGci...` 로 시작하는 긴 문자열 |

### 4단계 — script.js 상단 키 교체

```js
const SUPABASE_URL  = 'https://xxxx.supabase.co';  // ← Project URL로 교체
const SUPABASE_ANON = 'eyJhbGci...';               // ← anon 키로 교체
```

### 5단계 — 배포

```bash
git add script.js
git commit -m "connect supabase"
git push
```

`push` 후 1~2분 안에 Vercel이 자동 재배포합니다.

> **주의:** anon 키는 RLS 정책으로 보호되므로 공개되어도 안전합니다. `service_role` 키는 절대 코드에 넣지 마세요.

---

## 로컬 실행

```bash
# VS Code Live Server 확장 사용 권장
# 또는 index.html 더블클릭으로 바로 실행 가능
```

## Vercel 재배포

코드 수정 후 아래 명령만 실행하면 자동 재배포됩니다.

```bash
git add .
git commit -m "수정 내용"
git push
```
