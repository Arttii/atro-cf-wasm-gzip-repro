import { useState, useEffect } from 'react';
import { initialize,  } from '../wasm';
 
import wasmUrl from '../wasm/main.wasm.gz?url';

 


interface WasmService {
  isLoaded: boolean;
 
}

 

const initializeWasmService = async (url:string): Promise<[WasmService|undefined, Error | undefined]> => {
  

  const err = await initialize(url);

  if (err) {
    return [undefined, err];
  }
 

  const wasmService = {
    isLoaded: true,
 
  };

  return [wasmService, undefined];
};

interface UseWasmService extends WasmService {
  err: Error | undefined;
}

export const useWasmService = (): UseWasmService => {
  const [service, setService] = useState<WasmService>({
    isLoaded: false,
    
  });

  const [err, setErr] = useState<Error | undefined>(undefined);

  useEffect(() => {
    initializeWasmService(wasmUrl).then(([svc, err]) => {
      if (svc) {
        setService(svc);
      }
      if (err) {
        setErr(err);
      }
    });
  }, []);

  return { ...service, err };
};



 