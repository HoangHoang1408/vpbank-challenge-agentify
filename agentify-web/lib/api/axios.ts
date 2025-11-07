import axios from 'axios';

// Tự động detect và sử dụng API proxy khi cần
//
// GIẢI PHÁP TỐT NHẤT: Tạo ngrok tunnel riêng cho backend API
// 1. Chạy: ngrok http 3000 (trên máy chạy backend)
// 2. Lấy HTTPS URL từ ngrok (ví dụ: https://abc123.ngrok-free.app)
// 3. Set NEXT_PUBLIC_API_URL=https://abc123.ngrok-free.app
// 4. Khi đó không cần proxy nữa vì cả 2 đều là HTTPS
//
// Nếu backend vẫn là HTTP, proxy sẽ tự động được dùng khi trang chạy trên HTTPS
const getApiBaseURL = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    return '';
  }

  // Nếu API URL đã là HTTPS, không cần proxy
  if (apiUrl.startsWith('https://')) {
    return apiUrl;
  }

  // Nếu đang ở client side và đang chạy trên HTTPS
  if (typeof window !== 'undefined') {
    const isHttps = window.location.protocol === 'https:';
    const isApiHttp = apiUrl.startsWith('http://');

    // Nếu trang HTTPS nhưng API là HTTP -> dùng proxy qua Next.js API route
    if (isHttps && isApiHttp) {
      // Sử dụng relative path để proxy qua Next.js API route
      // Next.js API route sẽ forward request đến backend HTTP
      return '/api/proxy';
    }
  }

  return apiUrl;
};

export const API = axios.create({
  baseURL: getApiBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});
