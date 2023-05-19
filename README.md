# GlobexPartner

# Run in local 
npm run dev:ssr

# Parameters needed

## Signup on Developer portal to get the following 3 values

API_GET_PLANS="replace-me"
API_GET_STATS="replace-me"
NODE_ENV=prod
PORT=8080


## docker

docker build -t quay.io/redhat-servicemesh-apim-demo/partner-analytics:latest .

docker push quay.io/redhat-servicemesh-apim-demo/partner-analytics:latest
