import { useWasmService } from "./usewasm";


export const What=()=>{

    const {
	 
		isLoaded,
		err,
	} = useWasmService();


   
    return(
        <div>
            <h1>What</h1>
            <p>isLoaded: {isLoaded.toString()}</p>
            <p>err: {`${err}`}</p>

         
        </div>


    )
}