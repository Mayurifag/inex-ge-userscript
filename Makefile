.PHONY: install dev build lint format ci clean readme-screenshot

install:
	npm ci

dev:
	npm run dev

build:
	npm run build

lint:
	npx eslint .

format:
	npx prettier --check .

ci: lint format build

clean:
	rm -rf node_modules dist

# Requires npm run dev running and you logged into inex.ge in the MCP Chrome profile.
readme-screenshot:
	claude -p --dangerously-skip-permissions "$$(cat scripts/readme-screenshot.md)"
