
SRCS = $(wildcard lib/** bin/**)

all: dist

node_modules: yarn.lock
	yarn install

yarn.lock: package.json
	yarn install --frozen-lockfile

.PHONY: node_modules clean
clean:
	yarn tsc -b --clean 

.PHONY: node_modules test
test:
	NODE_OPTIONS=--experimental-vm-modules yarn jest 

dist: node_modules tsconfig.json $(SRCS)
	yarn tsc
	chmod +x dist/bin/*.js

.PHONY: dev
dev: node_modules dist
	yarn tsc -w
	