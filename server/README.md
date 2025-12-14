# Shopping Mall Server

Node.js + Express + Azure CosmosDB 기반 쇼핑몰 백엔드 서버

## 기술 스택

- Node.js
- Express.js
- Azure CosmosDB
- CORS
- dotenv

## 프로젝트 구조

```
server/
├── config/
│   └── cosmosdb.js          # CosmosDB 연결 설정
├── routes/
│   ├── products.js          # 상품 관련 라우트
│   ├── users.js             # 사용자 관련 라우트
│   └── orders.js            # 주문 관련 라우트
├── server.js                # 서버 진입점
├── package.json
├── .env.example             # 환경변수 예시
└── README.md
```

## 설치 방법

1. 의존성 패키지 설치:
```bash
cd server
npm install
```

2. 환경변수 설정:
```bash
# .env.example 파일을 .env로 복사
cp .env.example .env

# .env 파일을 열어서 실제 값으로 수정
# - COSMOS_ENDPOINT: Azure CosmosDB 엔드포인트 URL
# - COSMOS_KEY: Azure CosmosDB 기본 키
# - COSMOS_DATABASE_ID: 사용할 데이터베이스 이름 (기본값: ShoppingMallDB)
```

3. 서버 실행:
```bash
# 프로덕션 모드
npm start

# 개발 모드 (nodemon 사용)
npm run dev
```

## API 엔드포인트

### Health Check
- `GET /health` - 서버 상태 확인

### Products (상품)
- `GET /api/products` - 모든 상품 조회
- `GET /api/products/:id?category=:category` - 특정 상품 조회
- `POST /api/products` - 새 상품 생성
- `PUT /api/products/:id` - 상품 수정
- `DELETE /api/products/:id?category=:category` - 상품 삭제

### Users (사용자)
- `GET /api/users` - 모든 사용자 조회
- `GET /api/users/:id?email=:email` - 특정 사용자 조회
- `POST /api/users` - 새 사용자 생성
- `PUT /api/users/:id` - 사용자 정보 수정
- `DELETE /api/users/:id?email=:email` - 사용자 삭제

### Orders (주문)
- `GET /api/orders` - 모든 주문 조회
- `GET /api/orders/:id?userId=:userId` - 특정 주문 조회
- `GET /api/orders/user/:userId` - 특정 사용자의 모든 주문 조회
- `POST /api/orders` - 새 주문 생성
- `PUT /api/orders/:id` - 주문 상태 수정
- `DELETE /api/orders/:id?userId=:userId` - 주문 삭제

## CosmosDB 컨테이너 구조

서버 시작 시 자동으로 생성되는 컨테이너:

1. **Products** (파티션 키: `/category`)
   - 상품 정보 저장

2. **Users** (파티션 키: `/email`)
   - 사용자 정보 저장

3. **Orders** (파티션 키: `/userId`)
   - 주문 정보 저장

## 주의사항

- 프로덕션 환경에서는 반드시 비밀번호 해싱을 구현해야 합니다
- CORS 설정을 프로덕션 환경에 맞게 조정하세요
- 인증/인가 미들웨어를 추가로 구현하세요
- 입력 값 검증을 추가하세요
