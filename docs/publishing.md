## to check for outdated deps

## to update to a major version update:

    npm install package@latest;

## to publish a new version

    npm run preflight;

## commit here and publish

    git commit -a -m 'updating dependencies';
    npm version patch;
    git pull;
    git push;
    git push --tags;
    npm publish --access public;