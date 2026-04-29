---
title: Logging tools
summary: console.log / info / warn / error / debug.
---

`console.log` is the workhorse, but it has siblings.

| Method | When to use |
|---|---|
| `console.log` | Default informational output |
| `console.info` | Informational, often shown the same as `log` |
| `console.warn` | Something looks suspicious but the program continues |
| `console.error` | Something went wrong — usually shown in red |
| `console.debug` | Detailed traces; often filtered out by default |

## Filtering

Tish honors the `TISH_LOG_LEVEL` environment variable. Setting it to `warn` hides `log`, `info`, and `debug` — leaving only `warn` and `error`.

```bash
TISH_LOG_LEVEL=warn tish run app.tish
```

This is gold for **noisy programs in production**: leave the debug logs in the code, but raise the threshold so end users don't see them.

## Capstone: instrument a function

Add appropriate log levels to the function below: `info` when it starts, `warn` if balance is low, `error` if balance would go negative, `log` for normal operations.

:::tryit{code="fn withdraw(balance, amount) {\n  console.info(\"withdraw called with\", amount)\n  if (amount > balance) {\n    console.error(\"would overdraw, refusing\")\n    return balance\n  }\n  if (balance - amount < 10) {\n    console.warn(\"balance running low\")\n  }\n  console.log(\"withdrew\", amount)\n  return balance - amount\n}\n\nlet b = 100\nb = withdraw(b, 30)\nb = withdraw(b, 65)\nb = withdraw(b, 10)\nconsole.log(\"final:\", b)"}

:::quiz{id=28-log-q1}
- prompt: Which method should you use when something is unusual but not broken?
- options: ["console.log", "console.warn", "console.error"]
- answer: console.warn
:::
