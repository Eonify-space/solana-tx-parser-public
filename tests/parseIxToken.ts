import { Connection } from "@solana/web3.js";
import { ParsedInstruction, SolanaParser } from "../src";
import { Idl } from "@project-serum/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

const SPL_TOKEN_PROGRAM_PARSER = new SolanaParser([])

async function runSPLTest() {
    const connection = new Connection("https://api.mainnet-beta.solana.com");
    const txn = await connection.getTransaction(
      "45Ynvza4zymEJW3xegdfFTUayMo7ESTJWJfAncMrWQVavP8bRCsGoD253pdqbiSbq5pnP3NzYt7JWkq7BG8hQRo8",
      { maxSupportedTransactionVersion: 0 }
    );    
  
    let parsedInnerIxs:ParsedInstruction<Idl, string>[]

    if(txn === undefined || null) return
    
    if (txn){
    parsedInnerIxs = SPL_TOKEN_PROGRAM_PARSER.parseTransactionWithInnerInstructions(txn);

    // Filter instructions related to SPL Token program
    const splTokenIxs = parsedInnerIxs.filter((ix) =>
        ix.programId.equals(TOKEN_PROGRAM_ID)
      );
    
    console.log(splTokenIxs)


}
  
  
   
  
    
}

runSPLTest()