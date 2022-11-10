import express from "express";
import { readFileSync } from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { createServer } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));
const __client = readFileSync(`${__dirname}/../web/client.js`, "utf-8");

export default async function () {
	const app = express();
	const vite = await createServer({
		server: { middlewareMode: true },
		appType: "custom",
	});
	vite.middlewares.use(async (request, response, next) => {
		console.info(`${request.method} ${request.url}`);
		await next();
	});
	vite.middlewares.use(async (request, response, next) => {
		if (request.url === "/_client") {
			response.setHeader("Content-Type", "text/javascript");
			response.end(__client);
		} else {
			await next();
		}
	});
	app.use(vite.middlewares);
	app.use("*", async (req, res, next) => {
		const url = req.originalUrl;
		try {
			const { render } = await vite.ssrLoadModule(`${__dirname}/../web/server`);
			const html = await render(url);
			html.pipe(res);
		} catch (error) {
			vite.ssrFixStacktrace(error as Error);
			next(error);
		}
	});
	console.log("Server running at http://localhost:7777");
	app.listen(7777);
}
