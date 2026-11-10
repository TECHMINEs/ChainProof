import { ethers } from 'ethers';

const rpcUrl = process.env.POLYGON_RPC_URL || 'http://127.0.0.1:8545';
const contractAddress = process.env.CHAIN_OF_CUSTODY_CONTRACT_ADDRESS || '';
const privateKey = process.env.ADMIN_PRIVATE_KEY || '';

// Protect Blockchain Private Key
if (!privateKey) {
  if (process.env.NODE_ENV === 'production') {
    console.warn('⚠️  ADMIN_PRIVATE_KEY environment variable is not set. Blockchain transactions will not execute.');
  } else {
    console.warn('⚠️  WARNING: ADMIN_PRIVATE_KEY is not set. Blockchain write operations will fail. This is acceptable in development without a running chain.');
  }
}

let provider: ethers.JsonRpcProvider | ethers.AbstractProvider;
try {
  provider = new ethers.JsonRpcProvider(rpcUrl);
} catch {
  provider = ethers.getDefaultProvider();
}

// Only create wallet if private key is available and valid
let wallet: ethers.Wallet | null = null;
if (privateKey) {
  try {
    wallet = new ethers.Wallet(privateKey, provider);
  } catch (e) {
    console.warn('⚠️  Failed to initialize ethers Wallet with ADMIN_PRIVATE_KEY:', e);
  }
}

export const abi = [
  "function registerEvidence(string calldata evidenceId, string calldata metadataHash) external",
  "function recordTransfer(string calldata transferId, string calldata evidenceId, string calldata combinedHash, string calldata location, address toOfficer, bool verifiedWithZK) external",
  "function recordMerkleCheckpoint(string calldata batchId, bytes32 merkleRoot) external",
  "function flagEvidence(string calldata evidenceId) external",
  "function evidenceRecords(string) view returns (string evidenceId, string metadataHash, address registrar, uint256 registeredAt, bool exists, bool isFlagged, uint256 transferCount)",
  "function transferRecords(string) view returns (string transferId, string evidenceId, string combinedHash, string location, address fromOfficer, address toOfficer, uint256 timestamp, bool isVerified)",
  "function verifyMerkleProof(bytes32 leaf, bytes32[] calldata proof, bytes32 root) pure returns (bool)"
];

const targetAddress = (contractAddress && ethers.isAddress(contractAddress))
  ? contractAddress
  : ethers.ZeroAddress;

export const contractClient = wallet
  ? new ethers.Contract(targetAddress, abi, wallet)
  : new ethers.Contract(targetAddress, abi, provider);

export const signerAvailable = !!wallet;
