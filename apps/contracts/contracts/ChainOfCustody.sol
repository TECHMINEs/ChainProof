// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import "./ChainProofAccessControl.sol";

contract ChainOfCustody is Pausable, ReentrancyGuard {
    ChainProofAccessControl public accessControl;

    struct EvidenceRecord {
        string evidenceId;
        string metadataHash;
        address registrar;
        uint256 registeredAt;
        bool exists;
        bool isFlagged;
        uint256 transferCount;
    }

    struct TransferRecord {
        string transferId;
        string evidenceId;
        string combinedHash;
        string location;
        address fromOfficer;
        address toOfficer;
        uint256 timestamp;
        bool isVerified;
    }

    struct MerkleCheckpoint {
        string batchId;
        bytes32 merkleRoot;
        uint256 createdAt;
    }

    mapping(string => EvidenceRecord) public evidenceRecords;
    mapping(string => TransferRecord) public transferRecords;
    mapping(string => MerkleCheckpoint) public merkleCheckpoints;

    event EvidenceRegistered(string indexed evidenceId, string metadataHash, address indexed registrar, uint256 timestamp);
    event EvidenceFlagged(string indexed evidenceId, address indexed flagger, uint256 timestamp);
    event TransferRecorded(string indexed transferId, string indexed evidenceId, address indexed fromOfficer, address toOfficer, uint256 timestamp);
    event MerkleCheckpointRecorded(string indexed batchId, bytes32 merkleRoot, uint256 timestamp);

    constructor(address _accessControlAddress) {
        accessControl = ChainProofAccessControl(_accessControlAddress);
    }

    modifier onlyRole(bytes32 role) {
        require(
            accessControl.hasRole(role, msg.sender) || accessControl.hasRole(accessControl.ADMIN_ROLE(), msg.sender),
            "ChainOfCustody: unauthorized"
        );
        _;
    }

    function registerEvidence(string calldata evidenceId, string calldata metadataHash) external whenNotPaused onlyRole(accessControl.REGISTRAR_ROLE()) {
        require(!evidenceRecords[evidenceId].exists, "ChainOfCustody: evidence already exists");

        evidenceRecords[evidenceId] = EvidenceRecord({
            evidenceId: evidenceId,
            metadataHash: metadataHash,
            registrar: msg.sender,
            registeredAt: block.timestamp,
            exists: true,
            isFlagged: false,
            transferCount: 0
        });

        emit EvidenceRegistered(evidenceId, metadataHash, msg.sender, block.timestamp);
    }

    function recordTransfer(
        string calldata transferId,
        string calldata evidenceId,
        string calldata combinedHash,
        string calldata location,
        address toOfficer,
        bool verifiedWithZK
    ) external whenNotPaused onlyRole(accessControl.OFFICER_ROLE()) {
        require(evidenceRecords[evidenceId].exists, "ChainOfCustody: evidence does not exist");
        require(!evidenceRecords[evidenceId].isFlagged, "ChainOfCustody: evidence is flagged");
        require(bytes(transferRecords[transferId].transferId).length == 0, "ChainOfCustody: transfer already exists");

        transferRecords[transferId] = TransferRecord({
            transferId: transferId,
            evidenceId: evidenceId,
            combinedHash: combinedHash,
            location: location,
            fromOfficer: msg.sender,
            toOfficer: toOfficer,
            timestamp: block.timestamp,
            isVerified: verifiedWithZK
        });

        evidenceRecords[evidenceId].transferCount += 1;

        emit TransferRecorded(transferId, evidenceId, msg.sender, toOfficer, block.timestamp);
    }

    function recordMerkleCheckpoint(string calldata batchId, bytes32 merkleRoot) external whenNotPaused onlyRole(accessControl.ADMIN_ROLE()) {
        require(merkleCheckpoints[batchId].merkleRoot == bytes32(0), "ChainOfCustody: checkpoint already exists");

        merkleCheckpoints[batchId] = MerkleCheckpoint({
            batchId: batchId,
            merkleRoot: merkleRoot,
            createdAt: block.timestamp
        });

        emit MerkleCheckpointRecorded(batchId, merkleRoot, block.timestamp);
    }

    function flagEvidence(string calldata evidenceId) external whenNotPaused onlyRole(accessControl.ADMIN_ROLE()) {
        require(evidenceRecords[evidenceId].exists, "ChainOfCustody: evidence does not exist");
        require(!evidenceRecords[evidenceId].isFlagged, "ChainOfCustody: evidence already flagged");

        evidenceRecords[evidenceId].isFlagged = true;

        emit EvidenceFlagged(evidenceId, msg.sender, block.timestamp);
    }

    function verifyMerkleProof(bytes32 leaf, bytes32[] calldata proof, bytes32 root) public pure returns (bool) {
        bytes32 currentHash = leaf;

        for (uint256 i = 0; i < proof.length; i++) {
            bytes32 proofElement = proof[i];
            
            if (currentHash <= proofElement) {
                currentHash = keccak256(abi.encodePacked(currentHash, proofElement));
            } else {
                currentHash = keccak256(abi.encodePacked(proofElement, currentHash));
            }
        }

        return currentHash == root;
    }
}
