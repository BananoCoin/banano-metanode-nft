# banano metanode protocol documentation

Banano is a payment coin, but you have to be paying for something.

The metanode protocol describes how to link banano to ... things you want to pay for.

The first use case for the protocol is Non Fungible Tokens, or NFTs.

Other use cases will be:

-   Use a metanode to do trustless NFT swaps (offer NFT for sale, bid on offer, swap banano for NFT)

-   Use a metanode to do trustless cross-chain swaps. (offer coin for sale, bid on coin, swap banano for coin)

these require understanding the multisig protocol, and adding it to bananojs, so will come later.

## general metanode protocol

### minting a NFT template

1.  a template is a piece of art, or data that has N copies, where N is a positive number.

    Minting a template consists of the following steps:

    1.  create a JSON with the below properties:

        https://github.com/Airtune/73-meta-tokens/blob/main/meta_ledger_protocol/metadata_json.md

        ```
        {
          "name: "<name>",
          "description": "<description>",
          "image": "ipfs://QmbzTMo42KADUbLwc43KR9Se6aV3N6wfKqFbSr2qN1gJqR",
          "properties": {
            "issuer": "<banano address>",
            "supply_block_hash": "<block hash>"
            ]
          }
        }
        ```

        this gets converted into a command:
        
        ```js
        {
          'command':'<template type> eg:mint_nft',
          'version':'<version number> eg:1.0.0',
          'title':'<title of template>',
          'issuer':'<banano address>',
          'max_supply':'(optional)<positive integer>',
          'ipfs_cid':'<CID of art or data>',
          'mint_previous':'<block hash>'
        }
        ```

        The command 'mint_nft' distinguishes the JSON from other metanode commands such as sales and bids for nfts and other coins.

        The version allows commands to add more properties. We may add rarity in the future.

        The title gives a human readable name to the template.

        The issuer and mint_previous work together to prevent forgeries, as will be described in the steps below.
        The issuer should be the banano account that will own the NFT template and mint the NFT assets.
        The mint_previous should be a hash of a block in the account history of the issuer.
        Any forgeries will be unable to prove they own the account history of the issuer which contains the mint_previous block hash.

        The max_supply is the maximum number of assets that can be minted from the same template. Any assets minted above this count are considered forgeries.

        The ipfs_cid is the Content Identifier (CID) on the IPFS network that identifies the actual artwork or data that this JSON metadata makes into an NFT.

        for example, this is the JSON of the first template ever made:

        ```js
        {
          "command":"mint_nft",
          "version":"1.0.0",
          "title":"Camo Banano Volcano",
          "issuer":"ban_1nftdfyadn1ynf9bz3n8rmdejnga6b7dhdeociscsmidtuy6r4s6jzf6nejq",
          "max_supply":"1","ipfs_cid":"QmbzTMo42KADUbLwc43KR9Se6aV3N6wfKqFbSr2qN1gJqR",
          "mint_previous":"B7EE81B6B21C96B12A0FD84F8464C7321F932066E989D7F6EBDD08F5B82DCBD8"
        }
        ```

        since only ban_1nft...nejq can create blocks after block B7EE...CBD8 its straightforward to detect forgeries.

        However, anyone can copy/paste the json and set their own issuer and previous, so anyone can create forgeries pointing to the art asset (Qmbz...gJqR)

        So it's important to check both the owner nd the issuer to determine that you do not have a forgery,.

    2.  publish the JSON to IPFS.

        This should be straightforward, using the pinata api, or other simmilar services.

        an example of a published Template JSON is here:

        <https://gateway.pinata.cloud/ipfs/QmQJXwo7Ee1cgP2QVRMQGrgz29knQrUMfciq2wQWAvdzzS>

### minting a NFT asset

  Minting an asset consists of the following steps:

1.  create a banano block that does both a send, and a representative change at the same time.

    Set the representative to the ipfs_cid of the template. This will require you to base58 decode the CID, encode it in hex, and remove '1220' from the beginning, leaving you with a 64 character hex string.

2.  ask the metadata node to check who owns the CID.

    this will cause the metadata node to track sends with that rep change, starting with the mint_previous block, and ending at whoever owns the asset, at the end of the send+rep chain.

## checking a NFT asset owner.

1.  a send + rep change changes the NFT's owner.

    The metanode will look for send blocks with the given representative, and trace the NFT sends through the account history on the block chain. If the chain of sends ends, the last recipient of a send is the owner of the NFT (even if they have not confirmed the receipt by publishing a receive block)
