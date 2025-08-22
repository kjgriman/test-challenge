/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			primary: {
  				'50': '#f0f9ff',
  				'100': '#e0f2fe',
  				'200': '#bae6fd',
  				'300': '#7dd3fc',
  				'400': '#38bdf8',
  				'500': '#0ea5e9',
  				'600': '#0284c7',
  				'700': '#0369a1',
  				'800': '#075985',
  				'900': '#0c4a6e',
  				'950': '#082f49',
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				'50': '#fdf4ff',
  				'100': '#fae8ff',
  				'200': '#f5d0fe',
  				'300': '#f0abfc',
  				'400': '#e879f9',
  				'500': '#d946ef',
  				'600': '#c026d3',
  				'700': '#a21caf',
  				'800': '#86198f',
  				'900': '#701a75',
  				'950': '#4a044e',
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			accent: {
  				'50': '#fff7ed',
  				'100': '#ffedd5',
  				'200': '#fed7aa',
  				'300': '#fdba74',
  				'400': '#fb923c',
  				'500': '#f97316',
  				'600': '#ea580c',
  				'700': '#c2410c',
  				'800': '#9a3412',
  				'900': '#7c2d12',
  				'950': '#431407',
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			success: {
  				'50': '#f0fdf4',
  				'100': '#dcfce7',
  				'200': '#bbf7d0',
  				'300': '#86efac',
  				'400': '#4ade80',
  				'500': '#22c55e',
  				'600': '#16a34a',
  				'700': '#15803d',
  				'800': '#166534',
  				'900': '#14532d',
  				'950': '#052e16'
  			},
  			warning: {
  				'50': '#fffbeb',
  				'100': '#fef3c7',
  				'200': '#fde68a',
  				'300': '#fcd34d',
  				'400': '#fbbf24',
  				'500': '#f59e0b',
  				'600': '#d97706',
  				'700': '#b45309',
  				'800': '#92400e',
  				'900': '#78350f',
  				'950': '#451a03'
  			},
  			error: {
  				'50': '#fef2f2',
  				'100': '#fee2e2',
  				'200': '#fecaca',
  				'300': '#fca5a5',
  				'400': '#f87171',
  				'500': '#ef4444',
  				'600': '#dc2626',
  				'700': '#b91c1c',
  				'800': '#991b1b',
  				'900': '#7f1d1d',
  				'950': '#450a0a'
  			},
  			therapy: {
  				blue: '#3b82f6',
  				green: '#10b981',
  				orange: '#f59e0b',
  				purple: '#8b5cf6',
  				pink: '#ec4899',
  				teal: '#14b8a6'
  			},
  			slp: {
  				primary: '#1e40af',
  				secondary: '#3b82f6',
  				accent: '#60a5fa'
  			},
  			child: {
  				primary: '#ec4899',
  				secondary: '#f472b6',
  				accent: '#f9a8d4'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			sans: [
  				'Inter',
  				'system-ui',
  				'sans-serif'
  			],
  			display: [
  				'Poppins',
  				'system-ui',
  				'sans-serif'
  			],
  			mono: [
  				'JetBrains Mono',
  				'monospace'
  			]
  		},
  		fontSize: {
  			xs: [
  				'0.75rem',
  				{
  					lineHeight: '1rem'
  				}
  			],
  			sm: [
  				'0.875rem',
  				{
  					lineHeight: '1.25rem'
  				}
  			],
  			base: [
  				'1rem',
  				{
  					lineHeight: '1.5rem'
  				}
  			],
  			lg: [
  				'1.125rem',
  				{
  					lineHeight: '1.75rem'
  				}
  			],
  			xl: [
  				'1.25rem',
  				{
  					lineHeight: '1.75rem'
  				}
  			],
  			'2xl': [
  				'1.5rem',
  				{
  					lineHeight: '2rem'
  				}
  			],
  			'3xl': [
  				'1.875rem',
  				{
  					lineHeight: '2.25rem'
  				}
  			],
  			'4xl': [
  				'2.25rem',
  				{
  					lineHeight: '2.5rem'
  				}
  			],
  			'5xl': [
  				'3rem',
  				{
  					lineHeight: '1'
  				}
  			],
  			'6xl': [
  				'3.75rem',
  				{
  					lineHeight: '1'
  				}
  			],
  			'7xl': [
  				'4.5rem',
  				{
  					lineHeight: '1'
  				}
  			],
  			'8xl': [
  				'6rem',
  				{
  					lineHeight: '1'
  				}
  			],
  			'9xl': [
  				'8rem',
  				{
  					lineHeight: '1'
  				}
  			]
  		},
  		spacing: {
  			'18': '4.5rem',
  			'88': '22rem',
  			'128': '32rem',
  			'144': '36rem'
  		},
  		borderRadius: {
  			'4xl': '2rem',
  			'5xl': '2.5rem',
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		animation: {
  			'fade-in': 'fadeIn 0.5s ease-in-out',
  			'fade-out': 'fadeOut 0.5s ease-in-out',
  			'slide-in': 'slideIn 0.3s ease-out',
  			'slide-out': 'slideOut 0.3s ease-in',
  			'bounce-in': 'bounceIn 0.6s ease-out',
  			'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  			wiggle: 'wiggle 1s ease-in-out infinite',
  			float: 'float 3s ease-in-out infinite',
  			glow: 'glow 2s ease-in-out infinite alternate'
  		},
  		keyframes: {
  			fadeIn: {
  				'0%': {
  					opacity: '0'
  				},
  				'100%': {
  					opacity: '1'
  				}
  			},
  			fadeOut: {
  				'0%': {
  					opacity: '1'
  				},
  				'100%': {
  					opacity: '0'
  				}
  			},
  			slideIn: {
  				'0%': {
  					transform: 'translateX(-100%)'
  				},
  				'100%': {
  					transform: 'translateX(0)'
  				}
  			},
  			slideOut: {
  				'0%': {
  					transform: 'translateX(0)'
  				},
  				'100%': {
  					transform: 'translateX(100%)'
  				}
  			},
  			bounceIn: {
  				'0%': {
  					transform: 'scale(0.3)',
  					opacity: '0'
  				},
  				'50%': {
  					transform: 'scale(1.05)'
  				},
  				'70%': {
  					transform: 'scale(0.9)'
  				},
  				'100%': {
  					transform: 'scale(1)',
  					opacity: '1'
  				}
  			},
  			wiggle: {
  				'0%, 100%': {
  					transform: 'rotate(-3deg)'
  				},
  				'50%': {
  					transform: 'rotate(3deg)'
  				}
  			},
  			float: {
  				'0%, 100%': {
  					transform: 'translateY(0px)'
  				},
  				'50%': {
  					transform: 'translateY(-20px)'
  				}
  			},
  			glow: {
  				'0%': {
  					boxShadow: '0 0 5px #3b82f6'
  				},
  				'100%': {
  					boxShadow: '0 0 20px #3b82f6, 0 0 30px #3b82f6'
  				}
  			}
  		},
  		boxShadow: {
  			soft: '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
  			medium: '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  			large: '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  			glow: '0 0 20px rgba(59, 130, 246, 0.5)',
  			'glow-lg': '0 0 40px rgba(59, 130, 246, 0.3)'
  		},
  		backdropBlur: {
  			xs: '2px'
  		},
  		zIndex: {
  			'60': '60',
  			'70': '70',
  			'80': '80',
  			'90': '90',
  			'100': '100'
  		},
  		transitionProperty: {
  			height: 'height',
  			spacing: 'margin, padding'
  		},
  		scale: {
  			'102': '1.02',
  			'103': '1.03'
  		},
  		rotate: {
  			'135': '135deg',
  			'225': '225deg'
  		},
  		skew: {
  			'12': '12deg',
  			'13': '13deg'
  		}
  	}
  },
  plugins: [
    // Plugin personalizado para utilidades de terapia
    function({ addUtilities, theme }) {
      const newUtilities = {
        '.text-gradient': {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.bg-gradient-therapy': {
          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
        },
        '.bg-gradient-success': {
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        },
        '.bg-gradient-warning': {
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        },
        '.bg-gradient-error': {
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        },
        '.shadow-therapy': {
          boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3)',
        },
        '.shadow-success': {
          boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)',
        },
        '.shadow-warning': {
          boxShadow: '0 4px 20px rgba(245, 158, 11, 0.3)',
        },
        '.shadow-error': {
          boxShadow: '0 4px 20px rgba(239, 68, 68, 0.3)',
        },
      };
      addUtilities(newUtilities);
    },
      require("tailwindcss-animate")
],
};


