import fs from "node:fs";
import path from "node:path";

function getDate(): string {
	const today = new Date();
	const year = today.getFullYear();
	const month = String(today.getMonth() + 1).padStart(2, "0");
	const day = String(today.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
}

const args: string[] = process.argv.slice(2);

if (args.length === 0) {
	console.error(`Error: No filename argument provided. 
Usage: bun run new-post -- <filename>`);
	process.exit(1);
}

let fileName: string = args[0];

const forbiddenExtensions = /\.(md|mdoc)$/i;
if (forbiddenExtensions.test(fileName)) {
	console.error(
		"Error: Creating .md or .mdoc files is not allowed. Please use .mdx instead.",
	);
	process.exit(1);
}

if (!fileName.toLowerCase().endsWith(".mdx")) {
	fileName += ".mdx";
}

const targetDir = "./src/content/posts/";
const fullPath: string = path.join(targetDir, fileName);

if (fs.existsSync(fullPath)) {
	console.error(`Error: File ${fullPath} already exists. `);
	process.exit(1);
}

const dirPath: string = path.dirname(fullPath);
if (!fs.existsSync(dirPath)) {
	fs.mkdirSync(dirPath, { recursive: true });
}

const content: string = `---
title: ""
published: ${getDate()}
image: ""
tags: 
  - ""
category: ""
---
`;

fs.writeFileSync(path.join(targetDir, fileName), content);

console.log(`Post ${fullPath} created.`);
