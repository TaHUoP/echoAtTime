## echoAtTime
 Simple application server that prints a message at a given time in the future.

## Installation and setup
  ```
  npm install
  cp .env.example .env
  docker-compose up
  ```
  
  Default ports for node and redis are 3000 and 6379 respectively. 
  Default settings can be customized in .env file   

## API
  The server provides one API method with two required parameters: time and text.
  Time must be a valid timestamp.
  ```
  POST /echoAtTime
  ``` 