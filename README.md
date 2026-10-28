# 게코 관리노트

크레스티드 게코 개체 등록, 무게·급여·탈피·배변 기록, 혈통도와 마인드맵, 브리딩(메이팅·산란·무정란·해칭), 분양 기록, QR 라벨을 휴대폰과 PC에서 함께 관리하는 웹앱입니다.

- 화면: GitHub Pages (이 저장소의 파일이 그대로 웹사이트가 됩니다)
- 데이터·사진·로그인: Supabase (무료 플랜)
- 로그인: 구글 계정
- 농장 단위 관리: 가족·직원을 초대해 함께 관리 (관리자 / 기록 담당 / 보기 전용)
- 혈통용 개체: 내 개체가 아닌 부모·조부모를 보유 목록과 섞이지 않게 등록해 혈통을 이음
- QR 공개 카드: 로그인 없이 사진·개체번호·이름·모프·성별을 보여 주고, 해칭일·혈통·브리더·무게·관리 기록·분양 정보·메모는 농장과 개체마다 공개 여부를 정함

## 처음 설치 순서

### 1. Supabase 데이터베이스 만들기
1. Supabase 관리 화면에서 프로젝트를 엽니다.
2. 왼쪽 메뉴 **SQL Editor → New query**를 엽니다.
3. 이 저장소의 `schema.sql` 내용을 전부 붙여 넣고 **Run**을 누릅니다.
   여러 번 실행해도 안전합니다. 1판에서 올릴 때도 같은 파일을 실행하면 기존 데이터가 '내 농장'으로 옮겨집니다.
   '위험한 작업(destructive operation)' 확인 창이 뜨면 기존 보안 규칙을 새 규칙으로 바꾸는 과정이므로 실행을 눌러 진행합니다.

### 2. 연결 정보 넣기
`config.js`에 Supabase의 **Project URL**과 **Publishable key**(`sb_publishable_…`)를 넣습니다.
이 두 값은 웹페이지에 넣도록 만들어진 공개용 값입니다. `sb_secret_…` 키나 데이터베이스 비밀번호는 절대 넣지 마세요.

### 3. 구글 로그인 연결
1. Supabase → **Authentication → Sign In / Providers → Google**을 엽니다. 화면에 보이는 **Callback URL**(`https://<프로젝트>.supabase.co/auth/v1/callback`)을 복사해 둡니다.
2. [Google Cloud 콘솔](https://console.cloud.google.com/)에서 새 프로젝트를 만듭니다.
3. **Google Auth Platform**에서 앱 정보를 입력합니다.
   - 앱 이름: 크레 개체 노트
   - 대상: 외부(External)
4. **대상(Audience)** 화면에서 게시 상태를 **테스트**로 둡니다. **테스트 사용자**에 이 앱을 쓸 구글 계정을 추가합니다.
   테스트 상태에서는 여기에 등록된 계정만 로그인할 수 있습니다.
5. **클라이언트(Clients) → 클라이언트 만들기**를 누르고 아래처럼 입력합니다.
   - 유형: 웹 애플리케이션
   - 승인된 JavaScript 원본: `https://<GitHub아이디>.github.io`
   - 승인된 리디렉션 URI: 1번에서 복사한 Callback URL
6. 만들어진 **클라이언트 ID**와 **클라이언트 보안 비밀번호**를 Supabase의 Google 설정 화면에 붙여 넣고 켠 뒤 저장합니다.
7. Supabase → **Authentication → URL Configuration**에서 아래처럼 입력합니다.
   - Site URL: `https://<GitHub아이디>.github.io/gecko-note/`
   - Redirect URLs: 같은 주소를 추가합니다.
8. 처음 로그인에 성공했다면, 다른 사람이 가입하지 못하도록 Supabase 인증 설정에서 **Allow new users to sign up**을 끕니다.

### 4. GitHub Pages 켜기
저장소 **Settings → Pages**에서 아래처럼 설정하고 저장합니다.
- Source: **Deploy from a branch**
- Branch: **main / (root)**

1~2분 뒤 `https://<GitHub아이디>.github.io/gecko-note/`에서 열립니다.

## 구성원 초대
1. 설정 → 구성원에서 권한을 고르고 **초대 링크 만들기**를 누릅니다.
2. '○○ 농장 초대장' 문구를 카카오톡 등으로 보냅니다. 7일 동안 한 번만 쓸 수 있습니다.
   카카오톡 안에서 열면 구글 로그인이 막혀 있어, 로그인 버튼을 누르면 휴대폰의 기본 브라우저로 넘어갑니다.
3. 구글 로그인이 '테스트' 상태라면, 받는 분의 구글 계정을 Google Cloud 콘솔 → Google Auth Platform → 대상 → 테스트 사용자에 먼저 추가합니다(최대 100명).

| 권한 | 할 수 있는 일 |
|---|---|
| 관리자 | 개체·브리딩·분양·설정·구성원까지 모두 |
| 기록 담당 | 무게·급여·탈피·배변·메모 기록 추가와 수정 |
| 보기 전용 | 보기만 |

## 휴대폰 홈 화면에 추가
- 아이폰(Safari): 공유 버튼 → **홈 화면에 추가**
- 안드로이드(Chrome): 메뉴 → **홈 화면에 추가** 또는 **앱 설치**

## Supabase 무료 플랜 일시정지
- 7일 동안 사용이 적으면 프로젝트가 일시정지됩니다. 정지 전에 경고 메일이 옵니다.
- 데이터는 지워지지 않습니다. Supabase 관리 화면에서 프로젝트를 고르고 **Resume project**를 누르면 그대로 돌아옵니다.
- 일시정지 후 1년까지 이렇게 복구할 수 있습니다.
- 만일을 대비해 앱의 **설정 → 전체 데이터 백업 내려받기**로 가끔 백업 파일을 받아 두세요.

## 파일 구성
| 파일 | 내용 |
|---|---|
| `index.html` | 화면 뼈대 |
| `style.css` | 디자인 |
| `app.js` | 기능 전체 (목록, 개체 화면, 기록, 혈통, 마인드맵, 브리딩, 분양, QR) |
| `config.js` | Supabase 연결 정보 |
| `schema.sql` | 데이터베이스 구조와 보안 규칙 |
| `manifest.webmanifest`, `icons/` | 홈 화면 앱 설정과 아이콘 |
| `vendor/` | 함께 포함한 라이브러리: supabase-js 2.117.3, qrcode-generator 1.4.4 (둘 다 MIT 라이선스) |
