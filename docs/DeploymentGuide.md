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

1. You will need to create two IAM roles in order to create a StackSet which we are using in this solution.
   Following official [AWS instructions](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/stacksets-prereqs-self-managed.html) with their provided yaml files.  
   Please run this command to create an IAM role named AWSCloudFormationStackSetAdministrationRole.
   (This exact role with the same name and permissions needs to exist in your AWS account).
    ```bash
     aws cloudformation deploy --stack-name stack-name-here \
     --template-file AWSCloudFormationStackSetAdministrationRole.yml --capabilities CAPABILITY_NAMED_IAM
    ```
    Then you will need to create a service role named AWSCloudFormationStackSetExecutionRole that trusts the administrator account.
    Please run this command while inserting your own AWS Account ID:
    ```bash
    aws cloudformation deploy --stack-name stackset-target-execution-role --template-file AWSCloudFormationStackSetExecutionRole.yml \
    --capabilities CAPABILITY_NAMED_IAM --parameter-overrides AdministratorAccountId=YOUR_AWS_ACCOUNT_ID
    ```

<!-- 2. Create an S3 bucket (or use an existing one) to hold the regional.yaml file. This can be achieved using the [AWS web console](https://aws.amazon.com),
   or running this command:

```bash
  aws s3api create-bucket --bucket bucket-name --region region \
  --create-bucket-configuration LocationConstraint=region
```

Make sure your bucket is in the same region where you are going to deploy the solution to. You can also use an existing S3 bucket, just make sure to have the appropiate permissions.

3. Upload the regional.yaml file to the S3 bucket. You can use the web console or run this command from the root of the repository.

```bash
  aws s3api put-object --bucket bucket-name --key regional.yaml --body regional.yaml
```

Take note of the URL your uploaded file is assigned to.
For example https://jacktriptestsourcebucket.s3.ca-central-1.amazonaws.com/regional.yaml -->

2. Run this command to deploy the solution.

```bash
sam build --template-file global.yaml \
&& sam deploy -g --capabilities CAPABILITY_NAMED_IAM
```

![sam params](./images/deployment/sam-params.png)

This is a screenshot of the parameters needed for the deployment.

-   Stack Name: Put your desired stack name here
-   AWS Region: Put the region where you want the solution to be deployed
-   WebAppUrl: This should contain the URL to your web app (for CORS). Although since we are deploying the backend before the frontend, you can leave it empty for now.
<!-- -   StackSetTemplateUrl: Put the URL of the regional.yaml file you uploaded to S3 here. -->
-   DeployedRegion: Put the regions you want to deploy Jacktrip servers to. Write the regions separated by comma.
-   ExecutionRoleName: If your StackSet execution role name is different from the default one, please insert it here, otherwise you can keep the default value.

![sam deploy 2](./images/deployment/sam_deploy2.png)  
For the rest of the options above you can press ENTER and use the default value.

3. Follow this [guide](AMISetup.md) to setup the AMI that the EC2 instance will run.

## Frontend Deployment

### Requirements

Before you deploy, you must have the following in place:

-   [AWS Account](https://aws.amazon.com/account/)
-   [GitHub Account](https://github.com/)

### Steps

In this step we will use the Amplify console to deploy and build the front-end application automatically.

[![One-click deployment](https://oneclick.amplifyapp.com/button.svg)](https://console.aws.amazon.com/amplify/home#/deploy?repo=https://github.com/UBC-CIC/EC2Ensemble/tree/master)

1. Use the provided **1-click deployment** button below.
2. Select **Connect to GitHub**, and then you will be asked to connect to your GitHub account. Amplify Console will fork this repository into your GitHub account before deploying.
3. Select your AWS service role in the dropdown. If you don't have one configured, Select 'Create new role' and quickly create one using the default settings.
4. At the bottom of the page, click on the triangle button beside Environment variables to expand the Environment variables view.
    - Under **Key**, enter USER_GLOBAL_STACKNAME;
    - Under **Value**, enter the custom stack name you chose in the backend deployment.

![Enter Environmental Variable](./images/deployment/one-click-deploy-envvar.png)

5. Click **Save and Deploy**, and wait for deployment to complete in the Amplify console. This may take some time to complete.

### Logging in

Cognito is used for user authentication. Users will need to input their email address and a password to create an account.
After account creation, users will need to verify their account by inputting the 6-digit verification code that was sent to their provided email address before being able to log in to the system.

## Last Step

Redeploy backend with WebAppUrl after frontend deployment
