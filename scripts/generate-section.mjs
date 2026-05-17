#!/usr/bin/env node

/**
 * Scaffolds a new section component.
 *
 * Usage:
 *   node scripts/generate-section.mjs <SectionName>
 *
 * Example:
 *   node scripts/generate-section.mjs Features
 *   -> components/FeaturesSection.tsx
 *
 * After running, you still need to:
 *   1. Add the content type and defaults in content/content.ts
 *   2. Import and render the section in app/page.tsx
 */

import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const name = process.argv[2];
if (!name) {
  console.error("Usage: node scripts/generate-section.mjs <SectionName>");
  process.exit(1);
}

const componentDir = resolve(root, "components");
if (!existsSync(componentDir)) mkdirSync(componentDir, { recursive: true });

const fileName = `${name}Section.tsx`;
const filePath = resolve(componentDir, fileName);

if (existsSync(filePath)) {
  console.error(`${fileName} already exists — aborting.`);
  process.exit(1);
}

const contentKey = name.charAt(0).toLowerCase() + name.slice(1);

const template = `import { getContent } from "@/content/content";

export const ${name}Section = () => {
  // TODO: add ${contentKey} to SiteContent type in content/content.ts
  // const { ${contentKey} } = getContent();

  return (
    <section id="${name.toLowerCase()}" className="py-24 px-8 sm:px-16 sm:py-32">
      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
        ${name}
      </h2>
      <p className="text-slate-500 dark:text-slate-400">
        Replace this with your ${name.toLowerCase()} content.
      </p>
    </section>
  );
};
`;

writeFileSync(filePath, template, "utf-8");
console.log(`Created ${fileName}`);
console.log("");
console.log("Next steps:");
console.log(\`  1. Add \${contentKey} type and defaults to content/content.ts\`);
console.log(\`  2. Import and render <\${name}Section /> in app/page.tsx\`);
