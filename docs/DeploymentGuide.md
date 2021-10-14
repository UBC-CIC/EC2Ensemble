# Deployment Guide

To deploy this solution deploy the **backend** first then, the **frontend**

## Backend Deployment

Some system installation requirements before starting deployment:

-   Have a copy of the repository downloaded into your local machine that you are running the deployment from
-   AWS SAM installed and setup for use on your system, details on the installation can be found
    [here](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html).
    (NOTE: The third step of installing Docker is only needed for testing the lambda functions in this app locally, it
    does not have to be installed for the sole purpose of deployment)
-   AWS CLI installed for use on your system, details on the installation can be found [here](https://aws.amazon.com/cli/)

### Deployment Steps

1. Create an S3 bucket (or use an existing one) to hold the regional.yaml file. This can be achieved using the [AWS web console](https://aws.amazon.com),
   or running this command:

```bash
  aws s3api create-bucket --bucket bucket-name --region region --create-bucket-configuration LocationConstraint=region
```

Make sure your bucket is in the same region where you are going to deploy the solution to. You can also use an existing S3 bucket, just make sure to have the appropiate permissions.

2. Upload the regional.yaml file to the S3 bucket. You can use the web console or run this command from the root of the repository.

```bash
  aws s3api put-object --bucket bucket-name --key regional.yaml --body regional.yaml
```

Take note of the URL your uploaded file is assigned to.  
For example https://jacktriptestsourcebucket.s3.ca-central-1.amazonaws.com/regional.yaml

3. Run this command to deploy the solution.

```bash
sam build --template-file global.yaml \
&& sam deploy -g --capabilities CAPABILITY_NAMED_IAM
```

![App Screenshot](https://via.placeholder.com/468x300?text=App+Screenshot+Here)

This is a screenshot of the parameters needed for the deployment.

-   Stack Name: Put your desired stack name here
-   AWS Region: Put the region where you want the solution to be deployed
-   WebAppUrl: This should contain the URL to your web app (for CORS). Although since we are deploying the backend before the frontend, you can leave it empty for now.
-   StackSetTemplateUrl: Put the URL of the regional.yaml file you uploaded to S3 here.
-   DeployedRegion: Put the regions you want to deploy Jacktrip servers to. Write the regions separated by comma.

4. AMI STUFF

## Frontend Deployment

Redeploy backend with WebAppUrl after frontend deployment
