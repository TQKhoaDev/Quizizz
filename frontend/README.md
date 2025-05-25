# Cấu Trúc Dự Án Frontend

Đây là cấu trúc thư mục chuẩn chuyên nghiệp cho dự án frontend.

```
frontend/
├── public/                 # Tài nguyên tĩnh
├── src/                    # Mã nguồn
│   ├── assets/             # Tài nguyên (hình ảnh, svg, videos...)
│   ├── components/         # Components tái sử dụng
│   │   ├── common/         # Components chung (Button, Input, Modal...)
│   │   ├── forms/          # Components liên quan đến form
│   │   └── layouts/        # Các layout (MainLayout, AuthLayout...)
│   ├── config/             # Các file cấu hình (constants, environment vars...)
│   ├── features/           # Feature-based modules
│   │   ├── auth/           # Tính năng xác thực
│   │   │   ├── components/ # Auth-specific components
│   │   │   ├── hooks/      # Auth-specific hooks
│   │   │   ├── services/   # Auth-specific services
│   │   │   └── types/      # Auth-specific types
│   │   └── [feature]/      # Các tính năng khác
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Các thư viện và tiện ích
│   ├── pages/              # Các trang của ứng dụng
│   ├── services/           # API services và giao tiếp backend
│   ├── store/              # State management (Redux, Zustand...)
│   ├── styles/             # Global styles, theme variables...
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Hàm tiện ích
│   ├── App.tsx             # Component gốc
│   ├── main.tsx            # Điểm khởi chạy ứng dụng
│   └── routes.tsx          # Router configuration
├── .eslintrc.js            # ESLint configuration
├── .gitignore
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## Quy Ước Coding

1. **Components**: 
   - Mỗi component nên có thư mục riêng với cấu trúc:
     - `index.ts` - Export component
     - `ComponentName.tsx` - Component chính
     - `ComponentName.module.css` - Styles (nếu dùng CSS modules)
     - `ComponentName.test.tsx` - Tests
     - `ComponentName.types.ts` - TypeScript types

2. **Imports**:
   - Sắp xếp imports theo thứ tự:
     1. React/thư viện bên ngoài
     2. Components
     3. Hooks
     4. Utils
     5. Types
     6. Assets/styles

3. **Naming**:
   - Components: PascalCase
   - Hooks: camelCase với prefix `use`
   - Files: kebab-case cho hầu hết các file
   - Types/Interfaces: PascalCase

4. **State Management**:
   - Sử dụng hooks cho state đơn giản
   - Zustand/Redux cho state toàn cục
   - Context API cho state chia sẻ giữa components

5. **API Calls**:
   - Sử dụng React Query/SWR cho data fetching
   - Tách logic API vào services/
   - Sử dụng Axios hoặc Fetch API
