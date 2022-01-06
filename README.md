# HireVibes (VIBES) Token Contract (Stacks)

## Token Contract Actions
- Transfer
- Burn
- Approve
- Mint
- TransferFrom


## Tests
- Transfer
- Burn
- Approve
- Transfer From


## Contract calls cost synthesis

+-----------------------------------+-----------------+------------+---------------------+-------------+----------------------+--------------+
|                                   | Runtime (units) | Read Count | Read Length (bytes) | Write Count | Write Length (bytes) | Tx per Block |
+-----------------------------------+-----------------+------------+---------------------+-------------+----------------------+--------------+
| vibes-token::allowance-of         | 4961000 (0.10%) |  4 (0.05%) |        3753 (0.00%) |           0 |                    0 |         1007 |
+-----------------------------------+-----------------+------------+---------------------+-------------+----------------------+--------------+
| vibes-token::approve              | 5186000 (0.10%) |  4 (0.05%) |        3406 (0.00%) |   1 (0.01%) |          347 (0.00%) |          964 |
+-----------------------------------+-----------------+------------+---------------------+-------------+----------------------+--------------+
| vibes-token::burn                 | 3900000 (0.08%) |  5 (0.06%) |        3407 (0.00%) |   2 (0.03%) |            1 (0.00%) |         1282 |
+-----------------------------------+-----------------+------------+---------------------+-------------+----------------------+--------------+
| vibes-token::get-balance          | 4011000 (0.08%) |  4 (0.05%) |        3407 (0.00%) |           0 |                    0 |         1246 |
+-----------------------------------+-----------------+------------+---------------------+-------------+----------------------+--------------+
| vibes-token::get-total-supply     | 3411000 (0.07%) |  4 (0.05%) |        3407 (0.00%) |           0 |                    0 |         1465 |
+-----------------------------------+-----------------+------------+---------------------+-------------+----------------------+--------------+
| vibes-token::set-token-uri        | 4614000 (0.09%) |  3 (0.04%) |        3406 (0.00%) |           0 |                    0 |         1083 |
+-----------------------------------+-----------------+------------+---------------------+-------------+----------------------+--------------+
| vibes-token::transfer             | 4240000 (0.08%) |  5 (0.06%) |        3407 (0.00%) |   2 (0.03%) |            1 (0.00%) |         1179 |
+-----------------------------------+-----------------+------------+---------------------+-------------+----------------------+--------------+
| vibes-token::transfer-from        | 6973000 (0.14%) |  7 (0.09%) |        3754 (0.00%) |   3 (0.04%) |          348 (0.00%) |          717 |
+-----------------------------------+-----------------+------------+---------------------+-------------+----------------------+--------------+
|                                                                                                                                            |
+-----------------------------------+-----------------+------------+---------------------+-------------+----------------------+--------------+
| Mainnet Block Limits (Stacks 2.0) |      5000000000 |       7750 |           100000000 |        7750 |             15000000 |            / |
+-----------------------------------+-----------------+------------+---------------------+-------------+----------------------+--------------+


## HVT-to-VIBES Migration Process:

1. There are 350,000,000 HireVibes Tokens on the EOS blockchain. All 350,000,000 tokens will be minted on Stacks in a HireVibes admin wallet 
2. Once tokens are minted and ready to claim; the EOS token contract will be paused so that no EOS-HVT transactions can not occur
3. On HireVibes website, users will be directed to create a Stacks blockchain address
4. A Claim Widget on HireVibes website will enable a user to connect their EOS wallet address to the widget and insert their Stacks address 
5. Whenever a user inserts their Stacks address to claims their new VIBES tokens: HV admin team will perform a send transaction from the HV admin wallet to send their new VIBES tokens to their specified Stacks address


*There will be a disclaimer on HV website that the user is responsible for inputting their correct Stacks address, otherwise they will lose their tokens 


*Users that have staked EOS-HV-Tokens will be able to claim their new VIBES tokens without unstaking 