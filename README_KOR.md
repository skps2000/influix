# Cloudflare Workers에서 React + Vite + PostgreSQL + Hyperdrive

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/templates/tree/main/react-postgres-fullstack-template)

![Cloudflare Workers Assets, Hono, Hyperdrive를 사용하여 책 라이브러리 구축](https://imagedelivery.net/wSMYJvS3Xw-n339CbDyDIA/cd71c67a-253f-477d-022c-2f90cb4b3d00/public)

<!-- dash-content-start -->

[Cloudflare Workers Assets](https://developers.cloudflare.com/workers/static-assets/), Hono API 라우트, [Cloudflare Hyperdrive](https://developers.cloudflare.com/hyperdrive/)를 사용하여 PostgreSQL 데이터베이스에 연결하는 책 라이브러리를 구축하세요. [Workers Smart Placement](https://developers.cloudflare.com/workers/configuration/smart-placement/)가 활성화되어 데이터베이스에 가까운 위치에 Worker를 자동으로 배치하여 지연 시간을 줄입니다.

이 애플리케이션에서 분류된 책 컬렉션을 탐색하세요. 제목에 대해 더 알아보려면 클릭하여 확장된 보기로 이동하세요. 컬렉션은 장르로 필터링할 수도 있습니다. 사용자 정의 데이터베이스 연결이 제공되지 않으면 대체 책 세트가 사용됩니다.

개인 데이터베이스를 생성하는 경우 책은 다음 형식으로 저장되어야 합니다:

```sql
(INDEX, 'BOOK_TITLE', 'BOOK_AUTHOR', 'BOOK_DESCRIPTION', '/images/books/BOOK_COVER_IMAGE.jpg', 'BOOK_GENRE')
```

## 기능

- 📖 동적 라우트
- 📦 자산 번들링 및 최적화
- 🌐 최적화된 Worker 배치
- 🚀 Hyperdrive를 통한 데이터베이스 연결
- 🎉 스타일링을 위한 TailwindCSS
- 🐳 컨테이너 관리를 위한 Docker

## Smart Placement 혜택

이 애플리케이션은 Cloudflare Workers의 [Smart Placement](https://developers.cloudflare.com/workers/configuration/smart-placement/) 기능을 사용하여 성능을 최적화합니다.

- **Smart Placement이란 무엇인가?** Smart Placement은 [동적으로 Worker를 배치](https://developers.cloudflare.com/workers/configuration/smart-placement/#understand-how-smart-placement-works)하여 Worker와 데이터베이스 간의 지연 시간을 최소화할 수 있습니다.

- **어떻게 작동하나?** 애플리케이션은 요청당 여러 데이터베이스 왕복을 수행합니다. Smart Placement은 이 트래픽 패턴을 분석하고 Worker와 Hyperdrive를 배포된 데이터베이스에 더 가깝게 배치하여 지연 시간을 줄일 수 있습니다. 이는 특히 여러 데이터베이스 쿼리가 필요한 읽기 집약적 작업에서 응답 시간을 크게 개선할 수 있습니다 — 이 애플리케이션의 책 관련 API 엔드포인트에서 입증됩니다.

- **구성 필요 없음:** `wrangler.jsonc`에서 `"mode": "smart"`로 활성화하면 Smart Placement이 자동으로 작동합니다.

<!-- dash-content-end -->

## 기술 스택

- **프론트엔드**: 클라이언트 측 탐색을 위한 React + React Router [선언적 라우팅 사용](https://reactrouter.com/en/main/start/overview)
  - Vite로 구축되고 Workers를 통해 정적 자산으로 배포
  - 클라이언트 측 탐색을 위한 `wrangler.jsonc`에서 React SPA 모드 활성화

- **백엔드**: [Hono](https://hono.dev/)를 사용하는 Worker가 제공하는 API 라우트
  - `/api/routes` 디렉토리에 정의된 API 엔드포인트
  - 데이터베이스를 사용할 수 없을 때 자동으로 모의 데이터로 폴백

- **데이터베이스**: Cloudflare Hyperdrive를 통해 연결된 PostgreSQL 데이터베이스
  - 최적의 성능을 위한 Smart Placement 활성화
  - 누락된 연결 문자열 또는 연결 실패 처리

## 시작하기

애플리케이션을 로컬에서 실행하려면 `docker-compose.yml`에 정의된 Docker 컨테이너를 사용하세요:

1. `docker-compose up -d`
   - `init.sql`에 있는 데이터로 PostgreSQL이 포함된 컨테이너 생성 및 시드
2. `npm run dev`

`init.sql`을 업데이트하면 이전 이미지를 해체하기 위해 `docker-compose down -v`를 실행해야 합니다.

### Hyperdrive 바인딩 설정

Cloudflare의 Hyperdrive는 연결 문자열을 사용하여 Workers에서 다양한 데이터베이스 공급자로의 쿼리를 최적화하는 데이터베이스 커넥터입니다. 설정 방법에 대한 자세한 설명은 다음과 같습니다:

1. **Hyperdrive 구성 생성**:

   ```sh
   npx wrangler hyperdrive create my-hyperdrive-config --connection-string="postgres://user:password@hostname:port/dbname"
   ```

   이 명령은 구성에 필요한 Hyperdrive ID를 반환합니다.

2. **wrangler.jsonc에서 Hyperdrive 구성**:

   ```json
   "hyperdrive": [
     {
       "binding": "HYPERDRIVE",  // 코드에서 바인딩에 액세스하는 데 사용되는 이름
       "id": "YOUR_HYPERDRIVE_ID",  // 생성 명령의 ID
       "localConnectionString": "postgresql://myuser:mypassword@localhost:5432/mydatabase"  // 로컬 개발 연결
     }
   ]
   ```

3. **코드에서 액세스**:

   ```javascript
   // 이 프로젝트의 예시
   if (c.env.HYPERDRIVE) {
   	const sql = postgres(c.env.HYPERDRIVE.connectionString);
   	// SQL 클라이언트 사용
   }
   ```

4. **폴백 처리**: 이 애플리케이션은 다음 경우 자동으로 모의 데이터로 폴백합니다:
   - Hyperdrive 바인딩이 구성되지 않은 경우
   - 어떤 이유로 데이터베이스 연결이 실패한 경우

더 자세한 walkthrough는 [Hyperdrive 문서](https://developers.cloudflare.com/hyperdrive/configuration/connect-to-postgres/)를 참조하세요.

### 로컬 개발에서 Docker의 사용에 대한 추가 정보

Hyperdrive로 로컬 개발 시 제공된 Docker 설정을 **반드시** 사용해야 합니다. 이는 Hyperdrive의 로컬 개발 모드가 `localConnectionString`에 지정된 정확한 구성으로 localhost에서 실행되는 데이터베이스를 요구하기 때문입니다.

이 템플릿의 Docker 설정은 PostgreSQL 인스턴스가 Hyperdrive와 로컬에서 제대로 작동하도록 보장합니다. 컨테이너는 자동으로 `init.sql`을 실행하여 테이블을 생성하고 샘플 데이터를 로드합니다.

현재 Hyperdrive로 로컬 개발에서 원격 데이터베이스 사용은 지원되지 않지만 작업 중입니다.

## 배포 방법

이 애플리케이션을 배포하는 두 가지 방법이 있습니다: 전체 경험과 데모 모드.

### 옵션 1: 데이터베이스와 함께 (전체 경험)

1. `npm i` 실행
2. PostgreSQL 공급자에 가입하고 데이터베이스 생성
   - 빠른 시작 옵션: [Supabase](https://supabase.com/), [Neon](https://neon.tech/)
3. 제공된 SQL 스크립트를 사용하여 샘플 데이터 로드:
   - `/init.sql` 파일에는 모든 데이터베이스 스키마와 샘플 데이터가 포함되어 있습니다
   - 다음 중 하나를 수행할 수 있습니다:
     - 데이터베이스 공급자의 SQL 편집기에 내용을 복사하여 붙여넣기
     - 또는 `psql`과 같은 명령줄 도구 사용: `psql -h hostname -U username -d dbname -f init.sql`
4. 다음을 실행하여 Hyperdrive 연결 생성:
   ```sh
   npx wrangler hyperdrive create <YOUR_CONFIG_NAME> --connection-string="<postgres://user:password@HOSTNAME_OR_IP_ADDRESS:PORT/database_name>"
   ```
5. 4단계의 ID로 `wrangler.jsonc`에서 Hyperdrive 바인딩을 주석 해제하고 업데이트:
   ```json
   "hyperdrive": [
     {
       "binding": "HYPERDRIVE",
       "id": "YOUR_HYPERDRIVE_ID",
       "localConnectionString": "postgresql://myuser:mypassword@localhost:5432/mydatabase"
     }
   ]
   ```
6. `npm run deploy`로 배포

### 옵션 2: 데이터베이스 없이 (데모 모드)

1. `npm i` 실행
2. `wrangler.jsonc`에서 Hyperdrive 바인딩을 주석 처리된 상태로 유지 (기본값)
3. `npm run deploy`로 배포
4. 앱은 실제 데이터베이스 대신 자동으로 모의 데이터를 사용합니다

## 리소스

- [Cloudflare Workers 및 Hyperdrive와 함께 Neon PostgreSQL](https://developers.cloudflare.com/hyperdrive/examples/neon/)
- [Cloudflare Vite 플러그인](https://www.npmjs.com/package/@cloudflare/vite-plugin)
- [Cloudflare Hyperdrive 문서](https://developers.cloudflare.com/hyperdrive/get-started/)
- [Cloudflare Workers를 위한 빠르고 가벼운 웹 프레임워크 Hono](https://hono.dev/docs/getting-started/cloudflare-workers)
- [Workers Smart Placement](https://developers.cloudflare.com/workers/configuration/smart-placement/)