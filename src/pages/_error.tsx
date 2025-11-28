import { NextPageContext } from 'next';

interface ErrorProps {
  statusCode?: number;
}

function Error({ statusCode }: ErrorProps) {
  return (
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
        <div style={{ fontSize: '3.75rem' }}>{statusCode || 'Error'}</div>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#111827',
          marginTop: '1.5rem',
        }}>
          {statusCode === 404
            ? 'ページが見つかりません'
            : 'エラーが発生しました'}
        </h1>
        <p style={{
          color: '#4b5563',
          marginTop: '1rem',
        }}>
          {statusCode === 404
            ? 'お探しのページは存在しないか、移動した可能性があります。'
            : '申し訳ございません。予期せぬエラーが発生しました。'}
        </p>
        <a
          href="/"
          style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#2563eb',
            color: 'white',
            fontWeight: '500',
            borderRadius: '0.5rem',
            marginTop: '1.5rem',
            textDecoration: 'none',
          }}
        >
          ホームに戻る
        </a>
      </main>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
