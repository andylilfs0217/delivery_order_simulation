# Delivery Order Simulation

## Problem Statement

Google Maps API (https://cloud.google.com/maps-platform/routes/) is used for getting the distance for the order.


## Api Interface

The following are the API specifications.

#### Place order

  - Method: `POST`
  - URL path: `/orders`
  - Request body:

    ```
    {
        "origin": ["START_LATITUDE", "START_LONGITUDE"],
        "destination": ["END_LATITUDE", "END_LONGITUDE"]
    }
    ```

  - Response:

    Header: `HTTP 200`
    Body:
      ```
      {
          "id": <order_id>,
          "distance": <total_distance>,
          "status": "UNASSIGNED"
      }
      ```
    or

    Header: `HTTP <HTTP_CODE>`
    Body:

      ```
      {
          "error": "ERROR_DESCRIPTION"
      }
      ```

  - Notes:

    - Coordinates in request are an array of exactly **two** strings. The type shall only be strings, not integers or floats.
    - Distance in response is integer in meters


#### Take order

  - Method: `PATCH`
  - URL path: `/orders/:id`
  - Request body:
    ```
    {
        "status": "TAKEN"
    }
    ```
  - Response:
    Header: `HTTP 200`
    Body:
      ```
      {
          "status": "SUCCESS"
      }
      ```
    or

    Header: `HTTP <HTTP_CODE>`
    Body:
      ```
      {
          "error": "ERROR_DESCRIPTION"
      }
      ```

  - Notes:

    - Since an order can only be taken once, race condition is considered.
    - When there are concurrent requests to take a same order, only one can take the order while the other will fail.


#### Order list

  - Method: `GET`
  - Url path: `/orders?page=:page&limit=:limit`
  - Response:
    Header: `HTTP 200`
    Body:
      ```
      [
          {
              "id": <order_id>,
              "distance": <total_distance>,
              "status": <ORDER_STATUS>
          },
          ...
      ]
      ```

    or

    Header: `HTTP <HTTP_CODE>` Body:

    ```
    {
        "error": "ERROR_DESCRIPTION"
    }
    ```

  - Requirements:

    - Page number starts with 1
    - If page or limit is not a valid integer then return error response
    - If there is no result, return an empty array json in response body

## Environment set up

An environment example is provided as `.env.example`. Duplicate the file and change the file name into `.env`. The following variables in `.env` should be set up:

- GOOGLE_API_KEY
