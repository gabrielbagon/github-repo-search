// eslint.config.mjs
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import nextPlugin from '@next/eslint-plugin-next';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  // Ignorar pastas de build/cache
  { ignores: ['.next/**', 'node_modules/**', 'dist/**'] },

  // Base JS
  js.configs.recommended,

  // TS recomendado
  ...tseslint.configs.recommended,

  // Next (core-web-vitals)
  {
    plugins: { '@next/next': nextPlugin, 'react-hooks': reactHooks },
    rules: {
      ...nextPlugin.configs['core-web-vitals'].rules,
      // Garante que o plugin/react-hooks esteja disponível
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  // Relaxar regras em arquivos de teste
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/vitest.setup.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  // Desliga a regra de triple-slash apenas no next-env.d.ts
  {
    files: ['next-env.d.ts'],
    rules: {
      '@typescript-eslint/triple-slash-reference': 'off',
    },
  },
];
