# 한성대학교 축제 아카이브

한성대학교 대동제의 역사를 시각화하고, 학생들이 직접 추억을 남길 수 있는 참여형 아카이브 웹사이트입니다.

**배포 주소:** https://hansung-festival.vercel.app

---

## 주요 기능

### 축제 역사 타임라인
- 1996년 1회 대동제부터 현재까지의 역사를 좌우 교차 카드 형식으로 시각화
- 연도대별 필터 버튼 (전체 / 2000년대 / 2010년대 / 2020년대)
- 각 카드에 연도, 제목, 설명, 태그 표시

### 갤러리
- 역대 축제 사진을 그리드 레이아웃으로 표시
- 마우스 오버 시 연도·설명 오버레이 표시

### 추억 남기기 (참여형)
- 이름(닉네임), 참여 연도, 한 줄 추억, 기분 태그 입력
- 등록된 추억은 최신순으로 오른쪽 벽에 실시간 반영
- **Supabase 연결 전:** 더미 데이터로 미리보기 상태로 동작 (새로고침 시 초기화)
- **Supabase 연결 후:** DB에 영구 저장, 모든 기기에서 공유

### 공연 아카이브
- 역대 공연팀·행사명·특이사항을 테이블로 정리
- 연도, 공연팀, 행사명으로 실시간 검색 가능
- 규모별 색상 뱃지 (대형·중형·소형)

### UI/UX
- 다크 테마, 반응형 레이아웃 (모바일 대응)
- 섹션 진입 시 숫자 카운트업 애니메이션
- 스크롤 시 요소 페이드인 애니메이션
- 햄버거 메뉴 (모바일)

---

## 파일 구조

```
hansung-festival/
├── index.html   # 페이지 구조 및 마크업
├── style.css    # 스타일 (다크 테마, 반응형)
├── script.js    # 동작 로직, Supabase 연동
└── README.md
```

---

## 추억 영구 저장 설정 (Supabase 연결)

현재는 더미 데이터 모드로 동작합니다. 아래 순서대로 설정하면 추억이 DB에 영구 저장됩니다.

### 1단계 — Supabase 프로젝트 생성

1. [supabase.com](https://supabase.com) 접속 후 GitHub 계정으로 로그인
2. **New project** 클릭 → 프로젝트 이름 입력 (예: `hansung-festival`) → Create

### 2단계 — 테이블 생성

좌측 메뉴에서 **SQL Editor** → **New query** → 아래 SQL 전체 복사 후 **Run**

```sql
-- 추억 저장 테이블 생성
create table memories (
  id         uuid        default gen_random_uuid() primary key,
  name       text        not null,
  year       text        not null,
  emoji      text        not null,
  text       text        not null,
  created_at timestamptz default now()
);

-- 행 수준 보안 활성화 (RLS)
alter table memories enable row level security;

-- 누구나 읽기 허용
create policy "read all"
  on memories for select
  using (true);

-- 누구나 쓰기 허용
create policy "insert all"
  on memories for insert
  with check (true);
```

### 3단계 — API 키 복사

**Settings → API** 메뉴에서 두 값을 복사합니다.

| 항목 | 위치 |
|---|---|
| Project URL | `https://xxxx.supabase.co` 형식 |
| anon / public 키 | `eyJhbGci...` 로 시작하는 긴 문자열 |

### 4단계 — script.js 상단 키 교체

```js
// script.js 2~3번째 줄
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

> **주의:** anon 키는 공개되어도 RLS 정책으로 보호되므로 안전합니다. 단, service_role 키는 절대 코드에 넣지 마세요.

---

## 로컬 실행

별도의 빌드 과정 없이 `index.html`을 브라우저에서 바로 열면 됩니다.

```bash
# VS Code Live Server 확장 사용 권장
# 또는 단순히 index.html 더블클릭
```

---

## Vercel 재배포 (코드 수정 후)

```bash
git add .
git commit -m "수정 내용"
git push
```

push만 하면 Vercel이 자동으로 재배포합니다.

---

## 데이터 수정 방법

| 수정 항목 | 파일 | 위치 |
|---|---|---|
| 타임라인 내용 | `script.js` | `TIMELINE_DATA` 배열 |
| 공연 아카이브 | `script.js` | `ARCHIVE_DATA` 배열 |
| 더미 추억 데이터 | `script.js` | `DUMMY_MEMORIES` 배열 |
| 갤러리 이미지/설명 | `index.html` | `gallery-grid` 섹션 |
| 통계 숫자 | `index.html` | `data-target` 속성 값 |
