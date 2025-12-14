# Shopping Mall Client

React + Vite 기반 쇼핑몰 프론트엔드 애플리케이션

## 기술 스택

- React 19
- Vite 7
- React Router DOM 7
- Axios
- CSS3

## 주요 기능

- 상품 목록 조회 및 상세 정보 확인
- 장바구니 관리 (추가, 수량 변경, 삭제)
- 주문 생성 및 조회
- 반응형 디자인

## 프로젝트 구조

```
client/
├── src/
│   ├── api/                 # API 클라이언트 및 엔드포인트
│   │   ├── client.js        # Axios 인스턴스 설정
│   │   ├── products.js      # 상품 API
│   │   ├── users.js         # 사용자 API
│   │   ├── orders.js        # 주문 API
│   │   └── index.js         # API 내보내기
│   ├── components/          # 재사용 가능한 컴포넌트
│   │   ├── Layout.jsx       # 레이아웃 컴포넌트
│   │   └── Layout.css
│   ├── pages/               # 페이지 컴포넌트
│   │   ├── Home.jsx         # 홈 페이지
│   │   ├── Products.jsx     # 상품 목록 페이지
│   │   ├── ProductDetail.jsx # 상품 상세 페이지
│   │   ├── Cart.jsx         # 장바구니 페이지
│   │   ├── Checkout.jsx     # 결제 페이지
│   │   ├── Orders.jsx       # 주문 목록 페이지
│   │   └── NotFound.jsx     # 404 페이지
│   ├── App.jsx              # 루트 컴포넌트
│   ├── App.css              # 전역 스타일
│   ├── main.jsx             # 진입점
│   └── index.css            # 기본 스타일
├── .env                     # 환경변수
├── .env.example             # 환경변수 예시
├── package.json
└── vite.config.js           # Vite 설정
```

## 설치 및 실행

### 1. 의존성 설치

```bash
cd client
npm install
```

### 2. 환경변수 설정

`.env` 파일이 자동으로 생성되어 있습니다. 필요시 API URL을 수정하세요:

```env
VITE_API_URL=http://localhost:3000/api
```

### 3. 개발 서버 실행

```bash
npm run dev
```

기본적으로 `http://localhost:5173`에서 실행됩니다.

### 4. 프로덕션 빌드

```bash
npm run build
```

빌드된 파일은 `dist/` 폴더에 생성됩니다.

### 5. 프로덕션 미리보기

```bash
npm run preview
```

## 페이지 구조

### 라우팅

- `/` - 홈 페이지
- `/products` - 상품 목록
- `/products/:id` - 상품 상세 정보
- `/cart` - 장바구니
- `/checkout` - 결제
- `/orders` - 주문 목록
- `*` - 404 페이지

## API 클라이언트 사용법

### 상품 API

```javascript
import { productAPI } from './api';

// 모든 상품 조회
const products = await productAPI.getAll();

// 특정 상품 조회
const product = await productAPI.getById(id, category);

// 상품 생성
const newProduct = await productAPI.create(productData);

// 상품 수정
const updated = await productAPI.update(id, productData);

// 상품 삭제
await productAPI.delete(id, category);
```

### 주문 API

```javascript
import { orderAPI } from './api';

// 모든 주문 조회
const orders = await orderAPI.getAll();

// 사용자별 주문 조회
const userOrders = await orderAPI.getByUserId(userId);

// 주문 생성
const newOrder = await orderAPI.create(orderData);
```

## 로컬 스토리지 사용

장바구니 데이터는 브라우저의 로컬 스토리지에 저장됩니다:

```javascript
// 장바구니 저장
localStorage.setItem('cart', JSON.stringify(cartItems));

// 장바구니 불러오기
const cart = JSON.parse(localStorage.getItem('cart') || '[]');
```

## 스타일링

각 컴포넌트는 독립적인 CSS 파일을 가지고 있습니다:
- 반응형 디자인 (모바일, 태블릿, 데스크톱)
- 일관된 색상 테마 (`#667eea` 주요 색상)
- 부드러운 애니메이션 및 전환 효과

## 백엔드 서버 연동

이 클라이언트는 `server/` 폴더의 Node.js + Express + CosmosDB 서버와 연동됩니다.

서버를 먼저 실행해야 합니다:

```bash
cd ../server
npm run dev
```

## 개발 팁

1. **Hot Module Replacement (HMR)**: Vite는 코드 변경 시 자동으로 브라우저를 업데이트합니다.
2. **ESLint**: 코드 품질을 위해 `npm run lint`를 실행하세요.
3. **React DevTools**: 브라우저 확장 프로그램을 설치하여 디버깅하세요.

## 주의사항

- 프로덕션 환경에서는 반드시 환경변수를 적절히 설정하세요
- 인증 기능이 구현되어 있지 않으므로 추가 구현이 필요합니다
- 이미지 업로드 기능은 별도로 구현해야 합니다
