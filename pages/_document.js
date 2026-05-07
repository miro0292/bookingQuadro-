import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html>
      <Head />
      <body>
        {/* Aplica el tema oscuro antes de que React hidrate para evitar flash */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var saved = localStorage.getItem('theme');
            var theme = saved === 'light' ? 'light' : 'dark';
            document.documentElement.classList.add('theme-' + theme);
          })();
        `}} />
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
