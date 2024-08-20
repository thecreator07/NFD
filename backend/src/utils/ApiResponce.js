class ApiResponse {
    constructor(statusCode, data, message = "Success") {
      this.statusCode = statusCode;
      this.data = data;
      this.message = message;
      this.success = statusCode < 400; //for success we use 200-299 range
    }
  }
  
  export { ApiResponse };
  