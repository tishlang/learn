#!/bin/bash
set -e

echo "=> Setting up Vercel build environment for tish-learn..."

# Ensure we use the locally installed tish and just
export PATH="$PWD/node_modules/.bin:$PATH"

# Setup Rust and wasm-bindgen if not present
if ! command -v rustc &> /dev/null; then
    echo "=> Installing Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain stable
    source $HOME/.cargo/env
fi
rustup target add wasm32-unknown-unknown

if ! command -v wasm-bindgen &> /dev/null; then
    echo "=> Installing wasm-bindgen-cli..."
    cargo install wasm-bindgen-cli
fi

echo "=> Running just build..."
export PATH="$HOME/.cargo/bin:$PATH"
export TISH_ROOT="$PWD/node_modules/@tishlang/tish"
just build
