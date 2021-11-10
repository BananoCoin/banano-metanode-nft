# banano-metanode-nft

An RPC node for issuing NFTs on the banano blockchain.

# NFT Template Spec

  [NFT Template Spec](https://github.com/Airtune/73-meta-tokens/blob/main/mint_nft.md)

# NFT Minting documentation

  [NFT Minting documentation](docs/creating-nfts.md)

# RPC documentation

  [RPC documentation](docs/documentation.md)

# installation instructions

  [installation instructions](docs/installation.md)

# issue tracker visualization

  [issue tracker visualization](https://9-volt.github.io/bug-life/?repo=BananoCoin/banano-metanode-nft)

#todo
- only allow svg, png, gif, jpg embedded.
if it's something else, provide IPFS CID and content type.

- update getReceiveBlock to use account_filter on account_history by send and receive account, to make the process faster.

- do more input validation on the site. such as for bad banano addresses or bad hashes.
- change 'transfer nft' to a dropdown.
- add whitelisted template owners, template owner forgeries, and template asset forgeries (over asset count)
- (bug) figure out why you can't send two assets to the same account withount recieving the first asset first.
- (bug) figure out why you have to refresh the template before the ownership change shows up.

  [todo](https://github.com/BananoCoin/banano-metanode-nft/issues)

1. add a issue to add non_transferable.

2. atomic swaps
  1. add 'init atomic swap' which gives a nonce.
  2. add 'submit atomic swap block' which takes a nonce, a block type, and an unsigned block.
    block types are:
    - send#atomic_swap
    - receive#atomic_swap
    - change#abort_receive_atomic_swap
    - send#payment
    - change#abort_payment
    - receive#payment
    https://github.com/Airtune/73-meta-tokens/blob/main/meta_client_protocol/atomic_swap.md
    https://github.com/Airtune/73-meta-tokens/blob/main/meta_ledger_protocol/atomic_swap.md
  3. add 'check atomic swap init' which checks if all blocks are submitted and correct.
  4. add 'sign abort blocks' which sends a signature for 'change#abort_receive_atomic_swap' and 'change#abort_payment'.
  5. add 'check atomic swap abort' which checks if all abort blocks are submitted and correct.
  6. add commands to process the atomic swaps
    - send#atomic_swap (requires signature)
    - receive#atomic_swap (requires signature)
    - change#abort_receive_atomic_swap
    - send#payment (requires signature)
    - change#abort_payment
    - receive#payment (requires signature)
