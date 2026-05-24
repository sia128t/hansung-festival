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
| 역사 (Timeline) | TimelineJS/CSV/JSON 데이터를 자체 전시형 UI로 렌더링하는 몰입형 타임라인 |
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
- `script.js`의 `TIMELINE_SOURCE_URL` 또는 `?timeline=...` URL 파라미터를 데이터 소스로 사용
- TimelineJS embed URL, Google Sheets CSV URL, JSON URL을 자동 파싱해 자체 전시형 UI로 렌더링
- 슬라이드, 배경, 하단 연도 축, 이전/다음 버튼, 진행 바가 데이터 개수에 맞춰 자동 생성됨
- 키보드 방향키, 마우스 휠/트랙패드, 모바일 스와이프 이동 지원

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

#### 2. 데이터 기반 타임라인 엔진 (initTimeline)
```
TIMELINE_SOURCE_URL 또는 ?timeline=...
└─ TimelineJS embed URL이면 source 파라미터 추출
   └─ source=v2:2PACX... 값을 Google Sheets CSV URL로 변환
      └─ CSV/JSON 로드 → normalizeTimelineItems()
         └─ slides, backgrounds, media, year markers, progress 자동 생성
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
└─ .stat-item, .immersive-timeline, .archive-table tbody tr 대상
   └─ 뷰포트 진입 시 opacity: 0→1, translateY: 20px→0
      (DOMContentLoaded 후 100ms 딜레이로 실행 — 초기 레이아웃 계산 완료 대기)
```

---

## 데이터 수정 방법

| 수정 항목 | 파일 | 위치 |
|---|---|---|
| 타임라인 기본 데이터 URL | `script.js` | `TIMELINE_SOURCE_URL` |
| 타임라인 예비 데이터 | `script.js` | `TIMELINE_FALLBACK_ITEMS` |
| 타임라인 디자인 | `style.css` | `/* ===== TIMELINE ===== */` |
| 공연 아카이브 | `script.js` | `ARCHIVE_DATA` 배열 |
| 임시 추억 데이터 | `script.js` | `localMemories` 배열 |
| 통계 숫자 | `index.html` | `data-target` 속성 값 |
| 영상 유튜브 ID | `index.html` | `<!-- VIDEOS -->` 섹션 |

---

## TimelineJS / JSON 타임라인 링크 교체 방법

현재 타임라인은 HTML을 복붙하지 않고, 외부 데이터 URL을 읽어서 자체 전시형 UI를 자동 생성합니다. `script.js` 상단의 `TIMELINE_SOURCE_URL`만 바꾸거나, 주소창에 `?timeline=...` 파라미터를 넘기면 다른 타임라인 데이터를 같은 디자인으로 렌더링합니다.

### 현재 설정 위치

```js
const TIMELINE_SOURCE_URL = 'https://cdn.knightlab.com/libs/timeline3/latest/embed/index.html?source=v2%3A2PACX-1vSgxNocGPPR4-FJAuYL18lWh49O9oCSr6jn4WjSvx9W_Z4e74eEvZX2VEV0Y3gI1x3MbkNytZd9WUd-&font=Default&lang=en&initial_zoom=2&width=100%25&height=650';
```

### 전체 링크를 교체하는 방법

Knight Lab에서 새로 발급받은 embed 링크 전체를 `TIMELINE_SOURCE_URL` 문자열에 그대로 붙여 넣으면 됩니다.

```js
const TIMELINE_SOURCE_URL = '새 TimelineJS embed 링크 전체';
```

이 방식이 가장 안전합니다. URL 안의 `source` 값은 길고 인코딩되어 있어서 일부만 복사하면 타임라인이 로드되지 않을 수 있습니다. 내부적으로는 `source=v2:2PACX...` 값을 추출해 아래 형태의 Google Sheets CSV URL로 변환합니다.

```text
https://docs.google.com/spreadsheets/d/e/2PACX-.../pub?output=csv
```

### 코드 수정 없이 링크를 테스트하는 방법

브라우저 주소 뒤에 `timeline` 파라미터를 붙이면 `TIMELINE_SOURCE_URL`보다 우선 적용됩니다. 전체 URL은 반드시 `encodeURIComponent` 방식으로 인코딩해야 `&font=...` 같은 파라미터가 잘리지 않습니다.

```text
index.html?timeline=https%3A%2F%2Fcdn.knightlab.com%2Flibs%2Ftimeline3%2Flatest%2Fembed%2Findex.html%3Fsource%3Dv2%253A2PACX-...%26font%3DDefault%26lang%3Dko%26initial_zoom%3D2%26width%3D100%2525%26height%3D650
```

운영 반영 전 새 타임라인 링크를 빠르게 확인할 때 이 방식을 쓰면 됩니다.

### URL에서 특히 바꾸는 부분

예시 URL:

```text
https://cdn.knightlab.com/libs/timeline3/latest/embed/index.html?source=v2%3A2PACX-...&font=Default&lang=en&initial_zoom=2&width=100%25&height=650
```

| 파라미터 | 역할 | 바꾸는 경우 |
|---|---|---|
| `source=...` | 실제 데이터 원본. 이 프로젝트에서 가장 중요하게 읽는 값 | 다른 스프레드시트/타임라인으로 바꿀 때 |
| `font=Default` | TimelineJS 기본 iframe용 폰트 옵션 | 현재 자체 렌더링에서는 사용하지 않음 |
| `lang=en` | TimelineJS 기본 iframe용 UI 언어 옵션 | 현재 자체 렌더링에서는 거의 영향 없음 |
| `initial_zoom=2` | TimelineJS 기본 iframe용 초기 확대 옵션 | 현재 자체 렌더링에서는 사용하지 않음 |
| `width=100%25` | TimelineJS 기본 iframe용 너비 옵션 | 현재 자체 렌더링에서는 사용하지 않음 |
| `height=650` | TimelineJS 기본 iframe용 높이 옵션 | 현재 자체 렌더링에서는 사용하지 않음 |

즉, 지금 구조에서 타임라인 내용을 바꾸는 핵심은 `source=...`입니다. 나머지 파라미터는 Knight Lab 원본 iframe에서는 의미가 있지만, 이 프로젝트의 커스텀 렌더러에서는 데이터 로딩에 직접 쓰지 않습니다.

### JSON 데이터도 사용 가능

`TIMELINE_SOURCE_URL`에는 JSON 파일 URL도 넣을 수 있습니다. 배열 또는 `{ "items": [...] }`, `{ "events": [...] }` 형태를 지원합니다.

```json
[
  {
    "year": "2024",
    "title": "대동제 행사 진행",
    "description": "현재 프로젝트의 타임라인 내용을 전시형 슬라이드로 표시",
    "background": "https://example.com/background.jpg",
    "thumbnail": "https://example.com/thumb.jpg",
    "mood": "축제"
  }
]
```

지원 필드:

| 필드 | 설명 |
|---|---|
| `title` 또는 `headline` | 슬라이드 제목 |
| `year` 또는 `startYear` | 하단 축과 큰 연도 텍스트 |
| `date` | 보조 날짜 텍스트 |
| `description`, `desc`, `text` | 본문 설명 |
| `background`, `backgroundImage` | 풀스크린 배경 이미지 |
| `image`, `media` | 배경 대체 이미지 또는 보조 이미지 |
| `thumbnail`, `thumb` | 오른쪽 보조 미디어 이미지 |
| `mood`, `theme`, `group` | 감정/시대 분위기. 색상과 라벨에 반영 |

### TimelineJS 원본 데이터 수정 흐름

1. Google Sheets에서 TimelineJS 데이터 수정
2. 시트를 웹에 게시 또는 기존 게시 상태 유지
3. 같은 `source`를 쓰면 사이트는 새로고침 시 수정된 내용을 불러옴
4. 다른 시트를 쓰려면 Knight Lab에서 새 embed URL을 만들고 `TIMELINE_SOURCE_URL` 전체를 교체

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
