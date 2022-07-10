
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
    name: "Ensure that zero token should not be transferred",
    async fn(chain: Chain, accounts: Map<string, Account>, contracts: Map<string, Contract>) {
        let deployer = accounts.get("deployer")!;
        let wallet_1 = accounts.get("wallet_1")!;
        let wallet_2 = accounts.get("wallet_2")!;
        const amount = 1100000;
        const deployer_principal = types.principal(deployer.address)
        const wallet_1_principal = types.principal(wallet_1.address)
        const wallet_2_principal = types.principal(wallet_2.address)

        let block = chain.mineBlock([
            Tx.contractCall(contract_name, "transfer", [
                types.uint(amount),
                wallet_2_principal, 
                wallet_1_principal,
                types.none()
            ], wallet_2.address),
        ]);
        block.receipts[0].result.expectErr().expectUint(1);
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
        block.receipts[0].result.expectErr().expectUint(101)
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
    name: "Ensure that spender can transform the token from approved allowance",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const owner = accounts.get("deployer")!;
        const spender = accounts.get("wallet_1")!;
        const recipient = accounts.get("wallet_2")!;

        const assetMaps = chain.getAssetsMaps();
        const balance = assetMaps.assets[asset_id][owner.address];


        const approved_amount = 1000000000000;
        const transferred_amount = 10000000000;
        const block = chain.mineBlock([
            Tx.contractCall(contract_name, "approve",[
                types.uint(approved_amount),
                types.principal(owner.address),
                types.principal(spender.address)
            ] , owner.address), 
            Tx.contractCall(contract_name, "transfer-from",[
                types.uint(transferred_amount),
                types.principal(owner.address),
                types.principal(spender.address),
                types.principal(recipient.address)
            ] , spender.address),
            Tx.contractCall(contract_name, "allowance-of", [
                types.principal(owner.address),
                types.principal(spender.address)
            ], owner.address)
        ])
        
        block.receipts[0].result.expectOk().expectBool(true);
        block.receipts[1].result.expectOk().expectBool(true);
        block.receipts[1].events.expectFungibleTokenTransferEvent(
            transferred_amount,
            owner.address,
            recipient.address,
            `${owner.address}${asset_id_postfix}`
        )
        block.receipts[2].result.expectOk().expectUint(approved_amount - transferred_amount)
    }
})

Clarinet.test({
    name: "Ensure that onwer can set the new-owner",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const owner = accounts.get("deployer")!;
        const newOwner = accounts.get("wallet_1")!;

        const block = chain.mineBlock([
            Tx.contractCall(contract_name, "set-owner",[
                types.principal(newOwner.address)
            ] , owner.address),
            Tx.contractCall(contract_name, "get-contract-owner", [], newOwner.address)
        ])
        
        block.receipts[0].result.expectOk().expectBool(true);
        assertEquals(block.receipts[1].result.expectOk(), newOwner.address)
    }
})

Clarinet.test({
    name: "Ensure that non-onwer cann't set the new-owner",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const owner = accounts.get("deployer")!;
        const nonOwner = accounts.get("wallet_1")!;

        const block = chain.mineBlock([
            Tx.contractCall(contract_name, "set-owner",[
                types.principal(nonOwner.address)
            ] , nonOwner.address),
            Tx.contractCall(contract_name, "get-contract-owner", [], nonOwner.address)
        ])
        assertEquals(block.receipts[1].result.expectOk(), owner.address)
        block.receipts[0].result.expectErr().expectUint(101);
        
    }
})