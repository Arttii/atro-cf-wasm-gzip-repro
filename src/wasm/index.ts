import type * as types from "./types.js";
import "./wasm_exec.js";
 

interface Service {
 
}

let initializePromise: Promise<Service> | undefined;
let longLivedService: Service | undefined;

export const teardown: typeof types.teardown = () => {
  initializePromise = undefined;
  longLivedService = undefined;
  (globalThis as any)["wasm"] = undefined;
};

export const initialize: typeof types.initialize = async (wasmURL: string) => {
  try {
    if (!initializePromise) {
      initializePromise = startRunningService(wasmURL).catch((err) => {
        // Let the caller try again if this fails.
        initializePromise = void 0;
        // But still, throw the error back up the caller.
        throw err;
      });
    }
    longLivedService = longLivedService || (await initializePromise);
    return undefined;
  } catch (e) {
    console.error(e);
    return e as Error;
  }
};

const ensureServiceIsRunning = (): Service => {
  if (!initializePromise)
    throw new Error('You need to call "initialize" before calling this');
  if (!longLivedService)
    throw new Error(
      'You need to wait for the promise returned from "initialize" to be resolved before calling this'
    );
  return longLivedService;
};

const instantiateWASM = async (
  wasmURL: string,
  importObject: Record<string, any>
): Promise<WebAssembly.WebAssemblyInstantiatedSource> => {
  if (WebAssembly.instantiateStreaming) {
    return await WebAssembly.instantiateStreaming(
      fetch(wasmURL, {
        headers: {
          "Accept-Encoding": "identity",
        },
      }),
      importObject
    );
  } else {
    const fetchAndInstantiateTask = async () => {
      const response = await fetch(wasmURL);
      const wasmArrayBuffer = await response.arrayBuffer();
      return WebAssembly.instantiate(wasmArrayBuffer, importObject);
    };
    return await fetchAndInstantiateTask();
  }
};
const startRunningService = async (wasmURL: string): Promise<Service> => {
  const go = new window.Go();
  const wasm = await instantiateWASM(wasmURL, go.importObject);
  go.run(wasm.instance);

  const service: any = (globalThis as any)["wasm"];

  return {
    getBuiltinFunctions: () =>
      new Promise((resolve) =>
        resolve(JSON.parse(service.getBuiltinFunctions()))
      ),
    getCustomFunctions: () =>
      new Promise((resolve) =>
        resolve(JSON.parse(service.getCustomFunctions()))
      ),
    evaluateExpression: (expression: string) =>
      new Promise((resolve) =>
        resolve(JSON.parse(service.evaluateExpression(expression || "")))
      ),
  };
};
