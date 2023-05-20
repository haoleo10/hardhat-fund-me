const { network } = require("hardhat")
const {deploymentsChains,DECIMALS,INITIAL_ANWSER} = require("../helper-hardhat-config")
module.exports = async({getNamedAccounts, deployments}) =>{
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    if (chainId == 31337){
        log("没有发现local network, 部署mocks。。。")
        await deploy("MockV3Aggregator", {
            contract:"MockV3Aggregator",
            from:deployer,
            log:true,
            args:[DECIMALS,INITIAL_ANWSER],
        })
        log("mocks部署完毕")
        log("--------------------------------------------------")
    }
}
module.exports.tags = ["all","mocks"]