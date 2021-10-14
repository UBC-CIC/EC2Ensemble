# AMI Setup Guide

This is a guide to setup an [Amazon Machine Image (AMI)](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AMIs.html) for running Jacktrip Servers.
This guide will help you create the same AMI we used during the testing of our solution.  
(Note: It is completely possible to use other AMIs to switch the functionality of the solution.)

## Launching an EC2 instance

First, we will need to create an EC2 instance where we will start creating the AMI.
One way to do this is through the AWS Web Console, go to the EC2 console in your AWS Web Console. It should look like this:
![ec2 console](https://via.placeholder.com/468x300?text=App+Screenshot+Here)
Press the Launch Instances button on the top right of the screen, this will start the instance launch process.

1. First is to select the base AMI of the instance, choose Ubuntu Server 20.04 LTS (HVM), SSD Volume Type, with the x86 version
   ![ubuntu](https://via.placeholder.com/468x300?text=App+Screenshot+Here)
2. Choose t2.micro for the instance type, then click Next
3. Skip this step and click Next.
4. For the storage, we can keep the default value, 8 GB of General Purpose SSD (gp2). Click Next.
5. You can skip adding tags. Click next to configure security group.
6. Configure your security group like in the picture below.
   ![security-group](https://via.placeholder.com/468x300?text=App+Screenshot+Here)
   (CAUTION: This security group rules are very lax and insecure! Do not use this in any instance used in production!)
7. Review your instance configuration and you can press Launch.
8. A window will come up asking you about key pair. This is needed for you to SSH into the EC2 instance. Please create one or use an existing key pair for the instance.  
   If you choose to create one, enter a name for the key pair, make sure to download it and keep it somewhere safe. You can then launch the instance.

## SSH to EC2 instance

Once the instance is launched, connect to it through SSH, there are multiple ways to do this and you are free to choose the ones that are most convenient.  
This is one way to do so in [Windows machines (using PuTTY).](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/putty.html)

Run these commands in your EC2 instance (press Yes for all options):

```bash
  sudo apt-get update
  sudo apt-get install wget
  sudo apt-get install unzip
  sudo apt-get install qjackctl
  sudo apt-get install jackd -y
  wget https://github.com/jacktrip/jacktrip/releases/download/v1.4.0-rc.3/JackTrip-v1.4.0-rc.3-Linux-x64-binary.zip
  unzip JackTrip-v1.4.0-rc.3-Linux-x64-binary.zip
  sudo apt-get upgrade -y
```

Test that Jacktrip is installed and in the correct version

```bash
  ./jacktrip -v
```

This should be printed:

```bash
  JackTrip VERSION: 1.4.0-rc.2
  Copyright (c) 2008-2020 Juan-Pablo Caceres, Chris Chafe.
  SoundWIRE group at CCRMA, Stanford University
```
