REPORTER = spec

watch-test:
	supervisor -n exit -w lib,test -e txt,js -x make -- test -B -s

watch-cov:
	supervisor -n exit -w lib,test -e txt,js -x make -- test-cov -B -s

test: lint test-only

lintfiles := *.js *.json lib test

lint: node_modules
	@./node_modules/.bin/jshint --verbose --extra-ext=.js,.json $(lintfiles)

test-only: lib
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER)
	@touch test

test-cov=coverage.html
coverage.html: lib-cov test
	@EXPRESS_COV=1 $(MAKE) --no-print-directory test -B REPORTER=html-cov > coverage.html
	@touch coverage.html

lib-cov: lib
	@jscoverage --no-highlight lib lib-cov
	@touch lib-cov

.PHONY: test-cov

