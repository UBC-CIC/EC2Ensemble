# !/bin/bash
# Script that deploys the Cloudformation Stacks for both the Administration Role and Target Execution Role to access StackSets services. 
# It uses the template file AWSCloudFormationStackSetAdministrationRole.yml and AWSCloudFormationStackSetExecutionRole.yml

aws cloudformation deploy --stack-name stackset-admin-role \
 --template-file AWSCloudFormationStackSetAdministrationRole.yml --capabilities CAPABILITY_NAMED_IAM

aws cloudformation deploy --stack-name stackset-target-execution-role --template-file AWSCloudFormationStackSetExecutionRole.yml \
--capabilities CAPABILITY_NAMED_IAM 