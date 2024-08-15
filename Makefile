GOOS := js
GOARCH := wasm
GO_DIR := go
SRC_FILE := $(GO_DIR)/main.go
WASM_FILE := $(GO_DIR)/main.wasm
WASM_EXEC_JS := $(shell go env GOROOT)/misc/wasm/wasm_exec.js

.PHONY: all build-wasm   clean

all: build-wasm  clean

build-wasm: $(WASM_FILE).gz


$(WASM_FILE):
	cd $(GO_DIR) && GOOS=$(GOOS) GOARCH=$(GOARCH) go build -ldflags="-s -w" -o $(notdir $(WASM_FILE)) $(notdir $(SRC_FILE))
	wasm-opt -O $@ -o $@ --enable-bulk-memory

$(WASM_FILE).gz: $(WASM_FILE)
	
 

	rm -f $(WASM_FILE).gz
	gzip -9 -k $< 
	cp $<.gz src/wasm

# copy-wasm-exec:
# 	cp $(WASM_EXEC_JS) src/

 

clean:
	rm -f $(WASM_FILE).gz