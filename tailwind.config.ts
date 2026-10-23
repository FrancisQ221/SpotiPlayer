import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Void & Base Canvas
        void: '#070B0E',
        // Surfaces
        surface: {
          DEFAULT: '#0e141a',
          dim: '#0e141a',
          bright: '#343a41',
          lowest: '#090f15',
          low: '#161c22',
          container: '#1a2026',
          high: '#252b31',
          highest: '#2f353c',
          variant: '#2f353c',
        },
        'on-surface': {
          DEFAULT: '#dde3ec',
          variant: '#bacbbe',
        },
        'inverse-surface': {
          DEFAULT: '#dde3ec',
          on: '#2b3138',
        },
        outline: {
          DEFAULT: '#849589',
          variant: '#3b4a41',
        },
        // Primary - Neon Emerald (#00E599)
        primary: {
          DEFAULT: '#00e599',
          light: '#6dffba',
          dark: '#006c46',
          container: '#00e599',
          'on-container': '#00613e',
          fixed: '#4dffb2',
          'fixed-dim': '#00e297',
        },
        'on-primary': '#003822',
        // Secondary - Atmospheric Cyan (#06B6D4) / Hi-Fi Spec
        secondary: {
          DEFAULT: '#06b6d4',
          light: '#4cd7f6',
          dark: '#00424e',
          container: '#03b5d3',
          'on-container': '#00424e',
          fixed: '#acedff',
          'fixed-dim': '#4cd7f6',
        },
        'on-secondary': '#003640',
        // Tertiary - Warm Amber Gold (#F5A623 / #F59E0B) for Patronage & Voluntary Support
        amber: {
          patron: '#f5a623',
          glow: '#f59e0b',
          bright: '#fbbf24',
          container: '#ffbc68',
        },
        tertiary: {
          DEFAULT: '#f5a623',
          light: '#ffe0be',
          dark: '#774a00',
          container: '#ffbc68',
          'on-container': '#774a00',
          fixed: '#ffddb8',
          'fixed-dim': '#ffb95f',
        },
        'on-tertiary': '#472a00',
        // Error / Warning
        error: {
          DEFAULT: '#ffb4ab',
          container: '#93000a',
          'on-container': '#ffdad6',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      backdropBlur: {
        glass: '20px',
        deep: '24px',
      },
      boxShadow: {
        glass: '0 16px 36px -8px rgba(0, 0, 0, 0.6)',
        'neon-emerald': '0 0 20px rgba(0, 229, 153, 0.45)',
        'neon-amber': '0 0 20px rgba(245, 158, 11, 0.5)',
        'neon-cyan': '0 0 20px rgba(6, 182, 212, 0.45)',
        'specular-inner': 'inset 0 1px 0 rgba(255, 255, 255, 0.08)',
      },
      borderRadius: {
        pill: '9999px',
        card: '20px',
        panel: '24px',
      },
      borderColor: {
        specular: 'rgba(255, 255, 255, 0.08)',
        'specular-hover': 'rgba(255, 255, 255, 0.16)',
        'emerald-glow': 'rgba(0, 229, 153, 0.3)',
        'amber-glow': 'rgba(245, 158, 11, 0.3)',
      },
    },
  },
  plugins: [],
} satisfies Config;
