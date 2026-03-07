import { ImageResponse } from 'next/og';

export const dynamic = 'force-dynamic';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0F172A',
          borderRadius: 6,
        }}
      >
        <svg width="24" height="24" viewBox="0 0 64 64" fill="none">
          <path d="M22 8 L34 8 L40 20 L34 32 L22 32 L16 20 Z" fill="#2563EB" />
          <path d="M30 32 L42 32 L48 44 L42 56 L30 56 L24 44 Z" fill="#2563EB" />
          <path d="M30 26 L34 32 L30 38 L26 32 Z" fill="#2563EB" opacity="0.85" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
