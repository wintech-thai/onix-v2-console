start:
	@@cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/
	@@node .next/standalone/server.js

build:
	@@pnpm run build

run: build start
