'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ja">
      <body>
        <div style={{
          display: 'flex',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(to bottom right, #eff6ff, #dbeafe)',
        }}>
          <main style={{
            textAlign: 'center',
            padding: '2rem',
            maxWidth: '28rem',
          }}>
            <div style={{ fontSize: '3.75rem' }}>500</div>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#111827',
              marginTop: '1.5rem',
            }}>
              エラーが発生しました
            </h1>
            <p style={{
              color: '#4b5563',
              marginTop: '1rem',
            }}>
              申し訳ございません。予期せぬエラーが発生しました。
            </p>
            <button
              onClick={reset}
              style={{
                display: 'inline-block',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#2563eb',
                color: 'white',
                fontWeight: '500',
                borderRadius: '0.5rem',
                marginTop: '1.5rem',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              もう一度試す
            </button>
          </main>
        </div>
      </body>
    </html>
  );
}
