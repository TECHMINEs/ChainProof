"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MerkleTree = void 0;
const ethers_1 = require("ethers");
class MerkleTree {
    leaves;
    layers;
    constructor(leaves) {
        if (leaves.length === 0) {
            throw new Error('Cannot construct MerkleTree with empty leaves');
        }
        this.leaves = leaves.map(leaf => ethers_1.ethers.keccak256(ethers_1.ethers.toUtf8Bytes(leaf)));
        this.layers = [this.leaves];
        this.buildTree();
    }
    buildTree() {
        let currentLayer = this.leaves;
        while (currentLayer.length > 1) {
            const nextLayer = [];
            for (let i = 0; i < currentLayer.length; i += 2) {
                const left = currentLayer[i];
                const right = i + 1 < currentLayer.length ? currentLayer[i + 1] : left;
                nextLayer.push(this.hashPair(left, right));
            }
            this.layers.push(nextLayer);
            currentLayer = nextLayer;
        }
    }
    hashPair(a, b) {
        // Sort pair before hashing
        const [smaller, larger] = [a, b].sort();
        return ethers_1.ethers.keccak256(ethers_1.ethers.concat([smaller, larger]));
    }
    getRoot() {
        return this.layers[this.layers.length - 1][0];
    }
    getProof(leafIndex) {
        if (leafIndex < 0 || leafIndex >= this.leaves.length) {
            throw new Error('Invalid leaf index');
        }
        const proof = [];
        let currentIndex = leafIndex;
        for (let i = 0; i < this.layers.length - 1; i++) {
            const currentLayer = this.layers[i];
            const isRightNode = currentIndex % 2 === 1;
            const siblingIndex = isRightNode ? currentIndex - 1 : currentIndex + 1;
            if (siblingIndex < currentLayer.length) {
                proof.push(currentLayer[siblingIndex]);
            }
            else {
                // If no sibling, it duplicated the node itself
                proof.push(currentLayer[currentIndex]);
            }
            currentIndex = Math.floor(currentIndex / 2);
        }
        return proof;
    }
    static verify(leaf, proof, root) {
        let currentHash = ethers_1.ethers.keccak256(ethers_1.ethers.toUtf8Bytes(leaf));
        for (const siblingHash of proof) {
            const [smaller, larger] = [currentHash, siblingHash].sort();
            currentHash = ethers_1.ethers.keccak256(ethers_1.ethers.concat([smaller, larger]));
        }
        return currentHash === root;
    }
}
exports.MerkleTree = MerkleTree;
