# KSIS GitHub 로그인 연결 준비

현재 상태: 코드 준비. GitHub OAuth 등록·Vercel 환경변수·실제 로그인·공개 배포는 미검증.

## 운영진이 한 번 설정할 것

rebornsenior GitHub 계정에서 Settings → Developer settings → OAuth Apps → New OAuth App.

- Application name: KSIS 관리자 글쓰기
- Homepage URL: https://www.rebornsenior.com
- Authorization callback URL: https://www.rebornsenior.com/api/callback

등록 후 Client ID와 Client Secret을 Vercel ksis 프로젝트의 Environment Variables에 입력.
비밀값은 채팅·캡처·GitHub 파일에 넣지 않음.

- GITHUB_OAUTH_CLIENT_ID: 등록 화면의 Client ID
- GITHUB_OAUTH_CLIENT_SECRET: 생성한 Client Secret (서버용)
- CMS_SITE_URL: https://www.rebornsenior.com

환경변수 적용 대상은 Production. 변수 등록만으로 현재 배포가 바뀌지는 않으며 이후 새 배포 필요.

## 동작

관리자 주소: https://www.rebornsenior.com/admin/
개인 GitHub 계정 로그인 → KSIS 쓰기 권한 확인 → 초안 저장 → 검토 → 공개 게시 → Vercel 배포.

코드는 GitHub OAuth public_repo 권한을 요청함. 이 권한은 KSIS 하나에만 한정된 권한이 아니라
로그인 사용자가 권한을 가진 공개 저장소에 적용됨. 관리자 설정은 KSIS를 대상으로 하지만
기술적으로 다른 공개 저장소 접근까지 차단하는 장치는 아님. 현재 기본 GitHub backend의 한계.
또한 협업자에게 홈페이지 코드 변경 권한도 있음. 최종 인계 전에 이 제한을 다시 확인해야 함.

## 검증 필요

- OAuth 시작과 콜백 실계정 시험 (로컬 모의 검사는 실계정 검증이 아님).
- 초안 저장이 공개 main에 반영되지 않는지.
- 작성자 HayoungCH00I 게시가 무료 Vercel에서 자동 배포되는지.
- 공개 저장소 초안/사진의 열람 가능성 및 미리보기 배포 공개 범위.
- 파일 교체 안전 삭제, 사진 번호 규칙은 아직 별도 구현 필요.

## 로컬 폴더

이 Codex 폴더에는 .git 연결 정보가 없음. GitHub Desktop의 Repository → Show in Explorer에서
실제 checkout 경로를 확인하고, 내용 비교 후 필요한 변경만 반영할 것.
node_modules, dist, .codex-runtime, 비밀 환경변수 파일은 전송하지 않음.
