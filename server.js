import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { build as esbuild } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { serveStatic } from '@hono/node-server/serve-static';
import * as ReactServerDom from 'react-server-dom-webpack/server.browser'
import { createElement } from 'react';
import { readFile, writeFile } from 'node:fs/promises';
import { parse } from 'es-module-lexer';
import { relative } from 'node:path';

const app = new Hono();
const clientComponentMap = {};

app.get('/', async (c) => {
	return c.html(
		`<!DOCTYPE html>
		<html>
			<head>
				<title>RSC try out</title>
				<script src="https://cdn.tailwindcss.com"></script>
			</head>
			<body>
				<div id="root"></div>
				<script type="module" src="/build/_client.js"></script>
			</body>
		</html>`
	)
});

// make client can get /build/_client.js file
app.use('/build/*', serveStatic())

app.get('/rsc', async (c) => {
	const Page = await import('./build/page.js');
	const stream = ReactServerDom.renderToReadableStream(createElement(Page.default), clientComponentMap);
	return new Response(stream);
});

serve(app, async (info) => {
	await build();
	console.log(`Listening on http://localhost:${info.port}`);
})

async function build() {
	const clientEntryPoints = new Set();

	await esbuild({
		bundle: true,
		format: 'esm',
		logLevel: 'info',
		entryPoints: [resolveApp('page.jsx')],
		outdir: resolveBuild(),
		packages: 'external',
		plugins: [
			{
				name: 'resolve-client-imports',
				setup(build) {
					build.onResolve({ filter: /\.jsx$/ }, async ({ path: relativePath }) => {
						const path = resolveApp(relativePath);
						const contents = await readFile(path, 'utf8');

						
						if (contents.startsWith("'use client'")) {
							console.log('contents =>', contents)
							clientEntryPoints.add(path);
							return {
								external: true,
								path: relativePath.replace('.jsx', '.js'),
							}
						}
					});
				}
			}
		],
	});

	const { outputFiles } = await esbuild({
		bundle: true,
		format: 'esm',
		logLevel: 'info',
		entryPoints: [resolveApp('_client.jsx'), ...clientEntryPoints],
		outdir: resolveBuild(),
		// don't include the packages: 'external', so browser can load the packages
		splitting: true,
		plugins: [],
		// write property: https://esbuild.github.io/api/#write
		// do not write to the file system directly, we will process the output files on our own
		write: false,
	});

	// console.log('outputFiles =>', outputFiles);

	outputFiles.forEach(async (file) => {
		const [, exports] = parse(file.text);
		let newContents = file.text;

		for (const exp of exports) {
			const key = file.path + exp.n;

			clientComponentMap[key] = {
				id: `/build/${relative(resolveBuild(), file.path)}`, // the path on the server, /build/Like.js for example
				name: exp.n, // export name
				chunks: [], // the chunks that contain the export
				async: true, // import this component through the network as soon as it hit the browser
			}

			// for every component
			// add $$typeof to clarity it is client component, need to treat it differently
			// add $$id to make browser can use $$id to find the component, and server can get meta data from clientComponentMap when browser require
			newContents += `
${exp.ln}.$$typeof = Symbol.for('react.client.reference');
${exp.ln}.$$id = ${JSON.stringify(key)};
			`
		}

		await writeFile(file.path, newContents);
	});
}

const appDir = new URL('./app/', import.meta.url)
const buildDir = new URL('./build/', import.meta.url)

function resolveApp(path = '') {
	return fileURLToPath(new URL(path, appDir));
}

function resolveBuild(path = '') {
	return fileURLToPath(new URL(path, buildDir));
}

