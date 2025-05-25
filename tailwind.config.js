const { fontFamily } = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...fontFamily.sans],
      },
      typography: (theme) => ({
        editor: {
          css: {
            maxWidth: '100%',
            color: '#2a4257',
            backgroundColor: theme('colors.white'),
            fontFamily: theme('fontFamily.sans').join(', '),
            fontSize: theme('fontSize.base'),
            h1: {
              fontSize: theme('fontSize.2xl'),
              color: '#2a4257',
              fontWeight: '700',
              marginBottom: '0.5em',
            },
            h2: {
              fontSize: theme('fontSize.xl'),
              color: '#2a4257',
              fontWeight: '600',
              marginBottom: '0.4em',
            },
            h3: {
              fontSize: theme('fontSize.lg'),
              color: '#2a4257',
              fontWeight: '600',
              marginBottom: '0.3em',
            },
            p: {
              color: theme('colors.gray.600'),
              fontSize: theme('fontSize.base'),
              marginBottom: '1em',
            },
            a: {
              color: '#6bb7b7',
              textDecoration: 'underline',
              fontWeight: '500',
              '&:hover': {
                color: '#2a4257',
              },
              wordBreak: 'break-all',
            },
            code: {
              backgroundColor: theme('colors.gray.100'),
              color: theme('colors.pink.600'),
              borderRadius: theme('borderRadius.sm'),
              padding: '0.2em 0.4em',
              fontSize: '0.95em',
              fontFamily: theme('fontFamily.mono').join(', '),
            },
            pre: {
              backgroundColor: theme('colors.gray.900'),
              color: theme('colors.gray.100'),
              borderRadius: theme('borderRadius.lg'),
              border: `1px solid ${theme('colors.gray.700')}`,
              boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)',
              padding: '1.25em 1em',
              fontSize: '0.95em',
              fontFamily: theme('fontFamily.mono').join(', '),
              overflowX: 'auto',
              margin: '1.5em 0',
              position: 'relative',
              transition: 'box-shadow 0.2s, border-color 0.2s',
            },
            'pre:hover, pre:focus': {
              boxShadow: '0 4px 16px 0 rgba(0,0,0,0.18)',
              borderColor: theme('colors.blue.400'),
            },
            blockquote: {
              color: theme('colors.gray.500'),
              borderLeftColor: '#6bb7b7',
              fontStyle: 'italic',
              paddingLeft: '1em',
              borderLeftWidth: '4px',
              margin: '1em 0',
            },
            'ul, ol': {
              paddingLeft: '1.5em',
              marginBottom: '1em',
            },
            'ul > li::marker': { color: '#6bb7b7' },
            'ol > li::marker': { color: '#6bb7b7' },
            strong: { color: '#2a4257', fontWeight: '700' },
            img: {
              borderRadius: theme('borderRadius.lg'),
              maxWidth: '100%',
              height: 'auto',
              margin: '1em 0',
              display: 'block',
            },
            table: {
              width: '100%',
              borderCollapse: 'collapse',
              margin: '1em 0',
              fontSize: theme('fontSize.sm'),
            },
            th: {
              backgroundColor: theme('colors.gray.100'),
              color: theme('colors.gray.800'),
              fontWeight: '600',
              border: `1px solid ${theme('colors.gray.300')}`,
              padding: '0.5em 1em',
            },
            td: {
              border: `1px solid ${theme('colors.gray.200')}`,
              padding: '0.5em 1em',
            },
            // Dark mode overrides
            '@screen dark': {
              color: theme('colors.gray.100'),
              backgroundColor: theme('colors.gray.900'),
              h1: { color: '#b7d8e6' },
              h2: { color: '#b7d8e6' },
              h3: { color: '#b7d8e6' },
              p: { color: theme('colors.gray.300') },
              a: { color: '#6bb7b7', '&:hover': { color: '#b7d8e6' } },
              code: { backgroundColor: theme('colors.gray.800'), color: theme('colors.pink.300') },
              pre: {
                backgroundColor: theme('colors.gray.800'),
                color: theme('colors.gray.100'),
                border: `1px solid ${theme('colors.gray.600')}`,
                boxShadow: '0 2px 8px 0 rgba(0,0,0,0.30)',
              },
              'pre:hover, pre:focus': {
                borderColor: theme('colors.blue.300'),
                boxShadow: '0 4px 16px 0 rgba(0,0,0,0.32)',
              },
              blockquote: { color: theme('colors.gray.400'), borderLeftColor: '#6bb7b7' },
              strong: { color: '#b7d8e6' },
              th: { backgroundColor: theme('colors.gray.800'), color: theme('colors.gray.100'), border: `1px solid ${theme('colors.gray.700')}` },
              td: { border: `1px solid ${theme('colors.gray.700')}` },
              code: {
                backgroundColor: 'transparent',
                color: 'inherit',
              },
            },
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/typography')],
}; 