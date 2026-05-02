.PHONY: install lint format ci clean

install:
	npm ci

lint:
	npx eslint .

format:
	npx prettier --check .

ci: install lint format

clean:
	rm -rf node_modules
