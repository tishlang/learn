---
title: Deploy
summary: zectre, Docker, single binaries, JS / WASM / WASI targets.
---

You've built it; now ship it.

## Single binary (the easy path)

```bash
tish build app.tish -o app --feature http --feature fs --feature process
./app
```

Self-contained. Copy to any machine of the same OS/arch, run. Done.

For cross-compilation, build inside a Docker image with the target toolchain.

## zectre.yaml

**zectre** is the Tish-native deploy CLI (sibling repo, sibling tooling). Declarative config:

```yaml
project: my-app
build:
  features: [http, fs]
deploy:
  target: server
  host: my-vps.example.com
```

`zectre deploy` builds the binary, copies it to the host, runs it under a supervisor.

## Docker

```dockerfile
FROM tishlang/tish:latest AS build
WORKDIR /app
COPY . .
RUN tish build server.tish -o server --feature http --feature fs

FROM debian:slim
COPY --from=build /app/server /usr/local/bin/server
EXPOSE 8080
CMD ["server"]
```

The runtime image only needs glibc — the binary is statically linked otherwise.

## JS target on Cloudflare Workers / Vercel / Deno

```bash
tish build app.tish -o app.js --target js
```

The output is a plain ESM module. For Workers, write a thin wrapper that calls into your handler.

## WASM/WASI

```bash
tish build app.tish -o app.wasm --target wasi --feature http
```

Runs anywhere a WASI runtime exists — wasmtime, edge runtimes that use WASI.

## Exercise: ship the Capstones blog server

The Capstones C3 (static blog generator) compiles to a single static site you can host anywhere. The C4 (REST API) compiles to a Tish binary you can deploy as a daemon. The "take it real" appendix in each capstone walks through the deploy commands; this chapter is the explainer.

:::quiz{id=28-deploy-q1}
- prompt: For a Cloudflare Worker deployment, which build target?
- options: [native rust, --target js, --target wasm]
- answer: --target js
:::

That's the Tish-deep tour. Onwards to the Capstones for full multi-chapter projects.
