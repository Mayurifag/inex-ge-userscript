.PHONY: install dev build lint stylelint format ci clean readme-screenshot

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

format:
	npx prettier --check .

ci: lint stylelint format build

clean:
	rm -rf node_modules dist

# Requires npm run dev running and you logged into inex.ge in the MCP Chrome profile.
readme-screenshot:
	claude -p --dangerously-skip-permissions "$$(cat scripts/readme-screenshot.md)"
