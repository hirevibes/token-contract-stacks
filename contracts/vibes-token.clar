(define-fungible-token vibes-token)
(define-constant ERR-UNAUTHORIZED u101)
(define-constant ERR-NON-SUFFICIENT-FUNDS u102)
(define-constant ERR-INVALID-SPENDER u103)
(define-constant ERR-ZERO-VALUE u104)
(define-constant ERR-NOT-ENOUGH-APPROVED-BALANCE u105)
(define-constant contract-owner tx-sender)
;; Storage
(define-data-var token-uri (optional (string-utf8 256)) none)
(define-data-var total-supply uint u0)
(define-map allowances {spender: principal, owner: principal} uint)
(impl-trait .sip-010-trait.sip-010-trait)


(define-read-only (get-name)
    (ok "Hirevibes"))

(define-read-only (get-symbol)
    (ok "VIBES"))

(define-read-only (get-decimals)
    (ok u8))

(define-read-only (get-total-supply)
    (ok (ft-get-supply vibes-token)))

(define-read-only (get-balance (owner principal))
    (ok (get-balance-of owner)))

(define-read-only (get-token-uri)
    (ok (var-get token-uri)))

(define-read-only (get-contract-owner)
    (ok contract-owner)
)

;; PRIVATE FUNCTIONS

;; check if the tx sender is the owner
(define-private (is-owner)
    (is-eq contract-owner tx-sender)
)

(define-private (get-allowance-of (owner principal) (spender principal))
    (default-to u0
        (map-get? allowances {spender: spender, owner: owner})))



;; Update-Allowance
(define-private (update-allowance (amount uint) (owner principal) (spender principal))
    (map-set allowances {spender: spender, owner: owner} amount)
)
;; Get Balance

(define-private (get-balance-of (owner principal))
    (ft-get-balance vibes-token owner)
)

;; PUBLIC FUNCTIONS

(define-public (donate (amount uint)) 
    (stx-transfer? amount tx-sender contract-owner))

(define-public (allowance-of (owner principal) (spender principal) )
    (ok (get-allowance-of owner spender))
)
(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
    (begin
        (asserts! (is-eq sender tx-sender) (err ERR-UNAUTHORIZED))
        (ft-transfer? vibes-token amount sender recipient)
    )
)

(define-public (transfer-from (amount uint) (owner principal) (spender principal) (recipient principal) )
    (begin
        (asserts! (is-eq tx-sender spender) (err ERR-UNAUTHORIZED))
        (let 
            ((allowance (get-allowance-of owner spender)))
            (asserts! (>= allowance amount) (err ERR-NOT-ENOUGH-APPROVED-BALANCE))
            (update-allowance (- allowance amount) owner spender)
        )
        (ft-transfer? vibes-token amount owner recipient)
    )
)

(define-public (set-token-uri (value (string-utf8 256)))
    (begin
        (asserts! (is-owner) (err ERR-UNAUTHORIZED))
        (ok (var-set token-uri (some value)))
    )
)

(define-public (burn (amount uint) (sender principal))
    (begin 
         (asserts! (is-eq tx-sender sender) (err ERR-UNAUTHORIZED))
         (ft-burn? vibes-token amount sender)
    )
)

;; approve
(define-public (approve (amount uint) (owner principal) (spender principal))
    (begin 
        (asserts! (is-eq tx-sender owner) (err ERR-INVALID-SPENDER))
        (update-allowance amount owner spender)
        (ok true)
    )
)

;; mint
(define-private (mint (amount uint) (recipient principal))
    (begin 
        (asserts! ( > amount u0) (err ERR-ZERO-VALUE))
        (var-set total-supply (+ (var-get total-supply) amount))
        (ft-mint? vibes-token amount recipient)
    )
)

(mint u35000000000000000 tx-sender)