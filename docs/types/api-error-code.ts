enum ApiErrorCode { // eslint-disable-line no-restricted-syntax
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  PayloadTooLarge = 413,
  InternalServerError = 500,
  BadGateway = 502,
  ServiceUnavailable = 503,
  LimitExceeded = 429,
}

export default ApiErrorCode; // eslint-disable-line import/no-default-export
