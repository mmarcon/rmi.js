.PHONY: example

all:
	cd build; node build.js

example:
	cd example; bash run.sh
