# Catchu Luxury Community MVP

Catchu Luxury Community는 명품 애호가를 위한 모바일 커뮤니티 MVP입니다. 회원은 선호 브랜드 기반 피드에서 신상품 소식, 코디, 리셀 인사이트를 공유하고 이미지와 함께 상세 후기를 남길 수 있으며, 댓글은 `#진품추정`, `#리셀시세` 등의 톤 태그로 분류됩니다.

## 주요 기능
- 이메일 회원가입/로그인, 선호 브랜드 선택 후 프로필 저장
- 피드: 브랜드/카테고리 필터, 카드형 목록, 상세 페이지 이동
- 게시글: 최대 5장 이미지 업로드, 태그 선택, Firestore 저장
- 댓글: 실시간 갱신, 톤 태그 선택, 커뮤니티 인사이트 강조
- 프리미엄 감성 UI: 다크 베이지 & 골드 톤, 라운드 카드, 플로팅 작성 버튼

## 기술 스택
- **React Native (Expo 54)** with **Expo Router**
- **Firebase** Auth / Cloud Firestore / Storage
- TypeScript, React Hooks 기반 상태 관리
- Expo Image Picker & File System for media handling

## 프로젝트 구조
```
app/
  (auth)/        # 로그인/회원가입 스택
  (app)/         # 보호된 스택 (피드, 상세, 작성)
    post/
constants/       # 브랜드/카테고리 상수
src/
  components/ui  # 재사용 UI 요소(Button, Screen 등)
  features/      # posts, comments 도메인 API
  hooks/         # 커스텀 훅 (auth, posts, comments)
  lib/           # Firebase 초기화
  providers/     # AuthProvider
```

## 시작하기
1. 의존성 설치
   ```bash
   npm install
   ```
2. 환경 변수 설정
   ```bash
   cp .env.example .env
   # 실제 Firebase Web App 설정 값으로 채워넣기
   ```
3. Expo 개발 서버 실행
   ```bash
   npm run start
   ```
   Expo Go 앱 또는 시뮬레이터에서 QR 코드를 스캔하여 앱을 확인할 수 있습니다.

## Firebase 설정 안내
- **Authentication**: Email/Password 제공자 활성화
- **Firestore 규칙** (개발용):
  ```
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /posts/{postId} {
        allow read: if true;
        allow create: if request.auth != null;
      }
      match /posts/{postId}/comments/{commentId} {
        allow read: if true;
        allow create: if request.auth != null;
      }
      match /users/{userId} {
        allow read: if request.auth != null;
        allow create, update: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
  ```
- **Storage 규칙** (개발용):
  ```
  rules_version = '2';
  service firebase.storage {
    match /b/{bucket}/o {
      match /posts/{userId}/{allPaths=**} {
        allow read;
        allow write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
  ```

## 시연 시나리오 제안
1. 회원가입: 이름/이메일 입력, 선호 브랜드 선택
2. 피드 탐색: 브랜드 필터 적용, 상세 화면 이동
3. 게시글 작성: 이미지 첨부, 태그 지정 후 업로드
4. 상세 화면: 이미지 캐러셀, 카테고리/태그 표시
5. 댓글 작성: `#진품추정` 등 톤 태그 선택 후 등록

## 향후 확장 아이디어
- 실시간 알림(신상품 드랍, 인증 결과)
- 리셀가 차트, 시세 API 연동
- 명품 감정 프로세스 연동(전문가 태깅)
- 오프라인 이벤트/팝업 스토어 캘린더

Catchu 브랜드 아이덴티티에 맞춘 프리미엄 UX를 강조했으며, 실무 연계를 위한 데이터 모델 확장 포인트를 명시했습니다.
