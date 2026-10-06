# 🌐 Hướng Dẫn Tích Hợp Đa Ngôn Ngữ (i18n) Cho Đồ Án CNPM

Tài liệu này hướng dẫn chi tiết cách cài đặt và sử dụng **i18n (Internationalization)** cho cả 2 nền tảng trong đồ án:
1. **Web Frontend (`app/FE`)**: React 19 + Vite + TailwindCSS.
2. **Mobile App (`mobile`)**: React Native + Expo + Expo Router + TypeScript.

---

## 📑 Mục lục
1. [Nguyên lý hoạt động của i18n](#1-nguyên-lý-hoạt-động-của-i18n)
2. [Hướng dẫn tích hợp cho Web (`app/FE`)](#2-hướng-dẫn-tích-hợp-cho-web-appfe)
   - [Bước 2.1: Cài đặt thư viện](#bước-21-cài-đặt-thư-viện)
   - [Bước 2.2: Cấu trúc thư mục & File dịch JSON](#bước-22-cấu-trúc-thư-mục--file-dịch-json)
   - [Bước 2.3: Tạo file cấu hình i18n](#bước-23-tạo-file-cấu-hình-i18n)
   - [Bước 2.4: Đăng ký i18n vào ứng dụng](#bước-24-đăng-ký-i18n-vào-ứng-dụng)
   - [Bước 2.5: Sử dụng trong React Component](#bước-25-sử-dụng-trong-react-component)
   - [Bước 2.6: Tạo nút chuyển đổi ngôn ngữ (Language Switcher)](#bước-26-tạo-nút-chuyển-đổi-ngôn-ngữ-language-switcher)
3. [Hướng dẫn tích hợp cho Mobile (`mobile`)](#3-hướng-dẫn-tích-hợp-cho-mobile-mobile)
   - [Bước 3.1: Cài đặt thư viện](#bước-31-cài-đặt-thư-viện)
   - [Bước 3.2: Cấu trúc thư mục & File dịch JSON](#bước-32-cấu-trúc-thư-mục--file-dịch-json-1)
   - [Bước 3.3: Tạo file cấu hình i18n](#bước-33-tạo-file-cấu-hình-i18n-1)
   - [Bước 3.4: Đăng ký vào Root Layout Expo](#bước-34-đăng-ký-vào-root-layout-expo)
   - [Bước 3.5: Sử dụng trong màn hình React Native](#bước-35-sử-dụng-trong-màn-hình-react-native)
   - [Bước 3.6: Tạo component chuyển đổi ngôn ngữ Mobile](#bước-36-tạo-component-chuyển-đổi-ngôn-ngữ-mobile)
4. [Các kỹ thuật nâng cao & Best Practices](#4-các-kỹ-thuật-nâng-cao--best-practices)
   - [Truyền biến động (Interpolation)](#41-truyền-biến-động-interpolation)
   - [Số nhiều (Pluralization)](#42-xử-lý-số-ít--số-nhiều-pluralization)
   - [Format ngày giờ, tiền tệ](#43-format-ngày-giờ-tiền-tệ)
   - [Quy tắc đặt key dịch tránh xung đột](#44-quy-tắc-đặt-key-dịch-tránh-xung-đột)

---

## 1. Nguyên lý hoạt động của i18n

Giải pháp sử dụng bộ đôi tiêu chuẩn hàng đầu trong hệ sinh thái React:
* **`i18next`**: Bộ lõi xử lý dịch thuật, định dạng và quản lý ngôn ngữ.
* **`react-i18next`**: Cung cấp hook `useTranslation()` giúp React re-render ngay khi người dùng đổi ngôn ngữ mà không cần tải lại trang.
* **Cơ chế lưu trữ**:
  * Web: Tự động lưu vào `localStorage`.
  * Mobile: Lưu vào `AsyncStorage` và tự nhận diện ngôn ngữ máy (`expo-localization`).

---

## 2. Hướng dẫn tích hợp cho Web (`app/FE`)

### Bước 2.1: Cài đặt thư viện
Mở terminal và di chuyển vào thư mục `app/FE`:
```bash
cd app/FE
npm install i18next react-i18next i18next-browser-languagedetector
```

---

### Bước 2.2: Cấu trúc thư mục & File dịch JSON
Tạo thư mục `src/locales/` chứa các ngôn ngữ:
```text
app/FE/src/
└── locales/
    ├── vi/
    │   └── translation.json
    └── en/
        └── translation.json
```

#### `app/FE/src/locales/vi/translation.json`:
```json
{
  "common": {
    "appName": "Hệ Thống Đồ Án CNPM",
    "search": "Tìm kiếm...",
    "confirm": "Xác nhận",
    "cancel": "Hủy bỏ",
    "save": "Lưu thay đổi",
    "loading": "Đang tải dữ liệu..."
  },
  "nav": {
    "home": "Trang chủ",
    "map": "Bản đồ",
    "dashboard": "Bảng điều khiển",
    "profile": "Tài khoản",
    "logout": "Đăng xuất"
  },
  "auth": {
    "login": "Đăng nhập",
    "register": "Đăng ký",
    "email": "Email",
    "password": "Mật khẩu",
    "welcome": "Chào mừng bạn, {{name}}!"
  }
}
```

#### `app/FE/src/locales/en/translation.json`:
```json
{
  "common": {
    "appName": "SE Capstone Project",
    "search": "Search...",
    "confirm": "Confirm",
    "cancel": "Cancel",
    "save": "Save changes",
    "loading": "Loading data..."
  },
  "nav": {
    "home": "Home",
    "map": "Map",
    "dashboard": "Dashboard",
    "profile": "Profile",
    "logout": "Logout"
  },
  "auth": {
    "login": "Login",
    "register": "Register",
    "email": "Email",
    "password": "Password",
    "welcome": "Welcome back, {{name}}!"
  }
}
```

---

### Bước 2.3: Tạo file cấu hình i18n
Tạo file `app/FE/src/i18n.js`:

```javascript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import viTranslation from './locales/vi/translation.json';
import enTranslation from './locales/en/translation.json';

const resources = {
  vi: {
    translation: viTranslation,
  },
  en: {
    translation: enTranslation,
  },
};

i18n
  // Tự động nhận diện ngôn ngữ từ localStorage / trình duyệt
  .use(LanguageDetector)
  // Kết nối với react-i18next
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'vi', // Mặc định là Tiếng Việt nếu chưa chọn
    debug: false,
    interpolation: {
      escapeValue: false, // React đã tự bảo vệ chống XSS
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
```

---

### Bước 2.4: Đăng ký i18n vào ứng dụng
Mở file `app/FE/src/main.jsx` và import file `i18n.js` ngay trên cùng:

```javascript
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './i18n'; // <-- Thêm dòng này để nạp cấu hình i18n
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

---

### Bước 2.5: Sử dụng trong React Component
Sử dụng hook `useTranslation()` từ `react-i18next`:

```jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Header() {
  const { t } = useTranslation();

  return (
    <header className="flex items-center justify-between p-4 bg-white shadow">
      <h1 className="text-xl font-bold">{t('common.appName')}</h1>
      <nav className="flex gap-4">
        <a href="/">{t('nav.home')}</a>
        <a href="/map">{t('nav.map')}</a>
        <a href="/dashboard">{t('nav.dashboard')}</a>
      </nav>
    </header>
  );
}
```

---

### Bước 2.6: Tạo nút chuyển đổi ngôn ngữ (Language Switcher)
Tạo component `app/FE/src/components/common/LanguageSwitcher.jsx`:

```jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg border border-gray-200">
      <button
        type="button"
        onClick={() => changeLanguage('vi')}
        className={`px-2.5 py-1 text-sm font-medium rounded-md transition-all ${
          i18n.language === 'vi'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-gray-700 hover:bg-gray-200'
        }`}
      >
        🇻🇳 VN
      </button>
      <button
        type="button"
        onClick={() => changeLanguage('en')}
        className={`px-2.5 py-1 text-sm font-medium rounded-md transition-all ${
          i18n.language === 'en'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-gray-700 hover:bg-gray-200'
        }`}
      >
        🇬🇧 EN
      </button>
    </div>
  );
}
```

---

## 3. Hướng dẫn tích hợp cho Mobile (`mobile`)

### Bước 3.1: Cài đặt thư viện
Mở terminal và di chuyển vào thư mục `mobile`:
```bash
cd mobile
npx expo install expo-localization @react-native-async-storage/async-storage
npm install i18next react-i18next
```

---

### Bước 3.2: Cấu trúc thư mục & File dịch JSON
Tạo thư mục `mobile/src/locales/`:
```text
mobile/src/
└── locales/
    ├── vi.json
    └── en.json
```

#### `mobile/src/locales/vi.json`:
```json
{
  "common": {
    "appName": "CNPM Mobile",
    "search": "Tìm kiếm...",
    "confirm": "Đồng ý",
    "cancel": "Hủy"
  },
  "screens": {
    "home": "Trang chủ",
    "map": "Bản đồ",
    "settings": "Cài đặt"
  },
  "settings": {
    "language": "Ngôn ngữ",
    "theme": "Giao diện"
  }
}
```

#### `mobile/src/locales/en.json`:
```json
{
  "common": {
    "appName": "CNPM Mobile",
    "search": "Search...",
    "confirm": "Confirm",
    "cancel": "Cancel"
  },
  "screens": {
    "home": "Home",
    "map": "Map",
    "settings": "Settings"
  },
  "settings": {
    "language": "Language",
    "theme": "Theme"
  }
}
```

---

### Bước 3.3: Tạo file cấu hình i18n
Tạo file `mobile/src/i18n/index.ts`:

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import vi from '../locales/vi.json';
import en from '../locales/en.json';

const LANGUAGE_KEY = '@app_language';

const resources = {
  vi: { translation: vi },
  en: { translation: en },
};

// Khởi tạo i18n với ngôn ngữ mặc định từ hệ điều hành máy
const deviceLocale = Localization.getLocales()[0]?.languageCode ?? 'vi';
const initialLanguage = ['vi', 'en'].includes(deviceLocale) ? deviceLocale : 'vi';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLanguage,
    fallbackLng: 'vi',
    interpolation: {
      escapeValue: false,
    },
  });

// Hàm hỗ trợ đọc ngôn ngữ người dùng đã lưu
export const loadStoredLanguage = async () => {
  try {
    const savedLang = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (savedLang) {
      await i18n.changeLanguage(savedLang);
    }
  } catch (error) {
    console.error('Lỗi khi tải ngôn ngữ đã lưu:', error);
  }
};

// Hàm chuyển đổi và lưu ngôn ngữ
export const changeAppLanguage = async (lang: 'vi' | 'en') => {
  try {
    await i18n.changeLanguage(lang);
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  } catch (error) {
    console.error('Lỗi khi lưu ngôn ngữ:', error);
  }
};

export default i18n;
```

---

### Bước 3.4: Đăng ký vào Root Layout Expo
Trong file `mobile/src/app/_layout.tsx` (hoặc root file của Expo Router):

```typescript
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import '../i18n'; // Khởi tạo i18n
import { loadStoredLanguage } from '../i18n';

export default function RootLayout() {
  useEffect(() => {
    // Tải ngôn ngữ đã lưu của người dùng từ AsyncStorage
    loadStoredLanguage();
  }, []);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
```

---

### Bước 3.5: Sử dụng trong màn hình React Native

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function HomeScreen() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('common.appName')}</Text>
      <Text style={styles.subtitle}>{t('screens.home')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
});
```

---

### Bước 3.6: Tạo component chuyển đổi ngôn ngữ Mobile
Tạo file `mobile/src/components/LanguageSelector.tsx`:

```typescript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { changeAppLanguage } from '../i18n';

export default function LanguageSelector() {
  const { i18n, t } = useTranslation();

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{t('settings.language')}:</Text>
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[
            styles.btn,
            i18n.language === 'vi' && styles.btnActive,
          ]}
          onPress={() => changeAppLanguage('vi')}
        >
          <Text
            style={[
              styles.btnText,
              i18n.language === 'vi' && styles.btnTextActive,
            ]}
          >
            🇻🇳 Tiếng Việt
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.btn,
            i18n.language === 'en' && styles.btnActive,
          ]}
          onPress={() => changeAppLanguage('en')}
        >
          <Text
            style={[
              styles.btnText,
              i18n.language === 'en' && styles.btnTextActive,
            ]}
          >
            🇬🇧 English
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    padding: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  btn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
  btnActive: {
    backgroundColor: '#2563EB',
  },
  btnText: {
    color: '#1F2937',
    fontWeight: '500',
  },
  btnTextActive: {
    color: '#FFFFFF',
  },
});
```

---

## 4. Các kỹ thuật nâng cao & Best Practices

### 4.1 Truyền biến động (Interpolation)
Trong file JSON:
```json
{
  "greeting": "Xin chào {{username}}, bạn có {{count}} thông báo mới!"
}
```
Trong component:
```jsx
t('greeting', { username: 'Nguyễn Văn A', count: 3 })
// Kết quả: "Xin chào Nguyễn Văn A, bạn có 3 thông báo mới!"
```

---

### 4.2 Xử lý số ít / số nhiều (Pluralization)
Trong `translation.json`:
```json
{
  "cart_item_one": "Bạn có {{count}} sản phẩm trong giỏ hàng",
  "cart_item_other": "Bạn có {{count}} sản phẩm trong giỏ hàng"
}
```
Trong code:
```jsx
t('cart_item', { count: 1 }) // một sản phẩm
t('cart_item', { count: 5 }) // nhiều sản phẩm
```

---

### 4.3 Format ngày giờ, tiền tệ
Khi hiển thị ngày tháng hoặc số tiền theo quốc gia, bạn có thể truyền kèm formatter hoặc kết hợp với hàm tiện ích:
```javascript
// Viết hàm trong utils/currency.js
export const formatCurrency = (amount, lng = 'vi') => {
  return new Intl.NumberFormat(lng === 'vi' ? 'vi-VN' : 'en-US', {
    style: 'currency',
    currency: lng === 'vi' ? 'VND' : 'USD',
  }).format(amount);
};
```

---

### 4.4 Quy tắc đặt key dịch tránh xung đột
* **Không đặt key theo nội dung text**: Tránh `"Click_vao_day"`. Hãy đặt theo ngữ cảnh ngữ nghĩa: `"buttons.submit"`, `"auth.forgotPassword"`.
* **Phân nhóm theo module**:
  * `common.*`: Các từ dùng chung ở mọi nơi (`save`, `cancel`, `error`, `loading`).
  * `nav.*`: Menu điều hướng.
  * `auth.*`: Màn đăng nhập, đăng ký, quên mật khẩu.
  * `map.*`: Các thuật ngữ liên quan đến bản đồ, định vị.
  * `dashboard.*`: Các chỉ số, biểu đồ thống kê.
* **Đồng bộ key giữa các file**: Khi thêm 1 key mới ở `vi`, luôn luôn thêm key tương ứng ở `en` để tránh lỗi fallback hiển thị thô.
