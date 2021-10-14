# Front-end Architecture

## React JS & Redux

React JS, the main UI framework connecting to Redux Store to manage the state of components in the application.

## Amplify Cognito Auth

Using AWS Amplify, this project has used Auth package which connects to the user pool and identity pool created in the cloudformation backend.
* [Cognito authentication](https://docs.amplify.aws/lib/auth/getting-started/q/platform/js) featuring user pools (a user directory provided by AWS, controls permission to access AWS resources in authenticated accounts) and identity pools (controls permission to access AWS resources for guest users)

## WebSocket Api

A messaging protocol for bi-directional communication between the front-end and back-end. Once logged in, the WebSocket Client in the frontend will try to establish a connection to the WebSocket Server in the backend.While a room is being configured in the backend, the room status will be reflected in the UI through the exchange of websocket messages, so there is no need to refresh the page with the help of redux's state updates. 

As a cost-saving feature, AWS’s WebSocket API is configured to terminate the WebSocket connection after ten minutes if no communications are exchanged, neither from back-end to front-end, or front-end to back-end. To secure the connection, if a user is still on the website, messages will be sent every ten minutes from the front-end to keep the WebSocket server in the back-end running.
