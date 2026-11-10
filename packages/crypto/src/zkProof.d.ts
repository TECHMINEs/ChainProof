import type { ZKProofInput, ZKProof } from '@chainproof/types';
export declare function generateTransferProof(input: ZKProofInput, wasmPath: string, zkeyPath: string): Promise<ZKProof>;
export declare function verifyTransferProof(vkeyPath: string, publicSignals: string[], proof: ZKProof['proof']): Promise<boolean>;
export declare function formatProofForChain(proof: ZKProof['proof']): [
    [
        string,
        string
    ],
    [
        [string, string],
        [string, string]
    ],
    [
        string,
        string
    ]
];
