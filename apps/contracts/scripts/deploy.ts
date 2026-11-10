import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance));

  // Deploy Access Control
  const AccessControlFactory = await ethers.getContractFactory("ChainProofAccessControl");
  const accessControl = await AccessControlFactory.deploy(deployer.address);
  await accessControl.waitForDeployment();
  const accessControlAddress = await accessControl.getAddress();
  console.log("ChainProofAccessControl deployed to:", accessControlAddress);

  // Deploy Chain Of Custody
  const ChainOfCustodyFactory = await ethers.getContractFactory("ChainOfCustody");
  const chainOfCustody = await ChainOfCustodyFactory.deploy(accessControlAddress);
  await chainOfCustody.waitForDeployment();
  const chainOfCustodyAddress = await chainOfCustody.getAddress();
  console.log("ChainOfCustody deployed to:", chainOfCustodyAddress);

  // Explicitly ensure deployer has registrar and officer roles
  await accessControl.addRegistrar(deployer.address);
  await accessControl.addOfficer(deployer.address);
  console.log("Granted REGISTRAR_ROLE and OFFICER_ROLE to deployer:", deployer.address);

  console.log("\n==========================================");
  console.log("CHAIN_OF_CUSTODY_CONTRACT_ADDRESS=" + chainOfCustodyAddress);
  console.log("==========================================\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
