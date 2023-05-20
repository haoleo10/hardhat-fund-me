const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")


describe("FundMe", async function () {
    let fundme
    let deployer
    let MockV3Aggregator
    let sendValue = ethers.utils.parseEther("1")
    beforeEach(async function () {
        // const accounts = await ethers.getSigners()
        // const accountZero = accounts[0]
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        fundme = await ethers.getContract("FundMe", deployer)
        MockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator",
            deployer
        )
    })
    describe("constructor", async function () {
        it("设置aggregator地址", async function () {
            const responce = await fundme.getPriceFeed()
            assert.equal(responce, MockV3Aggregator.address)
        })
    })

    describe("fund", async function () {
        it("如果没有足够ETH就失败", async function () {
            await expect(fundme.fund()).to.be.revertedWith(
                "You need to spend more ETH!"
            )
        })
        it("Updates the amount funded data structure", async () => {
            await fundme.fund({ value: sendValue })
            const response = await fundme.getAddressToAmountFunded(deployer)
            assert.equal(response.toString(), sendValue.toString())
        })
        it("Adds funder to array of getFunder", async () => {
            await fundme.fund({ value: sendValue })
            const response = await fundme.getFunder(0)
            assert.equal(response, deployer)
        })
    })

    describe("withdraw", function () {
        beforeEach(async () => {
            await fundme.fund({ value: sendValue })
        })
        it("withdraws ETH from a single funder", async () => {
            // Arrange
            const startingFundMeBalance = await fundme.provider.getBalance(
                fundme.address
            )
            const startingDeployerBalance = await fundme.provider.getBalance(
                deployer
            )

            // Act
            const transactionResponse = await fundme.withdraw()

            const transactionReceipt = await transactionResponse.wait()

            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)

            const endingFundMeBalance = await fundme.provider.getBalance(
                fundme.address
            )
            const endingDeployerBalance = await fundme.provider.getBalance(
                deployer
            )

            // Assert
            // Maybe clean up to understand the testing
            assert.equal(endingFundMeBalance, 0)
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(),
                endingDeployerBalance.add(gasCost).toString()
            )
        })
        // this test is overloaded. Ideally we'd split it into multiple tests
        // but for simplicity we left it as one
        it("is allows us to withdraw with multiple getFunder", async () => {
            // Arrange
            const accounts = await ethers.getSigners()
            for (i = 1; i < 6; i++) {
                const fundMeConnectedContract = await fundme.connect(
                    accounts[i]
                )
                await fundMeConnectedContract.fund({ value: sendValue })
            }
            const startingFundMeBalance = await fundme.provider.getBalance(
                fundme.address
            )
            const startingDeployerBalance = await fundme.provider.getBalance(
                deployer
            )

            // Act
            const transactionResponse = await fundme.withdraw()
            // Let's comapre gas costs :)
            // const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait()

            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)

            // console.log(`GasCost: ${withdrawGasCost}`)
            // console.log(`GasUsed: ${gasUsed}`)
            // console.log(`GasPrice: ${effectiveGasPrice}`)
            // const endingFundMeBalance = await fundme.provider.getBalance(
            //     fundme.address
            // )
            const endingDeployerBalance = await fundme.provider.getBalance(
                deployer
            )
            // Assert
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(),
                endingDeployerBalance.add(gasCost).toString()
            )
            // Make a getter for storage variables
            await expect(fundme.getFunder(0)).to.be.reverted

            for (i = 1; i < 6; i++) {
                assert.equal(
                    await fundme.getAddressToAmountFunded(accounts[i].address),
                    0
                )
            }
        })
        it("便宜的withdraw", async () => {
            // Arrange
            const accounts = await ethers.getSigners()
            for (i = 1; i < 6; i++) {
                const fundMeConnectedContract = await fundme.connect(
                    accounts[i]
                )
                await fundMeConnectedContract.fund({ value: sendValue })
            }
            const startingFundMeBalance = await fundme.provider.getBalance(
                fundme.address
            )
            const startingDeployerBalance = await fundme.provider.getBalance(
                deployer
            )

            // Act
            const transactionResponse = await fundme.cheaperWithdraw()
            // Let's comapre gas costs :)
            // const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait()

            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)

            // console.log(`GasCost: ${withdrawGasCost}`)
            // console.log(`GasUsed: ${gasUsed}`)
            // console.log(`GasPrice: ${effectiveGasPrice}`)
            // const endingFundMeBalance = await fundme.provider.getBalance(
            //     fundme.address
            // )
            const endingDeployerBalance = await fundme.provider.getBalance(
                deployer
            )
            // Assert
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(),
                endingDeployerBalance.add(gasCost).toString()
            )
            // Make a getter for storage variables
            await expect(fundme.getFunder(0)).to.be.reverted

            for (i = 1; i < 6; i++) {
                assert.equal(
                    await fundme.getAddressToAmountFunded(accounts[i].address),
                    0
                )
            }
        })
        it("Only allows the getOwner to withdraw", async function () {
            const accounts = await ethers.getSigners()
            const fundMeConnectedContract = await fundme.connect(accounts[1])
            await expect(fundMeConnectedContract.withdraw()).to.be.revertedWith(
                "FundMe__NotOwner"
            )
        })
    })
})
