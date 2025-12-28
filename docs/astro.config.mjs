import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
  site: "https://bitbucket-cli.paulvanderlei.com",
  integrations: [
    starlight({
      title: "Bitbucket CLI",
      description: "A command-line interface for Bitbucket Cloud",
      head: [
        {
          tag: "script",
          attrs: {
            defer: true,
            src: "https://analytics.paulvanderlei.com/script.js",
            "data-website-id": "9a3d0f17-6294-466a-839e-9adc73e78393",
          },
        },
      ],
      social: {
        github: "https://github.com/0pilatos0/bitbucket-cli",
      },
      sidebar: [
        {
          label: "Getting Started",
          items: [
            { label: "Installation", slug: "getting-started/installation" },
            { label: "Authentication", slug: "getting-started/authentication" },
          ],
        },
        {
          label: "Commands",
          items: [
            { label: "Auth", slug: "commands/auth" },
            { label: "Repo", slug: "commands/repo" },
            { label: "PR", slug: "commands/pr" },
            { label: "Config", slug: "commands/config" },
          ],
        },
      ],
    }),
  ],
});
