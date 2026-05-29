# 한성대 대동제 타임라인

한성대학교 대동제의 역사를 디지털로 기록한 타임라인 시각화 프로젝트입니다.

배포 주소: https://hansung-festival-omega.vercel.app

공식 유튜브: https://www.youtube.com/user/HansungUvi

## 웹페이지 구성

| 섹션 | 설명 |
|---|---|
| 홈 화면 | 타이틀과 파티클 애니메이션을 표시합니다 |
| 타임라인 | 1996년 1회 대동제부터 현재까지의 연도별 역사를 보여줍니다 |
| 유튜브 | 한성대 공식 유튜브 영상을 인라인으로 재생합니다 |
| 댓글 | 재학생과 졸업생이 축제 기억을 직접 등록하고 공유합니다 |

## 섹션별 사용 방법

### 홈 화면

상단 고정 내비바(타임라인, 유튜브, 댓글)로 각 섹션에 바로 이동합니다. 모바일에서는 우측 상단 햄버거 메뉴(☰)를 사용합니다.

### 타임라인

Knight Lab TimelineJS 임베드로 연도별 역사 카드를 표시합니다. 1996년 제1회 대동제부터 현재까지 수록되어 있습니다.

### 유튜브

썸네일의 재생 버튼을 클릭하면 유튜브 이동 없이 페이지 내에서 바로 재생됩니다. 더 많은 영상은 하단 채널 링크를 통해 확인할 수 있습니다.

### 댓글

이름(닉네임)과 축제 연도를 입력하고, 최대 100자의 한 줄 추억과 기분 태그를 선택한 뒤 등록합니다. Supabase 연결 시 DB에 영구 저장되어 모든 기기에서 공유됩니다.

## 파일 구조

```
hansung-festival/
├── app/
│   ├── layout.tsx       HTML 골격과 Google Fonts 로드
│   ├── page.tsx         섹션 조합 서버 컴포넌트
│   └── globals.css      전체 스타일
├── components/
│   ├── Nav.tsx          내비게이션 컴포넌트
│   ├── Hero.tsx         히어로 섹션 컴포넌트
│   ├── Timeline.tsx     타임라인 임베드 컴포넌트
│   ├── Videos.tsx       유튜브 영상 컴포넌트
│   ├── Memory.tsx       댓글 컴포넌트
│   └── Footer.tsx       푸터 컴포넌트
├── lib/
│   ├── data.ts          정적 데이터 모음
│   └── supabase.ts      Supabase 클라이언트
├── vercel.json
├── next.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

## 주요 컴포넌트 로직

### Supabase 연결

`lib/supabase.ts`에서 SUPABASE_URL이 https로 시작하면 클라이언트를 초기화합니다. null이면 Memory 컴포넌트가 빈 배열로 폴백 처리합니다.

### 타임라인 렌더링

`lib/data.ts`의 TIMELINE_EMBED_URL을 서버 컴포넌트에서 iframe에 직접 주입합니다. Knight Lab TimelineJS CDN 임베드 방식을 사용합니다.

### 댓글 저장 흐름

폼을 제출하면 Supabase에 INSERT 후 loadMemories()를 재호출해 상태를 업데이트합니다. JSX가 자동으로 XSS를 방지하므로 별도 이스케이프 처리가 필요 없습니다.

### 캔버스 파티클

Hero 컴포넌트에서 90개의 파티클을 requestAnimationFrame 루프로 애니메이션합니다. 컴포넌트 언마운트 시 cancelAnimationFrame으로 루프를 정리합니다.

### 유튜브 인라인 재생

useState로 playing 비디오 ID를 관리합니다. 썸네일 클릭 시 해당 ID를 playing 상태로 설정하고 iframe으로 교체합니다.

## 데이터 수정 방법

| 수정 항목 | 파일 | 위치 |
|---|---|---|
| 타임라인 URL | `lib/data.ts` | `TIMELINE_EMBED_URL` |
| 영상 목록 | `lib/data.ts` | `VIDEO_DATA` 배열 |
| Supabase 연결 정보 | `lib/supabase.ts` | `SUPABASE_URL`, `SUPABASE_ANON` |
| 전체 스타일 | `app/globals.css` | CSS 변수 및 각 섹션 스타일 |

## 영상 유튜브 ID 교체 방법

`lib/data.ts`의 `VIDEO_DATA` 배열에서 교체합니다.

유튜브 URL에서 ID를 복사합니다.

```
https://www.youtube.com/watch?v=ABC123xyz
                                 ↑ 이 부분이 video ID
```

`lib/data.ts`를 수정합니다.

```ts
export const VIDEO_DATA = [
  {
    id: 'ABC123xyz',
    year: '2025',
    title: '영상 제목',
    channel: '한성대학교 공식 유튜브',
  },
];
```

썸네일은 `https://img.youtube.com/vi/{id}/maxresdefault.jpg` 형식으로 자동 표시됩니다.

## 댓글 영구 저장 설정 (Supabase 연결)

### 1단계: Supabase 프로젝트 생성

[supabase.com](https://supabase.com)에 접속해 GitHub 계정으로 로그인한 뒤 New project를 클릭합니다.

### 2단계: 테이블 생성

SQL Editor에서 아래 SQL을 실행합니다.

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

### 3단계: API 키 복사

Settings > API 메뉴에서 Project URL과 anon/public 키를 복사합니다.

### 4단계: `lib/supabase.ts` 키 교체

```ts
const SUPABASE_URL = 'https://xxxx.supabase.co';
const SUPABASE_ANON = 'eyJhbGci...';
```

### 5단계: 배포

```bash
git add lib/supabase.ts
git commit -m "Supabase 연결"
git push
```

push 후 1~2분 안에 Vercel이 자동 재배포합니다. anon 키는 RLS 정책으로 보호되므로 공개되어도 안전합니다. service_role 키는 절대 코드에 넣지 않습니다.

## 로컬 실행

```bash
npm install
npm run dev
```

http://localhost:3000 에서 확인합니다.

## Vercel 재배포

코드를 수정한 뒤 아래 명령을 실행하면 자동으로 재배포됩니다.

```bash
git add .
git commit -m "수정 내용"
git push
```
