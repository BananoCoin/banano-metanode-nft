# github notes

## to force only one version

    rm -rf .git;
    git init;
    git checkout -b main;
    find . -exec touch {} \;
    git add .;
    git commit -m "Initial commit";
    git remote add origin https://github.com/BananoCoin/banano-metanode-nft.git;
    git push -u --force origin main;
    git branch --set-upstream-to=origin/main main;
    git pull;git push;

## to force local version to match origin/main

    git fetch --all;
    git reset --hard origin/main;

## to force local version to match origin/main, and install and restart

    git fetch --all;
    git reset --hard origin/main;
    npm i;   
    npm audit fix;
    rm screenlog.0;
    npm run screenrestart;
