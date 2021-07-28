# creating nfts

### before you start

Before you start making an NFT on banano, collect the following information:

1. What image do you want to use? 

        - You must own the copyright to the image or have a license.
        - You must upload the image to IPFS and have the image's CID.
        - The image can be svg or image types. we use <object> for svgs and <img> for everything else.

2. What title do you want to use for the NFT?
3. What banano account do you want to use to mint the NFTs? Do you want to create a vanity account?
4. How many copies of the NFT can be minted? In technical terms: How many assets do you want the template to have?
5. What is the current head block of the account? (currently required, may become optional in the future).
6. Do you have a pinata API key? We use pinata to upload the NFT template as JSON to IPFS.



### Pinata API key

if using pinata to upload the JSON you need a pinata api key. We use the JWT.

        https://pinata.cloud/documentation

### instructions

here's the instructions so far:

        - go to https://nft.coranos.cc/
        - under 'Seed and Account' make sure the seed and account are the ones you want, and make sure they are backed up.
        - under 'create an NFT template' make sure the API key JWT is the one you want, and is backed up.
        - go to 'create an NFT template' and fill out the JSON form with the title, account, max supply, artwork CID, and head block.
        - it will return a CID. click 'GET CID Info' and type in the new CID.
        - if CID info says the CID is valid click 'mint nft'.
        - go to 'check ownership' to check that you own it.
        - go to 'transfer nft' to send it.
        - after sending it go to 'check ownership' and it should say someone else owns it, and shows the history.
