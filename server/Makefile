PROJECT = "Cognitio Idea Service"
REPORTER = spec
TESTS = ./test/integration/*.js

# all:	install test server

test:	;@echo "Testing ${PROJECT} ...."; 
	@NODE_ENV=test ./node_modules/.bin/mocha \
	--reporter $(REPORTER) \
	$(TESTS)

server:	;@echo "Starting ${PROJECT} ...."; 
				export NODE_PATH=.;	\
				node app.js

install:	;@echo "Installing ${PROJECT} ...."; \
				npm install

update:	;@echo "Updating ${PROJECT} ...."; \
				git pull --rebase; \
				npm install

clean:	;
				rm -rf node_modules

.PHONY:	test server install clean update
