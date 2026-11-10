export declare class MerkleTree {
    private leaves;
    private layers;
    constructor(leaves: string[]);
    private buildTree;
    private hashPair;
    getRoot(): string;
    getProof(leafIndex: number): string[];
    static verify(leaf: string, proof: string[], root: string): boolean;
}
