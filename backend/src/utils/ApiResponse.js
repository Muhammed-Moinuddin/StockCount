class ApiResponse{
    constructor(statusCode, message, data){
        this.statusCode = statusCode
        this.data = data
        this.message = message !== undefined ? message : 'Success'
        this.success = statusCode < 400
    }
}

export {ApiResponse}