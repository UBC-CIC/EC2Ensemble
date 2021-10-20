# !/bin/bash
# Script to find number of users connected to jacktrip, and then send a websocket message

# Get user count
count=$(netstat | grep "udp" | grep -c "4464")

# Get EC2 region
ec2_avail_zone=`curl -s http://169.254.169.254/latest/meta-data/placement/availability-zone`
ec2_region=${ec2_avail_zone%[a-z]}

# Get EC2 instance ID
instance_id=`wget -qO- http://instance-data/latest/meta-data/instance-id`

# Get user and serverId from instance tag
tags=$(aws ec2 describe-tags --filters "Name=resource-id,Values=${instance_id}" --region ${ec2_region} --query 'Tags[?Key == `user` || Key == `serverId` || Key == `cfnstack` ].Value' --output text)
echo tags
server_id=$(echo $tags | awk '{print $1}')
user=$(echo $tags | awk '{print $2}')
stack_name=$(echo $tags | awk '{print $3}')

# Get ContactWebSocket lambda function name
get_param_central=$(aws ssm get-parameter --name "${stack_name}/CentralRegion" --region $ec2_region --output text)
central_region=`echo $get_param_central | awk -F'String ' '{print $2}' | awk '{print $1}'`
echo $central_region

# Get ContactWebSocket lambda function name
get_param_function=$(aws ssm get-parameter --name "${stack_name}/ContactWebSocketFunctionName" --region $central_region --output text)
function_name=`echo $get_param_function | awk -F'String ' '{print $2}' | awk '{print $1}'`
echo $function_name

# Invoke ContactWebSocket Lambda function
aws lambda invoke \
--function-name $function_name \
--payload "{ \"user\": \"${user}\", \"webSocketMessage\": { \"action\": \"connection_count\", \"count\": \"${count}\", \"serverId\": \"${server_id}\" } }" \
--region $central_region response.json