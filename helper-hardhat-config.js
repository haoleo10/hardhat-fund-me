const networkConfig = {
    31337: {
        name: "localhost",
    },
    // Price Feed Address, values can be obtained at https://docs.chain.link/data-feeds/price-feeds/addresses
    11155111: {
        name: "sepolia",
        ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    },
}

const developmentChains = ["hardhat", "localhost"]
const DECIMALS = 8
const INITIAL_ANWSER = 200000000000
//导出，以便我们的其他脚本能够使用

module.exports = {
    networkConfig,
    developmentChains,
    DECIMALS,
    INITIAL_ANWSER,
}