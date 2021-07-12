# installation

## https

enabling https is reccomended

     use lighttpd as a reverse proxy and letsencrypt certbot to configure https

     https://letsencrypt.org/getting-started/

     https://stackoverflow.com/questions/4859956/lighttpd-as-reverse-proxy


running under a locked user on a vps is reccomended

     adduser nft;

     usermod -L nft

     su - nft;

## requirements

nodejs is required

      https://nodejs.org/en/download/

on ubuntu, screen is required

    sudo apt install screen

## setup git to cache password

this step is optional.

    git config --global credential.helper store

## download the repo.

    git clone https://github.com/BananoCoin/banano-metanode-nft.git

## next install the code

    npm install;

## set up the config file

create a file called 'config.json'

    touch config.json;

then edit the file (vi config.json or nano config.json) and paste the below config.

    ```js
    {
      "webPort": 9091
    }
    ```

## run the bot

run the bot inside screen (so it won't die when you log out)

    npm run screenstart;

type control-a d to exit screen.

## test the bot

## mint an NFT using the JSON spec

    https://github.com/Airtune/73-meta-tokens/blob/main/mint_nft.md

### get owner of NFT (good request)

    curl -i -H 'Accept: application/json' -H 'Content-Type: application/json' -g -d '{ "action": "get_nft_info","ipfs_cid":"QmRBfyU2FLotWr6nxvKM5akyoyPK93td5v77Q1rYKdtuLU" }' '[::1]:9091'

### get owner of NFT (unknown ipfs_cid)

    curl -i -H 'Accept: application/json' -H 'Content-Type: application/json' -g -d '{ "action": "get_nft_info","ipfs_cid":"VmbzTMo42KADUbLwc43KR9Se6aV3N6wfKqFbSr2qN1gJqR" }' '[::1]:9091'

### get owner of NFT (unsupported content_type)

    curl -i -H 'Accept: application/json' -H 'Content-Type: application/json' -g -d '{ "action": "get_nft_info","ipfs_cid":"QmbzTMo42KADUbLwc43KR9Se6aV3N6wfKqFbSr2qN1gJqR" }' '[::1]:9091'
