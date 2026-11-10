import { expect } from "chai";
import { ethers } from "hardhat";
import { ChainProofAccessControl, ChainOfCustody } from "../typechain-types";

describe("ChainOfCustody", function () {
  let accessControl: ChainProofAccessControl;
  let chainOfCustody: ChainOfCustody;
  let owner: any;
  let registrar: any;
  let officer1: any;
  let officer2: any;

  beforeEach(async function () {
    [owner, registrar, officer1, officer2] = await ethers.getSigners();

    const AccessControlFactory = await ethers.getContractFactory("ChainProofAccessControl");
    accessControl = await AccessControlFactory.deploy(owner.address);
    await accessControl.waitForDeployment();
    const accessControlAddress = await accessControl.getAddress();

    const ChainOfCustodyFactory = await ethers.getContractFactory("ChainOfCustody");
    chainOfCustody = await ChainOfCustodyFactory.deploy(accessControlAddress);
    await chainOfCustody.waitForDeployment();

    // Assign roles
    await accessControl.addRegistrar(registrar.address);
    await accessControl.addOfficer(officer1.address);
    await accessControl.addOfficer(officer2.address);
  });

  it("should register evidence successfully", async function () {
    const evidenceId = "EV-12345";
    const metadataHash = ethers.keccak256(ethers.toUtf8Bytes("metadata"));

    await expect(chainOfCustody.connect(registrar).registerEvidence(evidenceId, metadataHash))
      .to.emit(chainOfCustody, "EvidenceRegistered")
      .withArgs(evidenceId, metadataHash, registrar.address, (val: any) => val > 0);

    const record = await chainOfCustody.evidenceRecords(evidenceId);
    expect(record.exists).to.be.true;
    expect(record.registrar).to.equal(registrar.address);
  });

  it("should record a transfer successfully", async function () {
    const evidenceId = "EV-12345";
    const metadataHash = ethers.keccak256(ethers.toUtf8Bytes("metadata"));

    await chainOfCustody.connect(registrar).registerEvidence(evidenceId, metadataHash);

    const transferId = "TR-001";
    const combinedHash = ethers.keccak256(ethers.toUtf8Bytes("transfer_data"));
    const location = "Warehouse A";

    await expect(chainOfCustody.connect(officer1).recordTransfer(transferId, evidenceId, combinedHash, location, officer2.address, true))
      .to.emit(chainOfCustody, "TransferRecorded")
      .withArgs(transferId, evidenceId, officer1.address, officer2.address, (val: any) => val > 0);

    const transferRecord = await chainOfCustody.transferRecords(transferId);
    expect(transferRecord.fromOfficer).to.equal(officer1.address);
    expect(transferRecord.toOfficer).to.equal(officer2.address);
    expect(transferRecord.isVerified).to.be.true;
  });

  it("should verify a correct Merkle proof", async function () {
    // Replicating the inline verifyMerkleProof sorting logic:
    // Sort pair before hashing. 
    // Wait, let's just test it with manual proof creation in JS.
    const leaves = ["Leaf1", "Leaf2", "Leaf3", "Leaf4"].map(l => ethers.keccak256(ethers.toUtf8Bytes(l)));
    
    // Simple tree creation for 4 leaves
    const hashPair = (a: string, b: string) => {
      const [smaller, larger] = [a, b].sort();
      return ethers.keccak256(ethers.concat([smaller, larger]));
    };

    const h01 = hashPair(leaves[0], leaves[1]);
    const h23 = hashPair(leaves[2], leaves[3]);
    const root = hashPair(h01, h23);

    const proofFor0 = [leaves[1], h23];
    
    const isValid = await chainOfCustody.verifyMerkleProof(leaves[0], proofFor0, root);
    expect(isValid).to.be.true;
  });
});
