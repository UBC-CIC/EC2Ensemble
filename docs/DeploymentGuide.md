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

1. Since we will be using [AWS Cloudformation StackSets](https://docs.aws.amazon.com/awscloudformation/latest/userguide/what-is-cfnstacksets.html) in our solution.
   We will need to satisfy the prerequisites for creating a **self-managed** StackSets, official [AWS instructions](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/stacksets-prereqs-self-managed.html) can be found here. We also have included the two template file shown in the documentation in the repo.  
   You can run the script file [stackset-role-setup.sh](../stackset-role-setup.sh), to deploy the default Administration role and Target Execution role for Stacksets as described in [AWSCloudFormationStackSetAdministrationRole.yml](../AWSCloudFormationStackSetAdministrationRole.yml) and [AWSCloudFormationStackSetExecutionRole.yml](../AWSCloudFormationStackSetExecutionRole.yml).  
   The script will use the default AWS profile and region set in env variables or credential file. It is recommended to set the wanted AWS profile and region in the [environment variables](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-envvars.html) of the shell running the script.

2. Run this command to deploy the solution.

```bash
sam build --template-file global.yaml \
&& sam deploy -g --capabilities CAPABILITY_NAMED_IAM
```

This will show a prompt where you enter parameters for the Cloudformation Stack, here are the details of the parameters:

-   Stack Name: Put your desired stack name here
-   AWS Region: Put the region where you want the solution to be deployed. This should be the **same region where your frontend will be deployed**.
-   WebAppUrl: Put the URL of the frontend here (for CORS). Since we are deploying the backend before the frontend, leave this empty for now.
-   DeployedRegion: Put the regions you want to deploy Jacktrip servers to. Write the regions separated by comma.
-   ExecutionRoleName: If your StackSet execution role name is different from the default one, please insert it here, otherwise you can keep the default value.
-   For the rest of the options below, you can press ENTER and use the default value.

```bash
Configuring SAM deploy
======================

        Looking for config file [samconfig.toml] :  Not found

        Setting default arguments for 'sam deploy'
        =========================================
        Stack Name [sam-app]:
        AWS Region [us-east-1]:
        Parameter WebAppUrl [*]:
        Parameter ExecutionRoleName [AWSCloudFormationStackSetExecutionRole]:
        Parameter DeployedRegion [ca-central-1, us-west-2]:
        #Shows you resources changes to be deployed and require a 'Y' to initiate deploy
        Confirm changes before deploy [y/N]:
        #SAM needs permission to be able to create roles to connect to the resources in your template
        Allow SAM CLI IAM role creation [Y/n]:
        Save arguments to configuration file [Y/n]:
        SAM configuration file [samconfig.toml]:
        SAM configuration environment [default]:
```

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

## Re-deploying backend with WebAppUrl

The default CORS Allow-Origin is set to '\*', you will need to change this to the deployed frontend URL. This is done by changing the WebAppUrl parameter in the sam deploy process.  
(Note: You need to remove the trailing slash from the URL, for example https://master.abcdefghi.amplifyapp.com)

-   If you saved your deployment parameters in a toml file, you can go and modify the parameter in the toml file itself.  
    ![parameter_override](images/deployment/parameter_override.png)

-   Or use (if you saved your parameters in a toml file):

```bash
	sam deploy --config-env YOUR_CONFIG_ENV --parameter-overrides WebAppUrl=http://your-url-here
```

-   You can also call sam deploy in the guided mode (-g) again and change the parameters there.

After the stack update is completed, you will need to redeploy the API. Go to your API settings in the web console, go to the Resources tab, click Action -> Deploy API.  
Select Prod as the Deployment Stage and click Deploy. The API will be re-deployed with the updated CORS settings (may take a few minutes).
![api_deploy](images/deployment/api_deploy.png)
