const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying EAIProject with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  const EAIProject = await ethers.getContractFactory("EAIProject");
  const eaiProject = await EAIProject.deploy(deployer.address);

  await eaiProject.waitForDeployment();

  const address = await eaiProject.getAddress();
  console.log("EAIProject deployed to:", address);
  console.log("Network:", (await ethers.provider.getNetwork()).name);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
