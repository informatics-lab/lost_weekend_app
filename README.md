# Set up
`npm install`

# Run locally
`npm run-script run`

# Useful debug tools
Things in the query sting like:
`http://localhost:5000/?translate=true&hintMax=5&hintMinDelay=1&hintMaxDelay=2&wsda=true`


# Deploy to s3
`aws s3 sync static/ s3://lost-weekend-app/lost-app-v1 --acl public-read`
url = https://s3-eu-west-1.amazonaws.com/lost-weekend-app/lost-app-v1/index.html