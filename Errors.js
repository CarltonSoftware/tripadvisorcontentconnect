function GeneralError(message) {
  this.message = (message || '');
};
GeneralError.prototype = Error.prototype;


function IdNotSpecified() {
  GeneralError.apply(this, arguments); 
  this.message = 'ID not specified';
};
IdNotSpecified.prototype = GeneralError.prototype;
IdNotSpecified.prototype.constructor = IdNotSpecified;

function PathNotSpecified(message) {
  GeneralError.apply(this, arguments); 
  this.message = 'Path not specified';
};
PathNotSpecified.prototype = GeneralError.prototype;
PathNotSpecified.prototype.constructor = PathNotSpecified;

function AlreadyActive(message) {
  GeneralError.apply(this, arguments); 
  this.message = 'Listing is already active'; 
}
AlreadyActive.prototype = GeneralError.prototype;
AlreadyActive.prototype.constructor = AlreadyActive;

function AlreadyDeActive(message) {
  GeneralError.apply(this, arguments); 
  this.message = 'Listing is already deactive'; 
}
AlreadyDeActive.prototype = GeneralError.prototype;
AlreadyDeActive.prototype.constructor = AlreadyDeActive;

function StatusError(response) {
  let statusCode = response.statusCode;
  let errors = [];
  for (var i in response.error) {
    let error = {};
    for (var j in response.error[i]) {
      error[j] = response.error[i][j];
    }

    errors.push(error);
  }

  this.getErrors = () => {
    return errors;
  };

  this.getStatusCode = () => {
    return statusCode;
  };
}
StatusError.prototype = Error.prototype;

function DomainError(error) {
  this.domain = error.domain;
  this.status = error.status;
  this.description = error.description;
  this.violations = error.violations;
}
DomainError.prototype = Error.prototype;

function DomainErrors(response) {
  this.errors = JSON.parse(response.error).map((err) => {
    return new DomainError(err);
  });
}
DomainErrors.prototype = Error.prototype;

module.exports = {
  IdNotSpecified: IdNotSpecified,
  PathNotSpecified: PathNotSpecified,
  AlreadyActive: AlreadyActive,
  AlreadyDeActive: AlreadyDeActive,
  StatusError: StatusError,
  Error: GeneralError,
  DomainErrors: DomainErrors
}