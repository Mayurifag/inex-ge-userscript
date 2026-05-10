.PHONY: install dev build lint test stylelint smoke format ci clean readme-screenshot

install:
	npm ci

dev:
	npm run dev

build:
	npm run build

lint:
	npx eslint .

stylelint:
	npm run stylelint

test:
	npm test

format:
	npx prettier --check .

smoke:
	npm run smoke:build

ci: lint test stylelint format build smoke

clean:
	rm -rf node_modules dist

# Requires npm run dev running and you logged into inex.ge in the MCP Chrome profile.
readme-screenshot:
	claude -p --dangerously-skip-permissions "$$(cat scripts/readme-screenshot.md)"
