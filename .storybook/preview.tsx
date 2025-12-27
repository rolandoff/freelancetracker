import type { Preview } from '@storybook/react'
import type { Decorator } from '@storybook/react'
import { useEffect } from 'react'
import '../src/styles/index.css'
import { JSX } from 'react/jsx-runtime'

// Decorator to handle dark mode class based on background color
const withTheme: Decorator = (Story, context) => {
  const backgroundColor = context.globals.backgrounds?.value || '#ffffff'
  
  useEffect(() => {
    const root = document.documentElement
    
    // Consider dark mode if background is dark
    const isDark = backgroundColor.toLowerCase() === '#0a0a0a' || 
                   backgroundColor.toLowerCase() === 'dark' ||
                   (backgroundColor.startsWith('#') && parseInt(backgroundColor.slice(1), 16) < 0x808080)
    
    // Add/remove dark class for Tailwind dark mode
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    
    // Inject CSS for docs pages
    let styleEl = document.getElementById('storybook-dark-mode-fix')
    if (!styleEl) {
      styleEl = document.createElement('style')
      styleEl.id = 'storybook-dark-mode-fix'
      document.head.appendChild(styleEl)
    }
    
    if (isDark) {
      styleEl.textContent = `
        /* Main page background */
        .sbdocs, .sbdocs-content, .sbdocs-wrapper { 
          background-color: #0a0a0a !important; 
          color: #e5e5e5 !important;
        }
        
        /* Typography - Storybook-specific classes AND actual heading elements in docs */
        .sbdocs .sbdocs-h1, 
        .sbdocs .sbdocs-h2, 
        .sbdocs .sbdocs-h3, 
        .sbdocs .sbdocs-h4,
        .sbdocs .sbdocs-title,
        .sbdocs h1:not(.sb-story h1):not(.sb-story * h1),
        .sbdocs h2:not(.sb-story h2):not(.sb-story * h2),
        .sbdocs h3:not(.sb-story h3):not(.sb-story * h3),
        .sbdocs h4:not(.sb-story h4):not(.sb-story * h4) {
          color: #ffffff !important;
          border-bottom-color: #2a2a2a !important;
        }
        
        .sbdocs .sbdocs-p,
        .sbdocs .sbdocs-li {
          color: #e5e5e5 !important;
        }
        
        /* Show code button */
        .sbdocs .docblock-code-toggle {
          background-color: #1a1a1a !important;
          color: #e5e5e5 !important;
          border: 1px solid #2a2a2a !important;
        }
        
        /* Documentation blocks */
        .sbdocs .docblock {
          background-color: #1a1a1a !important;
          border: 1px solid #2a2a2a !important;
        }
        
        /* Args/Controls table */
        .sbdocs .docblock-argstable {
          background-color: #0a0a0a !important;
        }
        
        .sbdocs .docblock-argstable th,
        .sbdocs .docblock-argstable td {
          background-color: #1a1a1a !important;
          border: 1px solid #2a2a2a !important;
          color: #e5e5e5 !important;
        }
        
        .sbdocs .docblock-argstable-head {
          background-color: #161616 !important;
        }
        
        .sbdocs .docblock-argstable thead th {
          color: #ffffff !important;
          font-weight: 600 !important;
        }
        
        /* Control inputs in args table */
        .sbdocs .docblock-argstable input,
        .sbdocs .docblock-argstable select,
        .sbdocs .docblock-argstable textarea {
          background-color: #1a1a1a !important;
          color: #e5e5e5 !important;
          border: 1px solid #2a2a2a !important;
        }
      `
    } else {
      styleEl.textContent = ''
    }
  }, [backgroundColor])

  return <Story />
}

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'dark',
          value: '#0a0a0a',
        },
      ],
    },
  },
  decorators: [withTheme],
};

export default preview;