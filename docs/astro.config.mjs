import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  integrations: [
    starlight({
      title: 'Bitbucket CLI',
      description: 'A command-line interface for Bitbucket Cloud',
      social: {
        github: 'https://github.com/0pilatos0/bitbucket-cli',
      },
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Installation', slug: 'getting-started/installation' },
            { label: 'Authentication', slug: 'getting-started/authentication' },
          ],
        },
        {
          label: 'Commands',
          items: [
            { label: 'Auth', slug: 'commands/auth' },
            { label: 'Repo', slug: 'commands/repo' },
            { label: 'PR', slug: 'commands/pr' },
            { label: 'Config', slug: 'commands/config' },
          ],
        },
      ],
    }),
  ],
});
