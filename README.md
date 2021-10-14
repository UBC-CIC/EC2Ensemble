# PMCA-CIC

## Project Overview

[Jacktrip](https://ccrma.stanford.edu/software/jacktrip/) is a command line program, used by musicians all over the world to collaborate with each other remotely through
the internet. Other more commonly used Voice over Internet Protocol (VoIP) softwares, such as Zoom or WhatsApp, have a noticeable audio quality drop while using them. This is unwanted when trying to collaborate and perform music together. Jacktrip provides a solution by supporting bidirectional, high quality, uncompressed audio streaming with any number of channels, allowing musicians to perform together through the internet, while having superb audio quality and low latency.

However, creating Jacktrip servers is not an easy task, especially for musicians whom are usually less technologically literate. Thus, this prototype aims to be a
user-friendly ReactJS web application, used to manage [Amazon EC2](https://aws.amazon.com/ec2) instances that is running
Jacktrip Hub Servers in multiple AWS regions.

## Table of Contents

| Index                                               | Description                                    |
| :-------------------------------------------------- | :--------------------------------------------- |
| [Stack Overview](#stack-overview)                   | Examine the application architecture.          |
| [High Level Architecture](#high-level-architecture) | Check out the application's user interface.    |
| [Application Screenshots](#application-screenshots) | Learn more about each stack of the application |
| [Deployment](#deployment)                           | Learn how to deploy this project yourself.     |
| [Credits](#credits)                                 | Meet the team behind this                      |
| [License](#license)                                 | License details.                               |

## Stack Overview

WIP

## High Level Architecture

![alt text](docs/images/readme/architecture_diagram.png)

<h6 align="center">Architecture Diagram</h6>

## Application Screenshots

![login page](./docs/images/readme/login_page.png)

<h6 align="center">Application Login Page</h6>

---

![home page](./docs/images/readme/main_page_with_rooms.png)

<h6 align="center">Main Page after the user logged in with rooms already created</h6>

---

![home page](./docs/images/readme/create_aws_room.png)

<h6 align="center">Entering details to create a room on the AWS server</h6>

---

![home page](./docs/images/readme/aws_room_in_creation.png)

<h6 align="center">Room in creation status</h6>

---

![home page](./docs/images/readme/aws_room_success.png)

<h6 align="center">Status update when the room is successfully created</h6>
Once a room is successfully created, you can either (from right to left)

1. Stop: terminates the room server from running, the IP address would be removed and deleted from the database since the room is not running anymore.

2. Edit settings: edits the current information of the room, including room name, description, frequency, buffer and the region of where the room server is located.

3. Restart jacktrip: restarts the jackstrip server

4. Delete: stops the room server and delete the room information from the database.

5. Share: a link which other guest users can access to see the information and status of the room.

---

![home page](./docs/images/readme/create_external_room.png)

<h6 align="center">Creating a room with a Jacktrip Server IP Address</h6>

---

![home page](./docs/images/readme/external_room_success.png)

<h6 align="center">Successfully adding an external room into the database</h6>

---

![home page](./docs/images/readme/share_room_dialog.png)

<h6 align="center">A link to share with other people to view the information of the specific room</h6>

---

![home page](./docs/images/readme/shared_room.png)

<h6 align="center">A privately accessed page that shows the information of a specific room</h6>

## Stack Details

-   [Authentication](./docs/AuthenticationArchitecture.md)
-   [Frontend User Interface](./docs/FrontendArchitecture.md)
-   [Backend Data Aggregation](./docs/DataAggregationArchitecture.md)

## Deployment

To deploy this solution into your AWS Account please follow our [Deployment Guide](docs/DeploymentGuide.md)

## Changelog

## Credits

This prototype was architected and developed by Andrew Shieh and Jacqueline Huang, with guidance from the [UBC CIC](https://cic.ubc.ca/)
technical and project management teams.

## License

This project is distributed under the [MIT License](./LICENSE).
