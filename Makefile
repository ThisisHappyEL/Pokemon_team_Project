install:
	npm ci

publish:
	npm publish --dry-run

lint:
	npx eslint .

lint-fix:
	npx eslint --fix .

package.json-fix:
	npm run format:package

package-lock.json-fix:
	npm run format:package-lock

html-lint:
	npx htmlhint index.html