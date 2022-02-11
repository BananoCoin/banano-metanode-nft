# banano-metanode-nft

An RPC node for issuing NFTs on the banano blockchain.

# NFT Template Spec

  [NFT Template Spec](https://github.com/Airtune/73-meta-tokens/blob/main/meta_ledger_protocol/mint_blocks.md)

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

1. atomic swaps

2. add a issue to add non_transferable.
