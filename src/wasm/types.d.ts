declare global {
  interface Window {
    Go: {
      new(): {
        run(instance: WebAssembly.Instance): Promise<void>;
        importObject: WebAssembly.Imports;
      };
    };
  }
}

 
export declare function initialize(wasmURL: string): Promise<Error|undefined>;

export declare function teardown(): void;