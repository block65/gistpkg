
SRCS = $(wildcard lib/** bin/**)

all: dist

.PHONY: clean
clean:
	yarn tsc -b --clean 

.PHONY: test
test:
	NODE_OPTIONS=--experimental-vm-modules yarn jest 

dist: tsconfig.json $(SRCS)
	yarn tsc
	chmod +x dist/bin/*.js

.PHONY: dev
dev: dist
	yarn tsc -w
	