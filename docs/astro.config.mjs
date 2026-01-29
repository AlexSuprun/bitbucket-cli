import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
  site: "https://bitbucket-cli.paulvanderlei.com",
  integrations: [
    starlight({
      title: "Bitbucket CLI",
      description: "A powerful command-line interface for Bitbucket Cloud. Clone repos, manage PRs, and automate workflows — all from your terminal.",
      components: {
        Head: './src/components/Head.astro',
      },
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
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/0pilatos0/bitbucket-cli",
        },
      ],
      sidebar: [
        {
          label: "Getting Started",
          items: [
            { label: "Quick Start", slug: "getting-started/quickstart" },
            { label: "Installation", slug: "getting-started/installation" },
            { label: "Authentication", slug: "getting-started/authentication" },
          ],
        },
        {
          label: "Command Reference",
          items: [
            { label: "Auth Commands", slug: "commands/auth" },
            { label: "Repo Commands", slug: "commands/repo" },
            { label: "PR Commands", slug: "commands/pr" },
            { label: "Config Commands", slug: "commands/config" },
            { label: "Completion", slug: "commands/completion" },
          ],
        },
        {
          label: "Guides",
          items: [
            { label: "Repository Context", slug: "guides/repository-context" },
            { label: "Scripting & Automation", slug: "guides/scripting" },
            { label: "CI/CD Integration", slug: "guides/cicd" },
            { label: "AI Agent Integration", slug: "guides/ai-agents" },
          ],
        },
        {
          label: "Reference",
          items: [
            { label: "Environment Variables", slug: "reference/environment-variables" },
            { label: "JSON Output", slug: "reference/json-output" },
            { label: "Error Codes", slug: "reference/error-codes" },
            { label: "Configuration File", slug: "reference/configuration" },
          ],
        },
        {
          label: "Help",
          items: [
            { label: "Troubleshooting", slug: "help/troubleshooting" },
            { label: "FAQ", slug: "help/faq" },
          ],
        },
      ],
    }),
  ],
});
