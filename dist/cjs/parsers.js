"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SolanaParser = void 0;
const tslib_1 = require("tslib");
const buffer_1 = require("buffer");
const web3_js_1 = require("@solana/web3.js");
const spl = tslib_1.__importStar(require("@solana/spl-token"));
const anchor_1 = require("@project-serum/anchor");
const buffer_layout_1 = require("@solana/buffer-layout");
const helpers_1 = require("./helpers");
const token_extensions_1 = require("./programs/token-extensions");
const MEMO_PROGRAM_V1 = "Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo";
const MEMO_PROGRAM_V2 = "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr";
function decodeSystemInstruction(instruction) {
    const ixType = web3_js_1.SystemInstruction.decodeInstructionType(instruction);
    let parsed;
    switch (ixType) {
        case "AdvanceNonceAccount": {
            const decoded = web3_js_1.SystemInstruction.decodeNonceAdvance(instruction);
            parsed = {
                name: "advanceNonceAccount",
                accounts: [
                    { name: "nonce", pubkey: decoded.noncePubkey, isSigner: false, isWritable: true },
                    { name: "recentBlockhashSysvar", ...instruction.keys[1] },
                    { name: "nonceAuthority", pubkey: decoded.authorizedPubkey, isSigner: true, isWritable: false },
                ],
                args: {},
            };
            break;
        }
        case "Allocate": {
            const decoded = web3_js_1.SystemInstruction.decodeAllocate(instruction);
            parsed = {
                name: "allocate",
                accounts: [{ name: "newAccount", pubkey: decoded.accountPubkey, isSigner: true, isWritable: true }],
                args: { space: new anchor_1.BN(decoded.space) },
            };
            break;
        }
        case "AllocateWithSeed": {
            const decoded = web3_js_1.SystemInstruction.decodeAllocateWithSeed(instruction);
            parsed = {
                name: "allocateWithSeed",
                accounts: [
                    { name: "newAccount", pubkey: decoded.accountPubkey, isSigner: false, isWritable: true },
                    { name: "base", pubkey: decoded.basePubkey, isSigner: true, isWritable: false },
                ],
                args: {
                    seed: decoded.seed,
                    space: new anchor_1.BN(decoded.space),
                    owner: decoded.programId,
                    base: decoded.basePubkey,
                },
            };
            break;
        }
        case "Assign": {
            const decoded = web3_js_1.SystemInstruction.decodeAssign(instruction);
            parsed = {
                name: "assign",
                accounts: [{ name: "assignedAccount", pubkey: decoded.accountPubkey, isSigner: true, isWritable: true }],
                args: { owner: decoded.programId },
            };
            break;
        }
        case "AssignWithSeed": {
            const decoded = web3_js_1.SystemInstruction.decodeAssignWithSeed(instruction);
            parsed = {
                name: "assignWithSeed",
                accounts: [
                    { name: "assigned", pubkey: decoded.accountPubkey, isSigner: false, isWritable: true },
                    { name: "base", pubkey: decoded.basePubkey, isSigner: true, isWritable: false },
                ],
                args: {
                    seed: decoded.seed, // string
                    owner: decoded.programId,
                    base: decoded.basePubkey,
                },
            };
            break;
        }
        case "AuthorizeNonceAccount": {
            const decoded = web3_js_1.SystemInstruction.decodeNonceAuthorize(instruction);
            parsed = {
                name: "authorizeNonceAccount",
                accounts: [
                    { name: "nonce", isSigner: false, isWritable: true, pubkey: decoded.noncePubkey },
                    { name: "nonceAuthority", isSigner: true, isWritable: false, pubkey: decoded.authorizedPubkey },
                ],
                args: { authorized: decoded.newAuthorizedPubkey },
            };
            break;
        }
        case "Create": {
            const decoded = web3_js_1.SystemInstruction.decodeCreateAccount(instruction);
            parsed = {
                name: "createAccount",
                accounts: [
                    { name: "payer", pubkey: decoded.fromPubkey, isSigner: true, isWritable: true },
                    { name: "newAccount", pubkey: decoded.newAccountPubkey, isSigner: true, isWritable: true },
                ],
                args: { lamports: new anchor_1.BN(decoded.lamports), owner: decoded.programId, space: new anchor_1.BN(decoded.space) },
            };
            break;
        }
        case "CreateWithSeed": {
            const decoded = web3_js_1.SystemInstruction.decodeCreateWithSeed(instruction);
            parsed = {
                name: "createAccountWithSeed",
                accounts: [
                    { name: "payer", pubkey: decoded.fromPubkey, isSigner: true, isWritable: true },
                    { name: "created", pubkey: decoded.newAccountPubkey, isSigner: false, isWritable: true },
                    { name: "base", pubkey: decoded.basePubkey, isSigner: true, isWritable: false },
                ],
                args: {
                    lamports: new anchor_1.BN(decoded.lamports),
                    owner: decoded.programId,
                    space: new anchor_1.BN(decoded.space),
                    seed: decoded.seed,
                    base: decoded.basePubkey,
                },
            };
            break;
        }
        case "InitializeNonceAccount": {
            const decoded = web3_js_1.SystemInstruction.decodeNonceInitialize(instruction);
            parsed = {
                name: "initializeNonceAccount",
                accounts: [
                    { name: "nonce", pubkey: decoded.noncePubkey, isSigner: false, isWritable: true },
                    { name: "recentBlockhashSysvar", ...instruction.keys[1] },
                    { name: "rentSysvar", ...instruction.keys[2] },
                ],
                args: { authorized: decoded.authorizedPubkey },
            };
            break;
        }
        case "Transfer": {
            const decoded = web3_js_1.SystemInstruction.decodeTransfer(instruction);
            parsed = {
                name: "transfer",
                accounts: [
                    { name: "sender", pubkey: decoded.fromPubkey, isSigner: true, isWritable: true },
                    { name: "receiver", pubkey: decoded.toPubkey, isWritable: true, isSigner: false },
                ],
                args: { lamports: new anchor_1.BN(decoded.lamports.toString()) },
            };
            break;
        }
        case "TransferWithSeed": {
            const decoded = web3_js_1.SystemInstruction.decodeTransferWithSeed(instruction);
            parsed = {
                name: "transferWithSeed",
                accounts: [
                    { name: "sender", pubkey: decoded.fromPubkey, isSigner: false, isWritable: true },
                    { name: "base", pubkey: decoded.basePubkey, isSigner: true, isWritable: false },
                    { name: "receiver", pubkey: decoded.toPubkey, isSigner: false, isWritable: true },
                ],
                args: { owner: decoded.programId, lamports: new anchor_1.BN(decoded.lamports.toString()), seed: decoded.seed },
            };
            break;
        }
        case "WithdrawNonceAccount": {
            const decoded = web3_js_1.SystemInstruction.decodeNonceWithdraw(instruction);
            parsed = {
                name: "withdrawNonceAccount",
                accounts: [
                    { name: "nonce", pubkey: decoded.noncePubkey, isSigner: false, isWritable: true },
                    { name: "recepient", pubkey: decoded.toPubkey, isSigner: false, isWritable: true },
                    { name: "recentBlockhashSysvar", ...instruction.keys[2] },
                    { name: "rentSysvar", ...instruction.keys[3] },
                    { name: "nonceAuthority", pubkey: decoded.noncePubkey, isSigner: true, isWritable: false },
                ],
                args: { lamports: new anchor_1.BN(decoded.lamports) },
            };
            break;
        }
        default: {
            parsed = null;
        }
    }
    return parsed
        ? {
            ...parsed,
            programId: web3_js_1.SystemProgram.programId,
        }
        : {
            programId: web3_js_1.SystemProgram.programId,
            name: "unknown",
            accounts: instruction.keys,
            args: { unknown: instruction.data },
        };
}
function decodeTokenInstruction(instruction) {
    let parsed;
    const decoded = (0, buffer_layout_1.u8)().decode(instruction.data);
    switch (decoded) {
        case spl.TokenInstruction.InitializeMint: {
            let decodedIx;
            try {
                decodedIx = spl.decodeInitializeMintInstruction(instruction);
            }
            catch (error) {
                decodedIx = spl.decodeInitializeMintInstructionUnchecked(instruction);
            }
            parsed = {
                name: "initializeMint",
                accounts: [
                    { name: "tokenMint", ...decodedIx.keys.mint },
                    { name: "rentSysvar", ...decodedIx.keys.rent },
                ],
                args: { decimals: decodedIx.data.decimals, mintAuthority: decodedIx.data.mintAuthority, freezeAuthority: decodedIx.data.freezeAuthority },
            };
            break;
        }
        case spl.TokenInstruction.InitializeAccount: {
            let decodedIx;
            try {
                decodedIx = spl.decodeInitializeAccountInstruction(instruction);
            }
            catch (error) {
                decodedIx = spl.decodeInitializeAccountInstructionUnchecked(instruction);
            }
            parsed = {
                name: "initializeAccount",
                accounts: [
                    { name: "newAccount", ...decodedIx.keys.account },
                    { name: "tokenMint", ...decodedIx.keys.mint },
                    { name: "owner", ...decodedIx.keys.owner },
                    { name: "rentSysvar", ...decodedIx.keys.rent },
                ],
                args: {},
            };
            break;
        }
        case spl.TokenInstruction.InitializeMultisig: {
            let decodedIx;
            try {
                decodedIx = spl.decodeInitializeMultisigInstruction(instruction);
            }
            catch (error) {
                decodedIx = spl.decodeInitializeMultisigInstructionUnchecked(instruction);
            }
            const multisig = decodedIx.keys.signers.map((meta, idx) => ({ name: `signer_${idx}`, ...meta }));
            parsed = {
                name: "initializeMultisig",
                accounts: [{ name: "multisig", ...decodedIx.keys.account }, { name: "rentSysvar", ...decodedIx.keys.rent }, ...multisig],
                args: { m: decodedIx.data.m },
            };
            break;
        }
        case spl.TokenInstruction.Transfer: {
            let decodedIx;
            try {
                decodedIx = spl.decodeTransferInstruction(instruction);
            }
            catch (error) {
                decodedIx = spl.decodeTransferInstructionUnchecked(instruction);
            }
            const multisig = decodedIx.keys.multiSigners.map((meta, idx) => ({ name: `signer_${idx}`, ...meta }));
            parsed = {
                name: "transfer",
                accounts: [
                    { name: "source", ...decodedIx.keys.source },
                    { name: "destination", ...decodedIx.keys.destination },
                    { name: "owner", ...decodedIx.keys.owner },
                    ...multisig,
                ],
                args: { amount: new anchor_1.BN(decodedIx.data.amount.toString()) },
            };
            break;
        }
        case spl.TokenInstruction.Approve: {
            let decodedIx;
            try {
                decodedIx = spl.decodeApproveInstruction(instruction);
            }
            catch (error) {
                decodedIx = spl.decodeApproveInstructionUnchecked(instruction);
            }
            const multisig = decodedIx.keys.multiSigners.map((meta, idx) => ({ name: `signer_${idx}`, ...meta }));
            parsed = {
                name: "approve",
                accounts: [
                    { name: "source", ...decodedIx.keys.account },
                    { name: "delegate", ...decodedIx.keys.delegate },
                    { name: "owner", ...decodedIx.keys.owner },
                    ...multisig,
                ],
                args: { amount: new anchor_1.BN(decodedIx.data.amount.toString()) },
            };
            break;
        }
        case spl.TokenInstruction.Revoke: {
            let decodedIx;
            try {
                decodedIx = spl.decodeRevokeInstruction(instruction);
            }
            catch (error) {
                decodedIx = spl.decodeRevokeInstructionUnchecked(instruction);
            }
            const multisig = decodedIx.keys.multiSigners.map((meta, idx) => ({ name: `signer_${idx}`, ...meta }));
            parsed = {
                name: "revoke",
                accounts: [{ name: "source", ...decodedIx.keys.account }, { name: "owner", ...decodedIx.keys.owner }, ...multisig],
                args: {},
            };
            break;
        }
        case spl.TokenInstruction.SetAuthority: {
            let decodedIx;
            try {
                decodedIx = spl.decodeSetAuthorityInstruction(instruction);
            }
            catch (error) {
                decodedIx = spl.decodeSetAuthorityInstructionUnchecked(instruction);
            }
            const multisig = decodedIx.keys.multiSigners.map((meta, idx) => ({ name: `signer_${idx}`, ...meta }));
            parsed = {
                name: "setAuthority",
                accounts: [{ name: "account", ...decodedIx.keys.account }, { name: "currentAuthority", ...decodedIx.keys.currentAuthority }, ...multisig],
                args: { authorityType: decodedIx.data.authorityType, newAuthority: decodedIx.data.newAuthority },
            };
            break;
        }
        case spl.TokenInstruction.MintTo: {
            let decodedIx;
            try {
                decodedIx = spl.decodeMintToInstruction(instruction);
            }
            catch (error) {
                decodedIx = spl.decodeMintToInstructionUnchecked(instruction);
            }
            const multisig = decodedIx.keys.multiSigners.map((meta, idx) => ({ name: `signer_${idx}`, ...meta }));
            parsed = {
                name: "mintTo",
                accounts: [
                    { name: "tokenMint", ...decodedIx.keys.mint },
                    { name: "mintTo", ...decodedIx.keys.destination },
                    { name: "authority", ...decodedIx.keys.authority },
                    ...multisig,
                ],
                args: { amount: new anchor_1.BN(decodedIx.data.amount.toString()) },
            };
            break;
        }
        case spl.TokenInstruction.Burn: {
            let decodedIx;
            try {
                decodedIx = spl.decodeBurnInstruction(instruction);
            }
            catch (error) {
                decodedIx = spl.decodeBurnInstructionUnchecked(instruction);
            }
            const multisig = decodedIx.keys.multiSigners.map((meta, idx) => ({ name: `signer_${idx}`, ...meta }));
            parsed = {
                name: "burn",
                accounts: [
                    { name: "burnFrom", ...decodedIx.keys.account },
                    { name: "tokenMint", ...decodedIx.keys.mint },
                    { name: "owner", ...decodedIx.keys.owner },
                    ...multisig,
                ],
                args: { amount: new anchor_1.BN(decodedIx.data.amount.toString()) },
            };
            break;
        }
        case spl.TokenInstruction.CloseAccount: {
            let decodedIx;
            try {
                decodedIx = spl.decodeCloseAccountInstruction(instruction);
            }
            catch (error) {
                decodedIx = spl.decodeCloseAccountInstructionUnchecked(instruction);
            }
            const multisig = decodedIx.keys.multiSigners.map((meta, idx) => ({ name: `signer_${idx}`, ...meta }));
            parsed = {
                name: "closeAccount",
                accounts: [
                    { name: "account", ...decodedIx.keys.account },
                    { name: "destination", ...decodedIx.keys.destination },
                    { name: "owner", ...decodedIx.keys.authority },
                    ...multisig,
                ],
                args: {},
            };
            break;
        }
        case spl.TokenInstruction.FreezeAccount: {
            let decodedIx;
            try {
                decodedIx = spl.decodeFreezeAccountInstruction(instruction);
            }
            catch (error) {
                decodedIx = spl.decodeFreezeAccountInstructionUnchecked(instruction);
            }
            const multisig = decodedIx.keys.multiSigners.map((meta, idx) => ({ name: `signer_${idx}`, ...meta }));
            parsed = {
                name: "freezeAccount",
                accounts: [
                    { name: "account", ...decodedIx.keys.account },
                    { name: "tokenMint", ...decodedIx.keys.mint },
                    { name: "authority", ...decodedIx.keys.authority },
                    ...multisig,
                ],
                args: {},
            };
            break;
        }
        case spl.TokenInstruction.ThawAccount: {
            let decodedIx;
            try {
                decodedIx = spl.decodeThawAccountInstruction(instruction);
            }
            catch (error) {
                decodedIx = spl.decodeThawAccountInstructionUnchecked(instruction);
            }
            const multisig = decodedIx.keys.multiSigners.map((meta, idx) => ({ name: `signer_${idx}`, ...meta }));
            parsed = {
                name: "thawAccount",
                accounts: [
                    { name: "account", ...decodedIx.keys.account },
                    { name: "tokenMint", ...decodedIx.keys.mint },
                    { name: "authority", ...decodedIx.keys.authority },
                    ...multisig,
                ],
                args: {},
            };
            break;
        }
        case spl.TokenInstruction.TransferChecked: {
            const decodedIx = spl.decodeTransferCheckedInstruction(instruction);
            const multisig = decodedIx.keys.multiSigners.map((meta, idx) => ({ name: `signer_${idx}`, ...meta }));
            parsed = {
                name: "transferChecked",
                accounts: [
                    { name: "source", ...decodedIx.keys.source },
                    { name: "tokenMint", ...decodedIx.keys.mint },
                    { name: "destination", ...decodedIx.keys.destination },
                    { name: "owner", ...decodedIx.keys.owner },
                    ...multisig,
                ],
                args: { amount: new anchor_1.BN(decodedIx.data.amount.toString()), decimals: decodedIx.data.decimals },
            };
            break;
        }
        case spl.TokenInstruction.ApproveChecked: {
            const decodedIx = spl.decodeApproveCheckedInstruction(instruction);
            const multisig = decodedIx.keys.multiSigners.map((meta, idx) => ({ name: `signer_${idx}`, ...meta }));
            parsed = {
                name: "approveChecked",
                accounts: [
                    { name: "source", ...decodedIx.keys.account },
                    { name: "tokenMint", ...decodedIx.keys.mint },
                    { name: "delegate", ...decodedIx.keys.delegate },
                    { name: "owner", ...decodedIx.keys.owner },
                    ...multisig,
                ],
                args: { amount: new anchor_1.BN(decodedIx.data.amount.toString()), decimals: decodedIx.data.decimals },
            };
            break;
        }
        case spl.TokenInstruction.MintToChecked: {
            const decodedIx = spl.decodeMintToCheckedInstruction(instruction);
            const multisig = decodedIx.keys.multiSigners.map((meta, idx) => ({ name: `signer_${idx}`, ...meta }));
            parsed = {
                name: "mintToChecked",
                accounts: [
                    { name: "tokenMint", ...decodedIx.keys.mint },
                    { name: "mintTo", ...decodedIx.keys.destination },
                    { name: "authority", ...decodedIx.keys.authority },
                    ...multisig,
                ],
                args: { amount: new anchor_1.BN(decodedIx.data.amount.toString()), decimals: decodedIx.data.decimals },
            };
            break;
        }
        case spl.TokenInstruction.BurnChecked: {
            const decodedIx = spl.decodeBurnCheckedInstruction(instruction);
            const multisig = decodedIx.keys.multiSigners.map((meta, idx) => ({ name: `signer_${idx}`, ...meta }));
            parsed = {
                name: "burnChecked",
                accounts: [
                    { name: "burnFrom", ...decodedIx.keys.account },
                    { name: "tokenMint", ...decodedIx.keys.mint },
                    { name: "owner", ...decodedIx.keys.owner },
                    ...multisig,
                ],
                args: { amount: new anchor_1.BN(decodedIx.data.amount.toString()), decimals: decodedIx.data.decimals },
            };
            break;
        }
        case spl.TokenInstruction.InitializeAccount2: {
            const initializeAccount2InstructionData = (0, buffer_layout_1.struct)([(0, buffer_layout_1.u8)("instruction"), (0, buffer_layout_1.blob)(32, "owner")]);
            const decodedIx = initializeAccount2InstructionData.decode(instruction.data);
            parsed = {
                name: "initializeAccount2",
                accounts: [
                    { name: "newAccount", ...instruction.keys[0] },
                    { name: "tokenMint", ...instruction.keys[1] },
                    { name: "rentSysvar", ...instruction.keys[2] },
                ],
                args: { authority: new web3_js_1.PublicKey(decodedIx.owner) },
            };
            break;
        }
        case spl.TokenInstruction.SyncNative: {
            parsed = {
                name: "syncNative",
                accounts: [{ name: "account", ...instruction.keys[0] }],
                args: {},
            };
            break;
        }
        case spl.TokenInstruction.InitializeAccount3: {
            const initializeAccount3InstructionData = (0, buffer_layout_1.struct)([(0, buffer_layout_1.u8)("instruction"), (0, buffer_layout_1.blob)(32, "owner")]);
            const decodedIx = initializeAccount3InstructionData.decode(instruction.data);
            parsed = {
                name: "initializeAccount3",
                accounts: [
                    { name: "newAccount", ...instruction.keys[0] },
                    { name: "tokenMint", ...instruction.keys[1] },
                ],
                args: { authority: new web3_js_1.PublicKey(decodedIx.owner) },
            };
            break;
        }
        case spl.TokenInstruction.InitializeMultisig2: {
            const multisig = instruction.keys.slice(1).map((meta, idx) => ({ name: `signer_${idx}`, ...meta }));
            parsed = {
                name: "initializeMultisig2",
                accounts: [{ name: "multisig", ...instruction.keys[0] }, ...multisig],
                args: { m: instruction.data[1] },
            };
            break;
        }
        case spl.TokenInstruction.InitializeMint2: {
            let decodedIx;
            try {
                decodedIx = spl.decodeInitializeMintInstruction(instruction);
            }
            catch (error) {
                decodedIx = spl.decodeInitializeMintInstructionUnchecked(instruction);
            }
            const tokenMint = decodedIx.keys.mint;
            if (!tokenMint)
                throw new Error(`Failed to parse InitializeMint2 instruction`);
            parsed = {
                name: "initializeMint2",
                accounts: [{ name: "tokenMint", ...decodedIx.keys.mint }],
                args: { decimals: decodedIx.data.decimals, mintAuthority: decodedIx.data.mintAuthority, freezeAuthority: decodedIx.data.freezeAuthority },
            };
            break;
        }
        case spl.TokenInstruction.InitializeImmutableOwner: {
            let decodedIx;
            try {
                decodedIx = spl.decodeInitializeImmutableOwnerInstruction(instruction, spl.TOKEN_PROGRAM_ID);
            }
            catch (error) {
                decodedIx = spl.decodeInitializeImmutableOwnerInstructionUnchecked(instruction);
            }
            const account = decodedIx.keys.account;
            if (!account)
                throw new Error(`Failed to parse InitializeImmutableOwner instruction`);
            parsed = {
                name: "initializeImmutableOwner",
                accounts: [{ name: "account", ...decodedIx.keys.account }],
                args: {},
            };
            break;
        }
        case spl.TokenInstruction.AmountToUiAmount: {
            let decodedIx;
            try {
                decodedIx = spl.decodeAmountToUiAmountInstruction(instruction, spl.TOKEN_PROGRAM_ID);
            }
            catch (error) {
                decodedIx = spl.decodeAmountToUiAmountInstructionUnchecked(instruction);
            }
            const tokenMint = decodedIx.keys.mint;
            if (!tokenMint)
                throw new Error(`Failed to parse AmountToUiAmount instruction`);
            parsed = {
                name: "amountToUiAmount",
                accounts: [{ name: "mint", ...decodedIx.keys.mint }],
                args: { amount: new anchor_1.BN(decodedIx.data.amount.toString()) },
            };
            break;
        }
        default: {
            parsed = null;
        }
    }
    return parsed
        ? {
            ...parsed,
            programId: spl.TOKEN_PROGRAM_ID,
        }
        : {
            programId: spl.TOKEN_PROGRAM_ID,
            name: "unknown",
            accounts: instruction.keys,
            args: { unknown: instruction.data },
        };
}
function decodeToken2022Instruction(instruction) {
    let parsed;
    const decoded = (0, buffer_layout_1.u8)().decode(instruction.data);
    switch (decoded) {
        case spl.TokenInstruction.InitializeMint: {
            const decodedIx = spl.decodeInitializeMintInstruction(instruction, spl.TOKEN_2022_PROGRAM_ID);
            parsed = {
                name: "initializeMint",
                accounts: [
                    { name: "tokenMint", ...decodedIx.keys.mint },
                    { name: "rentSysvar", ...decodedIx.keys.rent },
                ],
                args: { decimals: decodedIx.data.decimals, mintAuthority: decodedIx.data.mintAuthority, freezeAuthority: decodedIx.data.freezeAuthority },
            };
            break;
        }
        case spl.TokenInstruction.InitializeAccount: {
            const decodedIx = spl.decodeInitializeAccountInstruction(instruction, spl.TOKEN_2022_PROGRAM_ID);
            parsed = {
                name: "initializeAccount",
                accounts: [
                    { name: "newAccount", ...decodedIx.keys.account },
                    { name: "tokenMint", ...decodedIx.keys.mint },
                    { name: "owner", ...decodedIx.keys.owner },
                    { name: "rentSysvar", ...decodedIx.keys.rent },
                ],
                args: {},
            };
            break;
        }
        case spl.TokenInstruction.InitializeMultisig: {
            const decodedIx = spl.decodeInitializeMultisigInstruction(instruction, spl.TOKEN_2022_PROGRAM_ID);
            const multisig = decodedIx.keys.signers.map((meta, idx) => ({ name: `signer_${idx}`, ...meta }));
            parsed = {
                name: "initializeMultisig",
                accounts: [{ name: "multisig", ...decodedIx.keys.account }, { name: "rentSysvar", ...decodedIx.keys.rent }, ...multisig],
                args: { m: decodedIx.data.m },
            };
            break;
        }
        case spl.TokenInstruction.Transfer: {
            const decodedIx = spl.decodeTransferInstruction(instruction, spl.TOKEN_2022_PROGRAM_ID);
            const multisig = decodedIx.keys.multiSigners.map((meta, idx) => ({ name: `signer_${idx}`, ...meta }));
            parsed = {
                name: "transfer",
                accounts: [
                    { name: "source", ...decodedIx.keys.source },
                    { name: "destination", ...decodedIx.keys.destination },
                    { name: "owner", ...decodedIx.keys.owner },
                    ...multisig,
                ],
                args: { amount: new anchor_1.BN(decodedIx.data.amount.toString()) },
            };
            break;
        }
        case spl.TokenInstruction.Approve: {
            const decodedIx = spl.decodeApproveInstruction(instruction, spl.TOKEN_2022_PROGRAM_ID);
            const multisig = decodedIx.keys.multiSigners.map((meta, idx) => ({ name: `signer_${idx}`, ...meta }));
            parsed = {
                name: "approve",
                accounts: [
                    { name: "source", ...decodedIx.keys.account },
                    { name: "delegate", ...decodedIx.keys.delegate },
                    { name: "owner", ...decodedIx.keys.owner },
                    ...multisig,
                ],
                args: { amount: new anchor_1.BN(decodedIx.data.amount.toString()) },
            };
            break;
        }
        case spl.TokenInstruction.Revoke: {
            const decodedIx = spl.decodeRevokeInstruction(instruction, spl.TOKEN_2022_PROGRAM_ID);
            const multisig = decodedIx.keys.multiSigners.map((meta, idx) => ({ name: `signer_${idx}`, ...meta }));
            parsed = {
                name: "revoke",
                accounts: [{ name: "source", ...decodedIx.keys.account }, { name: "owner", ...decodedIx.keys.owner }, ...multisig],
                args: {},
            };
            break;
        }
        case spl.TokenInstruction.SetAuthority: {
            const decodedIx = spl.decodeSetAuthorityInstruction(instruction, spl.TOKEN_2022_PROGRAM_ID);
            const multisig = decodedIx.keys.multiSigners.map((meta, idx) => ({ name: `signer_${idx}`, ...meta }));
            parsed = {
                name: "setAuthority",
                accounts: [{ name: "account", ...decodedIx.keys.account }, { name: "currentAuthority", ...decodedIx.keys.currentAuthority }, ...multisig],
                args: { authorityType: Number(decodedIx.data.authorityType), newAuthority: decodedIx.data.newAuthority },
                programId: spl.TOKEN_2022_PROGRAM_ID,
            };
            break;
        }
        case spl.TokenInstruction.MintTo: {
            const decodedIx = spl.decodeMintToInstruction(instruction, spl.TOKEN_2022_PROGRAM_ID);
            const multisig = decodedIx.keys.multiSigners.map((meta, idx) => ({ name: `signer_${idx}`, ...meta }));
            parsed = {
                name: "mintTo",
                accounts: [
                    { name: "tokenMint", ...decodedIx.keys.mint },
                    { name: "mintTo", ...decodedIx.keys.destination },
                    { name: "authority", ...decodedIx.keys.authority },
                    ...multisig,
                ],
                args: { amount: new anchor_1.BN(decodedIx.data.amount.toString()) },
            };
            break;
        }
        case spl.TokenInstruction.Burn: {
            const decodedIx = spl.decodeBurnInstruction(instruction, spl.TOKEN_2022_PROGRAM_ID);
            const multisig = decodedIx.keys.multiSigners.map((meta, idx) => ({ name: `signer_${idx}`, ...meta }));
            parsed = {
                name: "burn",
                accounts: [
                    { name: "burnFrom", ...decodedIx.keys.account },
                    { name: "tokenMint", ...decodedIx.keys.mint },
                    { name: "owner", ...decodedIx.keys.owner },
                    ...multisig,
                ],
                args: { amount: new anchor_1.BN(decodedIx.data.amount.toString()) },
            };
            break;
        }
        case spl.TokenInstruction.CloseAccount: {
            const decodedIx = spl.decodeCloseAccountInstruction(instruction, spl.TOKEN_2022_PROGRAM_ID);
            const multisig = decodedIx.keys.multiSigners.map((meta, idx) => ({ name: `signer_${idx}`, ...meta }));
            parsed = {
                name: "closeAccount",
                accounts: [
                    { name: "account", ...decodedIx.keys.account },
                    { name: "destination", ...decodedIx.keys.destination },
                    { name: "owner", ...decodedIx.keys.authority },
                    ...multisig,
                ],
                args: {},
            };
            break;
        }
        case spl.TokenInstruction.FreezeAccount: {
            const decodedIx = spl.decodeFreezeAccountInstruction(instruction, spl.TOKEN_2022_PROGRAM_ID);
            const multisig = decodedIx.keys.multiSigners.map((meta, idx) => ({ name: `signer_${idx}`, ...meta }));
            parsed = {
                name: "freezeAccount",
                accounts: [
                    { name: "account", ...decodedIx.keys.account },
                    { name: "tokenMint", ...decodedIx.keys.mint },
                    { name: "authority", ...decodedIx.keys.authority },
                    ...multisig,
                ],
                args: {},
            };
            break;
        }
        case spl.TokenInstruction.ThawAccount: {
            const decodedIx = spl.decodeThawAccountInstruction(instruction, spl.TOKEN_2022_PROGRAM_ID);
            const multisig = decodedIx.keys.multiSigners.map((meta, idx) => ({ name: `signer_${idx}`, ...meta }));
            parsed = {
                name: "thawAccount",
                accounts: [
                    { name: "account", ...decodedIx.keys.account },
                    { name: "tokenMint", ...decodedIx.keys.mint },
                    { name: "authority", ...decodedIx.keys.authority },
                    ...multisig,
                ],
                args: {},
            };
            break;
        }
        case spl.TokenInstruction.TransferChecked: {
            const decodedIx = spl.decodeTransferCheckedInstruction(instruction, spl.TOKEN_2022_PROGRAM_ID);
            const multisig = decodedIx.keys.multiSigners.map((meta, idx) => ({ name: `signer_${idx}`, ...meta }));
            parsed = {
                name: "transferChecked",
                accounts: [
                    { name: "source", ...decodedIx.keys.source },
                    { name: "tokenMint", ...decodedIx.keys.mint },
                    { name: "destination", ...decodedIx.keys.destination },
                    { name: "owner", ...decodedIx.keys.owner },
                    ...multisig,
                ],
                args: { amount: new anchor_1.BN(decodedIx.data.amount.toString()), decimals: decodedIx.data.decimals },
            };
            break;
        }
        case spl.TokenInstruction.ApproveChecked: {
            const decodedIx = spl.decodeApproveCheckedInstruction(instruction, spl.TOKEN_2022_PROGRAM_ID);
            const multisig = decodedIx.keys.multiSigners.map((meta, idx) => ({ name: `signer_${idx}`, ...meta }));
            parsed = {
                name: "approveChecked",
                accounts: [
                    { name: "source", ...decodedIx.keys.account },
                    { name: "tokenMint", ...decodedIx.keys.mint },
                    { name: "delegate", ...decodedIx.keys.delegate },
                    { name: "owner", ...decodedIx.keys.owner },
                    ...multisig,
                ],
                args: { amount: new anchor_1.BN(decodedIx.data.amount.toString()), decimals: decodedIx.data.decimals },
            };
            break;
        }
        case spl.TokenInstruction.MintToChecked: {
            const decodedIx = spl.decodeMintToCheckedInstruction(instruction, spl.TOKEN_2022_PROGRAM_ID);
            const multisig = decodedIx.keys.multiSigners.map((meta, idx) => ({ name: `signer_${idx}`, ...meta }));
            parsed = {
                name: "mintToChecked",
                accounts: [
                    { name: "tokenMint", ...decodedIx.keys.mint },
                    { name: "mintTo", ...decodedIx.keys.destination },
                    { name: "authority", ...decodedIx.keys.authority },
                    ...multisig,
                ],
                args: { amount: new anchor_1.BN(decodedIx.data.amount.toString()), decimals: decodedIx.data.decimals },
            };
            break;
        }
        case spl.TokenInstruction.BurnChecked: {
            const decodedIx = spl.decodeBurnCheckedInstruction(instruction, spl.TOKEN_2022_PROGRAM_ID);
            const multisig = decodedIx.keys.multiSigners.map((meta, idx) => ({ name: `signer_${idx}`, ...meta }));
            parsed = {
                name: "burnChecked",
                accounts: [
                    { name: "burnFrom", ...decodedIx.keys.account },
                    { name: "tokenMint", ...decodedIx.keys.mint },
                    { name: "owner", ...decodedIx.keys.owner },
                    ...multisig,
                ],
                args: { amount: new anchor_1.BN(decodedIx.data.amount.toString()), decimals: decodedIx.data.decimals },
            };
            break;
        }
        case spl.TokenInstruction.InitializeAccount2: {
            const initializeAccount2InstructionData = (0, buffer_layout_1.struct)([(0, buffer_layout_1.u8)("instruction"), (0, buffer_layout_1.blob)(32, "owner")]);
            const decodedIx = initializeAccount2InstructionData.decode(instruction.data);
            parsed = {
                name: "initializeAccount2",
                accounts: [
                    { name: "newAccount", ...instruction.keys[0] },
                    { name: "tokenMint", ...instruction.keys[1] },
                    { name: "rentSysvar", ...instruction.keys[2] },
                ],
                args: { owner: new web3_js_1.PublicKey(decodedIx.owner) },
            };
            break;
        }
        case spl.TokenInstruction.SyncNative: {
            parsed = {
                name: "syncNative",
                accounts: [{ name: "account", ...instruction.keys[0] }],
                args: {},
            };
            break;
        }
        case spl.TokenInstruction.InitializeAccount3: {
            const initializeAccount3InstructionData = (0, buffer_layout_1.struct)([(0, buffer_layout_1.u8)("instruction"), (0, buffer_layout_1.blob)(32, "owner")]);
            const decodedIx = initializeAccount3InstructionData.decode(instruction.data);
            parsed = {
                name: "initializeAccount3",
                accounts: [
                    { name: "newAccount", ...instruction.keys[0] },
                    { name: "tokenMint", ...instruction.keys[1] },
                ],
                args: { owner: new web3_js_1.PublicKey(decodedIx.owner) },
            };
            break;
        }
        case spl.TokenInstruction.InitializeMultisig2: {
            const multisig = instruction.keys.slice(1).map((meta, idx) => ({ name: `signer_${idx}`, ...meta }));
            parsed = {
                name: "initializeMultisig2",
                accounts: [{ name: "multisig", ...instruction.keys[0] }, ...multisig],
                args: { m: instruction.data[1] },
            };
            break;
        }
        case spl.TokenInstruction.InitializeMint2: {
            const decodedIx = spl.decodeInitializeMintInstructionUnchecked(instruction);
            const tokenMint = decodedIx.keys.mint;
            if (!tokenMint)
                throw new Error(`Failed to parse InitializeMint2 instruction`);
            parsed = {
                name: "initializeMint2",
                accounts: [{ name: "tokenMint", ...decodedIx.keys.mint }],
                args: { decimals: decodedIx.data.decimals, mintAuthority: decodedIx.data.mintAuthority, freezeAuthority: decodedIx.data.freezeAuthority },
            };
            break;
        }
        case spl.TokenInstruction.GetAccountDataSize: {
            const tokenMint = instruction.keys[0].pubkey;
            if (!tokenMint)
                throw new Error(`Failed to parse GetAccountDataSize instruction`);
            const instructionData = token_extensions_1.getAccountDataSizeLayout.decode(instruction.data);
            parsed = {
                name: "getAccountDataSize",
                accounts: [{ name: "mint", ...instruction.keys[0] }],
                args: { extensionTypes: instructionData.extensions.map((ext) => spl.ExtensionType[ext]) },
            };
            break;
        }
        case spl.TokenInstruction.InitializeImmutableOwner: {
            const decodedIx = spl.decodeInitializeImmutableOwnerInstruction(instruction, spl.TOKEN_2022_PROGRAM_ID);
            const account = decodedIx.keys.account;
            if (!account)
                throw new Error(`Failed to parse InitializeImmutableOwner instruction`);
            parsed = {
                name: "initializeImmutableOwner",
                accounts: [{ name: "account", ...decodedIx.keys.account }],
                args: {},
            };
            break;
        }
        case spl.TokenInstruction.AmountToUiAmount: {
            const decodedIx = spl.decodeAmountToUiAmountInstruction(instruction, spl.TOKEN_2022_PROGRAM_ID);
            const tokenMint = decodedIx.keys.mint;
            if (!tokenMint)
                throw new Error(`Failed to parse AmountToUiAmount instruction`);
            parsed = {
                name: "amountToUiAmount",
                accounts: [{ name: "mint", ...decodedIx.keys.mint }],
                args: { amount: new anchor_1.BN(decodedIx.data.amount.toString()) },
            };
            break;
        }
        case spl.TokenInstruction.UiAmountToAmount: {
            const decodedIx = spl.decodeUiAmountToAmountInstruction(instruction, spl.TOKEN_2022_PROGRAM_ID);
            const tokenMint = decodedIx.keys.mint;
            if (!tokenMint)
                throw new Error(`Failed to parse UiAmountToAmount instruction`);
            parsed = {
                name: "uiAmountToAmount",
                accounts: [{ name: "mint", ...decodedIx.keys.mint }],
                args: { uiAmount: decodedIx.data.amount },
            };
            break;
        }
        case spl.TokenInstruction.InitializeMintCloseAuthority: {
            const decodedIx = spl.decodeInitializeMintCloseAuthorityInstruction(instruction, spl.TOKEN_2022_PROGRAM_ID);
            const tokenMint = decodedIx.keys.mint;
            if (!tokenMint)
                throw new Error(`Failed to parse InitializeMintCloseAuthority instruction`);
            parsed = {
                name: "initializeMintCloseAuthority",
                accounts: [{ name: "mint", ...decodedIx.keys.mint }],
                args: { closeAuthority: decodedIx.data.closeAuthority },
            };
            break;
        }
        case spl.TokenInstruction.TransferFeeExtension: {
            const discriminator = (0, buffer_layout_1.u8)().decode(instruction.data.slice(1));
            switch (discriminator) {
                case spl.TransferFeeInstruction.InitializeTransferFeeConfig: {
                    const decodedIx = spl.decodeInitializeTransferFeeConfigInstruction(instruction, spl.TOKEN_2022_PROGRAM_ID);
                    const tokenMint = decodedIx.keys.mint;
                    if (!tokenMint)
                        throw new Error(`Failed to parse InitializeTransferFeeConfig instruction`);
                    parsed = {
                        name: "initializeTransferFeeConfig",
                        accounts: [{ name: "mint", ...decodedIx.keys.mint }],
                        args: {
                            transferFeeConfigAuthority: decodedIx.data.transferFeeConfigAuthority,
                            withdrawWithheldAuthority: decodedIx.data.withdrawWithheldAuthority,
                            transferFeeBasisPoints: decodedIx.data.transferFeeBasisPoints,
                            maximumFee: decodedIx.data.maximumFee,
                        },
                    };
                    break;
                }
                case spl.TransferFeeInstruction.TransferCheckedWithFee: {
                    const decodedIx = spl.decodeTransferCheckedWithFeeInstruction(instruction, spl.TOKEN_2022_PROGRAM_ID);
                    const tokenMint = decodedIx.keys.mint;
                    if (!tokenMint)
                        throw new Error(`Failed to parse TransferCheckedWithFee instruction`);
                    parsed = {
                        name: "transferCheckedWithFee",
                        accounts: [
                            { name: "source", ...decodedIx.keys.source },
                            { name: "mint", ...decodedIx.keys.mint },
                            { name: "destination", ...decodedIx.keys.destination },
                            { name: "authority", ...decodedIx.keys.authority },
                        ],
                        args: {
                            amount: decodedIx.data.amount,
                            decimals: decodedIx.data.decimals,
                            fee: decodedIx.data.fee,
                        },
                    };
                    if (decodedIx.keys.signers) {
                        const multisig = decodedIx.keys.signers.map((meta, idx) => ({ name: `signer_${idx}`, ...meta }));
                        parsed.accounts.push(...multisig);
                    }
                    break;
                }
                case spl.TransferFeeInstruction.WithdrawWithheldTokensFromMint: {
                    const decodedIx = spl.decodeWithdrawWithheldTokensFromMintInstruction(instruction, spl.TOKEN_2022_PROGRAM_ID);
                    const tokenMint = decodedIx.keys.mint;
                    if (!tokenMint)
                        throw new Error(`Failed to parse WithdrawWithheldTokensFromMint instruction`);
                    parsed = {
                        name: "withdrawWithheldTokensFromMint",
                        accounts: [
                            { name: "mint", ...decodedIx.keys.mint },
                            { name: "destination", ...decodedIx.keys.destination },
                            { name: "authority", ...decodedIx.keys.authority },
                        ],
                        args: {},
                    };
                    if (decodedIx.keys.signers) {
                        const multisig = decodedIx.keys.signers.map((meta, idx) => ({ name: `signer_${idx}`, ...meta }));
                        parsed.accounts.push(...multisig);
                    }
                    break;
                }
                case spl.TransferFeeInstruction.WithdrawWithheldTokensFromAccounts: {
                    const decodedIx = spl.decodeWithdrawWithheldTokensFromAccountsInstruction(instruction, spl.TOKEN_2022_PROGRAM_ID);
                    const tokenMint = decodedIx.keys.mint;
                    if (!tokenMint)
                        throw new Error(`Failed to parse WithdrawWithheldTokensFromAccounts instruction`);
                    parsed = {
                        name: "withdrawWithheldTokensFromAccounts",
                        accounts: [
                            { name: "mint", ...decodedIx.keys.mint },
                            { name: "destination", ...decodedIx.keys.destination },
                            { name: "authority", ...decodedIx.keys.authority },
                        ],
                        args: {},
                    };
                    if (decodedIx.keys.signers) {
                        const multisig = decodedIx.keys.signers.map((meta, idx) => ({ name: `signer_${idx}`, ...meta }));
                        parsed.accounts.push(...multisig);
                    }
                    if (decodedIx.keys.sources) {
                        const multisig = decodedIx.keys.sources.map((meta, idx) => ({ name: `source_${idx}`, ...meta }));
                        parsed.accounts.push(...multisig);
                    }
                    break;
                }
                case spl.TransferFeeInstruction.HarvestWithheldTokensToMint: {
                    const decodedIx = spl.decodeHarvestWithheldTokensToMintInstruction(instruction, spl.TOKEN_2022_PROGRAM_ID);
                    const tokenMint = decodedIx.keys.mint;
                    if (!tokenMint)
                        throw new Error(`Failed to parse HarvestWithheldTokensToMint instruction`);
                    parsed = {
                        name: "harvestWithheldTokensToMint",
                        accounts: [{ name: "mint", ...decodedIx.keys.mint }],
                        args: {},
                    };
                    if (decodedIx.keys.sources) {
                        const multisig = decodedIx.keys.sources.map((meta, idx) => ({ name: `source_${idx}`, ...meta }));
                        parsed.accounts.push(...multisig);
                    }
                    break;
                }
                case spl.TransferFeeInstruction.SetTransferFee: {
                    const decodedIx = (0, token_extensions_1.decodeSetTransferFeeInstruction)(instruction, spl.TOKEN_2022_PROGRAM_ID);
                    const tokenMint = decodedIx.keys.mint;
                    if (!tokenMint)
                        throw new Error(`Failed to parse SetTransferFee instruction`);
                    parsed = {
                        name: "setTransferFee",
                        accounts: [
                            { name: "mint", ...decodedIx.keys.mint },
                            { name: "authority", ...decodedIx.keys.authority },
                        ],
                        args: { transferFeeBasisPoints: decodedIx.data.transferFeeBasisPoints, maximumFee: decodedIx.data.maximumFee },
                    };
                    if (decodedIx.keys.signers) {
                        const multisig = decodedIx.keys.signers.map((meta, idx) => ({ name: `signer_${idx}`, ...meta }));
                        parsed.accounts.push(...multisig);
                    }
                    break;
                }
                default: {
                    parsed = null;
                    break;
                }
            }
            break;
        }
        case spl.TokenInstruction.DefaultAccountStateExtension: {
            const discriminator = (0, buffer_layout_1.u8)().decode(instruction.data.slice(1));
            switch (discriminator) {
                case spl.DefaultAccountStateInstruction.Initialize: {
                    const tokenMint = instruction.keys[0].pubkey;
                    if (!tokenMint)
                        throw new Error(`Failed to parse InitializeDefaultAccountState instruction`);
                    const instructionData = spl.defaultAccountStateInstructionData.decode(instruction.data);
                    parsed = {
                        name: "initializeDefaultAccountState",
                        accounts: [{ name: "mint", ...instruction.keys[0] }],
                        args: { accountState: spl.AccountState[instructionData.accountState] },
                    };
                    break;
                }
                case spl.DefaultAccountStateInstruction.Update: {
                    const tokenMint = instruction.keys[0].pubkey;
                    if (!tokenMint)
                        throw new Error(`Failed to parse UpdateDefaultAccountState instruction`);
                    const multisig = instruction.keys.slice(2).map((meta, idx) => ({ name: `signer_${idx}`, ...meta }));
                    const instructionData = spl.defaultAccountStateInstructionData.decode(instruction.data);
                    parsed = {
                        name: "updateDefaultAccountState",
                        accounts: [{ name: "mint", ...instruction.keys[0] }, { name: "freezeAuthority", ...instruction.keys[1] }, { ...multisig }],
                        args: { accountState: spl.AccountState[instructionData.accountState] },
                    };
                    break;
                }
                default: {
                    parsed = null;
                    break;
                }
            }
            break;
        }
        case spl.TokenInstruction.MemoTransferExtension: {
            const account = instruction.keys[0].pubkey;
            if (!account)
                throw new Error(`Failed to parse MemoTransfersInstruction instruction`);
            const instructionData = spl.memoTransferInstructionData.decode(instruction.data);
            parsed = {
                name: "memoTransfersInstruction",
                accounts: [{ name: "account", ...instruction.keys[0] }, { name: "authority", ...instruction.keys[1] }, { ...instruction.keys.slice(2) }],
                args: { memoTransferInstruction: spl.MemoTransferInstruction[instructionData.memoTransferInstruction] },
            };
            break;
        }
        case spl.TokenInstruction.CreateNativeMint: {
            const payer = instruction.keys[0].pubkey;
            if (!payer)
                throw new Error(`Failed to parse CreateNativeMint instruction`);
            parsed = {
                name: "createNativeMint",
                accounts: [
                    { name: "payer", ...instruction.keys[0] },
                    { name: "nativeMintId", ...instruction.keys[1] },
                    { name: "systemProgram", ...instruction.keys[2] },
                ],
                args: {},
            };
            break;
        }
        case spl.TokenInstruction.InitializeNonTransferableMint: {
            const mint = instruction.keys[0].pubkey;
            if (!mint)
                throw new Error(`Failed to parse InitializeNonTransferableMint instruction`);
            parsed = {
                name: "initializeNonTransferableMint",
                accounts: [{ name: "mint", ...instruction.keys[0] }],
                args: {},
            };
            break;
        }
        case spl.TokenInstruction.CpiGuardExtension: {
            const account = instruction.keys[0].pubkey;
            if (!account)
                throw new Error(`Failed to parse CreateCpiGuardInstruction instruction`);
            const multisig = instruction.keys.slice(2).map((meta, idx) => ({ name: `signer_${idx}`, ...meta }));
            const instructionData = spl.cpiGuardInstructionData.decode(instruction.data);
            parsed = {
                name: "createCpiGuardInstruction",
                accounts: [{ name: "account", ...instruction.keys[0] }, { name: "authority", ...instruction.keys[1] }, { ...multisig }],
                args: { cpiGuardInstruction: spl.CpiGuardInstruction[instructionData.cpiGuardInstruction] },
            };
            break;
        }
        case spl.TokenInstruction.InitializePermanentDelegate: {
            const mint = instruction.keys[0].pubkey;
            if (!mint)
                throw new Error(`Failed to parse InitializePermanentDelegate instruction`);
            const decodedIx = spl.decodeInitializePermanentDelegateInstruction(instruction, spl.TOKEN_2022_PROGRAM_ID);
            parsed = {
                name: "initializePermanentDelegate",
                accounts: [{ name: "account", ...decodedIx.keys.mint }],
                args: { delegate: decodedIx.data.delegate },
            };
            break;
        }
        case spl.TokenInstruction.TransferHookExtension: {
            const discriminator = (0, buffer_layout_1.u8)().decode(instruction.data.slice(1));
            switch (discriminator) {
                case spl.TransferHookInstruction.Initialize: {
                    const tokenMint = instruction.keys[0].pubkey;
                    if (!tokenMint)
                        throw new Error(`Failed to parse InitializeTransferHook instruction`);
                    const instructionData = spl.initializeTransferHookInstructionData.decode(instruction.data);
                    parsed = {
                        name: "initializeTransferHook",
                        accounts: [{ name: "mint", ...instruction.keys[0] }],
                        args: { authority: instructionData.authority, transferHookProgramId: instructionData.transferHookProgramId },
                    };
                    break;
                }
                case spl.TransferHookInstruction.Update: {
                    const tokenMint = instruction.keys[0].pubkey;
                    if (!tokenMint)
                        throw new Error(`Failed to parse UpdateTransferHook instruction`);
                    const multisig = instruction.keys.slice(2).map((meta, idx) => ({ name: `signer_${idx}`, ...meta }));
                    const instructionData = spl.updateTransferHookInstructionData.decode(instruction.data);
                    parsed = {
                        name: "updateTransferHook",
                        accounts: [{ name: "mint", ...instruction.keys[0] }, { name: "authority", ...instruction.keys[1] }, { ...multisig }],
                        args: { transferHookProgramId: instructionData.transferHookProgramId },
                    };
                    break;
                }
                default: {
                    parsed = null;
                    break;
                }
            }
            break;
        }
        case spl.TokenInstruction.MetadataPointerExtension: {
            const discriminator = (0, buffer_layout_1.u8)().decode(instruction.data.slice(1));
            switch (discriminator) {
                case spl.MetadataPointerInstruction.Initialize: {
                    const tokenMint = instruction.keys[0].pubkey;
                    if (!tokenMint)
                        throw new Error(`Failed to parse InitializeMetadataPointer instruction`);
                    const instructionData = spl.initializeMetadataPointerData.decode(instruction.data);
                    parsed = {
                        name: "initializeMetadataPointer",
                        accounts: [{ name: "mint", ...instruction.keys[0] }],
                        args: { authority: instructionData.authority, metadataAddress: instructionData.metadataAddress },
                    };
                    break;
                }
                case spl.MetadataPointerInstruction.Update: {
                    const tokenMint = instruction.keys[0].pubkey;
                    if (!tokenMint)
                        throw new Error(`Failed to parse UpdateMetadataPointer instruction`);
                    const multisig = instruction.keys.slice(2).map((meta, idx) => ({ name: `signer_${idx}`, ...meta }));
                    const instructionData = spl.updateMetadataPointerData.decode(instruction.data);
                    parsed = {
                        name: "updateMetadataPointer",
                        accounts: [{ name: "mint", ...instruction.keys[0] }, { name: "authority", ...instruction.keys[1] }, { ...multisig }],
                        args: { metadataAddress: instructionData.metadataAddress },
                    };
                    break;
                }
                default: {
                    parsed = null;
                    break;
                }
            }
            break;
        }
        case spl.TokenInstruction.GroupPointerExtension: {
            const discriminator = (0, buffer_layout_1.u8)().decode(instruction.data.slice(1));
            switch (discriminator) {
                case spl.GroupPointerInstruction.Initialize: {
                    const tokenMint = instruction.keys[0].pubkey;
                    if (!tokenMint)
                        throw new Error(`Failed to parse InitializeGroupPointer instruction`);
                    const instructionData = spl.initializeGroupPointerData.decode(instruction.data);
                    parsed = {
                        name: "initializeGroupPointer",
                        accounts: [{ name: "mint", ...instruction.keys[0] }],
                        args: { authority: instructionData.authority, groupAddress: instructionData.groupAddress },
                    };
                    break;
                }
                case spl.GroupPointerInstruction.Update: {
                    const tokenMint = instruction.keys[0].pubkey;
                    if (!tokenMint)
                        throw new Error(`Failed to parse UpdateGroupPointer instruction`);
                    const multisig = instruction.keys.slice(2).map((meta, idx) => ({ name: `signer_${idx}`, ...meta }));
                    const instructionData = spl.updateGroupPointerData.decode(instruction.data);
                    parsed = {
                        name: "updateGroupPointer",
                        accounts: [{ name: "mint", ...instruction.keys[0] }, { name: "authority", ...instruction.keys[1] }, { ...multisig }],
                        args: { groupAddress: instructionData.groupAddress },
                    };
                    break;
                }
                default: {
                    parsed = null;
                    break;
                }
            }
            break;
        }
        case spl.TokenInstruction.GroupMemberPointerExtension: {
            const discriminator = (0, buffer_layout_1.u8)().decode(instruction.data.slice(1));
            switch (discriminator) {
                case spl.GroupMemberPointerInstruction.Initialize: {
                    const tokenMint = instruction.keys[0].pubkey;
                    if (!tokenMint)
                        throw new Error(`Failed to parse InitializeGroupMemberPointer instruction`);
                    const instructionData = spl.initializeGroupMemberPointerData.decode(instruction.data);
                    parsed = {
                        name: "initializeGroupMemberPointer",
                        accounts: [{ name: "mint", ...instruction.keys[0] }],
                        args: { authority: instructionData.authority, memberAddress: instructionData.memberAddress },
                    };
                    break;
                }
                case spl.GroupMemberPointerInstruction.Update: {
                    const tokenMint = instruction.keys[0].pubkey;
                    if (!tokenMint)
                        throw new Error(`Failed to parse UpdateGroupMemberPointer instruction`);
                    const multisig = instruction.keys.slice(2).map((meta, idx) => ({ name: `signer_${idx}`, ...meta }));
                    const instructionData = spl.updateGroupMemberPointerData.decode(instruction.data);
                    parsed = {
                        name: "updateGroupMemberPointer",
                        accounts: [{ name: "mint", ...instruction.keys[0] }, { name: "authority", ...instruction.keys[1] }, { ...multisig }],
                        args: { memberAddress: instructionData.memberAddress },
                    };
                    break;
                }
                default: {
                    parsed = null;
                    break;
                }
            }
            break;
        }
        default: {
            const discriminator = instruction.data.slice(0, 8).toString("hex");
            switch (discriminator) {
                default:
                    parsed = null;
            }
            break;
        }
    }
    return parsed
        ? {
            ...parsed,
            programId: spl.TOKEN_2022_PROGRAM_ID,
        }
        : {
            programId: spl.TOKEN_2022_PROGRAM_ID,
            name: "unknown",
            accounts: instruction.keys,
            args: { unknown: instruction.data },
        };
}
function decodeAssociatedTokenInstruction(instruction) {
    return {
        name: "createAssociatedTokenAccount",
        accounts: [
            { name: "fundingAccount", ...instruction.keys[0] },
            { name: "newAccount", ...instruction.keys[1] },
            { name: "wallet", ...instruction.keys[2] },
            { name: "tokenMint", ...instruction.keys[3] },
            { name: "systemProgram", ...instruction.keys[4] },
            { name: "tokenProgram", ...instruction.keys[5] },
            ...[instruction.keys.length > 5 ? { name: "rentSysvar", ...instruction.keys[6] } : undefined],
        ],
        args: {},
        programId: spl.ASSOCIATED_TOKEN_PROGRAM_ID,
    };
}
function flattenIdlAccounts(accounts, prefix) {
    return accounts
        .map((account) => {
        const accName = account.name;
        if (Object.prototype.hasOwnProperty.call(account, "accounts")) {
            const newPrefix = prefix ? `${prefix} > ${accName}` : accName;
            return flattenIdlAccounts(account.accounts, newPrefix);
        }
        else {
            return {
                ...account,
                name: prefix ? `${prefix} > ${accName}` : accName,
            };
        }
    })
        .flat();
}
/**
 * Class for parsing arbitrary solana transactions in various formats
 * - by txHash
 * - from raw transaction data (base64 encoded or buffer)
 * - @solana/web3.js getTransaction().message object
 * - @solana/web3.js getParsedTransaction().message or Transaction.compileMessage() object
 * - @solana/web3.js TransactionInstruction object
 */
class SolanaParser {
    /**
     * Initializes parser object
     * `SystemProgram`, `TokenProgram` and `AssociatedTokenProgram` are supported by default
     * but may be overriden by providing custom idl/custom parser
     * @param programInfos list of objects which contains programId and corresponding idl
     * @param parsers list of pairs (programId, custom parser)
     */
    constructor(programInfos, parsers) {
        this.instructionDecoders = new Map();
        this.instructionParsers = new Map();
        const standardParsers = [
            [web3_js_1.SystemProgram.programId.toBase58(), decodeSystemInstruction],
            [spl.TOKEN_PROGRAM_ID.toBase58(), decodeTokenInstruction],
            [spl.TOKEN_2022_PROGRAM_ID.toBase58(), decodeToken2022Instruction],
            [spl.ASSOCIATED_TOKEN_PROGRAM_ID.toBase58(), decodeAssociatedTokenInstruction],
        ];
        for (const programInfo of programInfos) {
            this.addParserFromIdl(new web3_js_1.PublicKey(programInfo.programId), programInfo.idl);
        }
        let result;
        if (!parsers) {
            result = new Map(standardParsers);
        }
        else {
            // first set provided parsers
            result = new Map(parsers);
            // append standart parsers if parser not exist yet
            for (const parserInfo of standardParsers) {
                if (!result.has(parserInfo[0])) {
                    result.set(...parserInfo);
                }
            }
        }
        result.forEach((parser, key) => this.instructionParsers.set(key, parser));
    }
    /**
     * Adds (or updates) parser for provided programId
     * @param programId program id to add parser for
     * @param parser parser to parse programId instructions
     */
    addParser(programId, parser) {
        this.instructionParsers.set(programId.toBase58(), parser);
    }
    /**
     * Adds (or updates) parser for provided programId
     * @param programId program id to add parser for
     * @param idl IDL that describes anchor program
     */
    addParserFromIdl(programId, idl) {
        this.instructionDecoders.set(programId, new anchor_1.BorshInstructionCoder(idl));
        this.instructionParsers.set(...this.buildIdlParser(programId, idl));
    }
    isParserAvailble(programId) {
        return this.instructionParsers.has(programId);
    }
    retrieveParserReadyProgramIds() {
        const programIds = Array.from(this.instructionParsers.keys());
        return programIds.map((key) => key.toString());
    }
    buildIdlParser(programId, idl) {
        const idlParser = (instruction, decoder) => {
            const parsedIx = decoder === null || decoder === void 0 ? void 0 : decoder.decode(instruction.data);
            if (!parsedIx) {
                return this.buildUnknownParsedInstruction(instruction.programId, instruction.keys, instruction.data);
            }
            else {
                const ix = idl.instructions.find((instr) => instr.name === parsedIx.name);
                if (!ix) {
                    return this.buildUnknownParsedInstruction(instruction.programId, instruction.keys, instruction.data, parsedIx.name);
                }
                const flatIdlAccounts = flattenIdlAccounts(ix.accounts);
                const accounts = instruction.keys.map((meta, idx) => {
                    if (idx < flatIdlAccounts.length) {
                        return {
                            name: flatIdlAccounts[idx].name,
                            ...meta,
                        };
                    }
                    // "Remaining accounts" are unnamed in Anchor.
                    else {
                        return {
                            name: `Remaining ${idx - flatIdlAccounts.length}`,
                            ...meta,
                        };
                    }
                });
                return {
                    name: parsedIx.name,
                    accounts,
                    programId: instruction.programId,
                    args: parsedIx.data, // as IxArgsMap<typeof idl, typeof idl["instructions"][number]["name"]>,
                };
            }
        };
        return [programId, idlParser.bind(this)];
    }
    /**
     * Removes parser for provided program id
     * @param programId program id to remove parser for
     */
    removeParser(programId) {
        this.instructionParsers.delete(programId.toBase58());
    }
    buildUnknownParsedInstruction(programId, accounts, argData, name) {
        return {
            programId,
            accounts,
            args: { unknown: argData },
            name: name || "unknown",
        };
    }
    /**
     * Parses instruction
     * @param instruction transaction instruction to parse
     * @returns parsed transaction instruction or UnknownInstruction
     */
    parseInstruction(instruction) {
        if (!this.instructionParsers.has(instruction.programId.toBase58())) {
            return this.buildUnknownParsedInstruction(instruction.programId, instruction.keys, instruction.data);
        }
        else {
            try {
                const parser = this.instructionParsers.get(instruction.programId.toBase58());
                const decoder = this.instructionDecoders.get(instruction.programId.toBase58());
                return parser(instruction, decoder);
            }
            catch (error) {
                // eslint-disable-next-line no-console
                console.error("Parser does not matching the instruction args", {
                    programId: instruction.programId.toBase58(),
                    instructionData: instruction.data.toString("hex"),
                });
                return this.buildUnknownParsedInstruction(instruction.programId, instruction.keys, instruction.data);
            }
        }
    }
    /**
     * Parses transaction data along with inner instructions
     * @param tx response to parse
     * @returns list of parsed instructions
     */
    parseTransactionWithInnerInstructions(tx) {
        const flattened = (0, helpers_1.flattenTransactionResponse)(tx);
        return flattened.map(({ parentProgramId, ...ix }) => {
            const parsedIx = this.parseInstruction(ix);
            if (parentProgramId) {
                parsedIx.parentProgramId = parentProgramId;
            }
            return parsedIx;
        });
    }
    /**
     * Parses transaction data
     * @param txMessage message to parse
     * @param altLoadedAddresses VersionedTransaction.meta.loaddedAddresses if tx is versioned
     * @returns list of parsed instructions
     */
    parseTransactionData(txMessage, altLoadedAddresses = undefined) {
        const parsedAccounts = (0, helpers_1.parseTransactionAccounts)(txMessage, altLoadedAddresses);
        return txMessage.compiledInstructions.map((instruction) => this.parseInstruction((0, helpers_1.compiledInstructionToInstruction)(instruction, parsedAccounts)));
    }
    /**
     * Parses transaction data retrieved from Connection.getParsedTransaction
     * @param txParsedMessage message to parse
     * @returns list of parsed instructions
     */
    parseTransactionParsedData(txParsedMessage) {
        const parsedAccounts = txParsedMessage.accountKeys.map((metaLike) => ({
            isSigner: metaLike.signer,
            isWritable: metaLike.writable,
            pubkey: metaLike.pubkey,
        }));
        return txParsedMessage.instructions.map((parsedIx) => this.parseInstruction((0, helpers_1.parsedInstructionToInstruction)(parsedIx, parsedAccounts)));
    }
    /**
     * Parses transaction data retrieved from Connection.getParsedTransaction along with the inner instructions
     * @param txParsedMessage message to parse
     * @returns list of parsed instructions
     */
    parseParsedTransactionWithInnerInstructions(txn) {
        const allInstructions = (0, helpers_1.flattenParsedTransaction)(txn);
        const parsedAccounts = txn.transaction.message.accountKeys.map((metaLike) => ({
            isSigner: metaLike.signer,
            isWritable: metaLike.writable,
            pubkey: metaLike.pubkey,
        }));
        return allInstructions.map(({ parentProgramId, ...instruction }) => {
            let parsedIns;
            if ("data" in instruction) {
                parsedIns = this.parseInstruction((0, helpers_1.parsedInstructionToInstruction)(instruction, parsedAccounts));
            }
            else {
                parsedIns = this.convertSolanaParsedInstruction(instruction);
            }
            if (parentProgramId) {
                parsedIns.parentProgramId = parentProgramId;
            }
            return parsedIns;
        });
    }
    convertSolanaParsedInstruction(instruction) {
        const parsed = instruction.parsed;
        const pId = instruction.programId.toBase58();
        if (pId === MEMO_PROGRAM_V2 || pId === MEMO_PROGRAM_V1) {
            return {
                name: "Memo",
                programId: instruction.programId,
                args: { message: parsed },
                accounts: [],
            };
        }
        return {
            name: parsed.type,
            programId: instruction.programId,
            args: parsed.info,
            accounts: [],
        };
    }
    /**
     * Fetches tx from blockchain and parses it
     * @param connection web3 Connection
     * @param txId transaction id
     * @param flatten - true if CPI calls need to be parsed too
     * @returns list of parsed instructions
     */
    async parseTransaction(connection, txId, flatten = false, commitment = "confirmed") {
        var _a;
        const transaction = await connection.getTransaction(txId, { commitment: commitment, maxSupportedTransactionVersion: 0 });
        if (!transaction)
            return null;
        if (flatten) {
            const flattened = (0, helpers_1.flattenTransactionResponse)(transaction);
            return flattened.map((ix) => this.parseInstruction(ix));
        }
        return this.parseTransactionData(transaction.transaction.message, (_a = transaction.meta) === null || _a === void 0 ? void 0 : _a.loadedAddresses);
    }
    /**
     * Parses transaction dump
     * @param txDump base64-encoded string or raw Buffer which contains tx dump
     * @returns list of parsed instructions
     */
    parseTransactionDump(txDump) {
        if (!(txDump instanceof buffer_1.Buffer))
            txDump = buffer_1.Buffer.from(txDump, "base64");
        const tx = web3_js_1.Transaction.from(txDump);
        const message = tx.compileMessage();
        return this.parseTransactionData(message);
    }
}
exports.SolanaParser = SolanaParser;
//# sourceMappingURL=parsers.js.map