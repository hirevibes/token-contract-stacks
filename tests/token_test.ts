
import { Clarinet, Tx, Chain, Account, Contract, types } from 'https://deno.land/x/clarinet@v0.14.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

const contract_name = "vibes-token";
const total_supply = 35000000000000000;
const asset_id_postfix = ".vibes-token::vibes-token"
const asset_id = ".vibes-token.vibes-token"

Clarinet.test({
    name: "Ensure that token can be transferred",
    async fn(chain: Chain, accounts: Map<string, Account>, contracts: Map<string, Contract>) {
        let deployer = accounts.get("deployer")!;
        let wallet_1 = accounts.get("wallet_1")!;
        const amount = 10000000000;
        const deployer_principal = types.principal(deployer.address)
        const wallet_1_principal = types.principal(wallet_1.address)

        let block = chain.mineBlock([
            Tx.contractCall(contract_name, "transfer", [
                types.uint(amount),
                deployer_principal, 
                wallet_1_principal,
                types.none()
            ], deployer.address),
        ]);
        
        block.receipts[0].result.expectOk().expectBool(true);
        block.receipts[0].events.expectFungibleTokenTransferEvent(
            amount,
            deployer.address,
            wallet_1.address,
            `${deployer.address}${asset_id_postfix}`
        )
    }
})

Clarinet.test({
    name: "Ensure that owner can approve balance for spender",
    fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;
        const spender  = accounts.get("wallet_1")!;
        const amount = 100000000000;
        const block = chain.mineBlock([
            Tx.contractCall(contract_name, "approve", [
                types.uint(amount),
                types.principal(deployer.address),
                types.principal(spender.address)
            ], deployer.address),
            Tx.contractCall(contract_name, "allowance-of", [
                types.principal(deployer.address),
                types.principal(spender.address)
            ], deployer.address)
        ])
        block.receipts[0].result.expectOk().expectBool(true)
        block.receipts[1].result.expectOk().expectUint(amount)
    }
})

Clarinet.test({
    name: "Ensure that contract owner can set token uri",
    async fn (chain: Chain, accounts: Map<string, Account>) {
        const deployer =  accounts.get("deployer")!;
        const block = chain.mineBlock([
            Tx.contractCall(contract_name, "set-token-uri", [types.utf8("https://hirevibes.io")], deployer.address)
        ])
        block.receipts[0].result.expectOk().expectBool(true);
    }
})

Clarinet.test({
    name: "Ensure that non-admin should not set the token uri",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet_1 = accounts.get("wallet_1")!;
        const block = chain.mineBlock([
            Tx.contractCall(contract_name, "set-token-uri", [types.utf8("https://hirevibes.io")], wallet_1.address)
        ]);
        block.receipts[0].result.expectErr().expectUint(1)
    }
})

Clarinet.test({
    name: "Ensure that user can burn the tokens",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer =  accounts.get("deployer")!;
        const deployer_principal =  types.principal(deployer.address)
        const burn_amount =  100000000000

        const assetMaps = chain.getAssetsMaps();
        const balance = assetMaps.assets[asset_id][deployer.address];
        const block = chain.mineBlock([
            Tx.contractCall(contract_name, "burn", [types.uint(burn_amount), deployer_principal], deployer.address),
            Tx.contractCall(contract_name, "get-total-supply", [], deployer.address),
            Tx.contractCall(contract_name, "get-balance", [deployer_principal], deployer.address)
        ])
        block.receipts[0].result.expectOk()
        block.receipts[0].events.expectFungibleTokenBurnEvent(burn_amount, deployer.address, `${deployer.address}${asset_id_postfix}`)
        block.receipts[1].result.expectOk().expectUint(total_supply - burn_amount)
        block.receipts[2].result.expectOk().expectUint(balance - burn_amount)

    }
})

Clarinet.test({
    name: "Ensume that owner can decrease the approve allowance for spender",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;
        const spender = accounts.get("wallet_1")!;
        const approved_amount = 1000000000000;
        const decreased_amount =  100000000000;
        const block  = chain.mineBlock([
            Tx.contractCall(contract_name, "approve",[
                types.uint(approved_amount),
                types.principal(deployer.address),
                types.principal(spender.address)
            ] , deployer.address), 
            Tx.contractCall(contract_name, "decrease-approved-allowance", [
                types.uint(decreased_amount),
                types.principal(deployer.address),
                types.principal(spender.address)
            ], deployer.address),
            Tx.contractCall(contract_name, "allowance-of", [
                types.principal(deployer.address),
                types.principal(spender.address)
            ], deployer.address)
        ])
        block.receipts[0].result.expectOk().expectBool(true)
        block.receipts[1].result.expectOk().expectBool(true)
        block.receipts[2].result.expectOk().expectUint(approved_amount - decreased_amount)
    }
})
