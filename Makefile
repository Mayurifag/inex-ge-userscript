.PHONY: install dev build lint format ci clean

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

ci: install lint format build

clean:
	rm -rf node_modules dist
