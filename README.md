# Set up
`npm install`

# Run locally
`npm run-script run`

# Deploy to s3
`aws s3 sync static/ s3://lost-weekend-app/lost-app-v1 --acl public-read`
url = https://s3-eu-west-1.amazonaws.com/lost-weekend-app/lost-app-v1/index.html