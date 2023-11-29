// requiring the contract
var MissingDiaries = artifacts.require("./MissingDiaries.sol");

// exporting as module 
 module.exports = function(deployer) {
  deployer.deploy(MissingDiaries);
 };
