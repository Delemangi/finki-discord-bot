import {
  base,
  node,
  perfectionist,
  prettier,
  typescript,
} from 'eslint-config-imperium';

export default [
  { ignores: ['dist'] },
  base,
  node,
  typescript,
  prettier,
  perfectionist,
];
