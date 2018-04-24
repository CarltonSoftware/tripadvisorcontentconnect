function GeneralError(message) {
  this.message = (message || '');
};
GeneralError.prototype = Object.create(Error.prototype);
GeneralError.prototype.constructor = GeneralError;

function IdNotSpecified() {
  GeneralError.apply(this, arguments); 
  this.message = 'ID not specified';
};
IdNotSpecified.prototype = Object.create(GeneralError.prototype);
IdNotSpecified.prototype.constructor = IdNotSpecified;


function PathNotSpecified(message) {
  GeneralError.apply(this, arguments); 
  this.message = 'Path not specified';
};
PathNotSpecified.prototype = Object.create(GeneralError.prototype);
PathNotSpecified.prototype.constructor = PathNotSpecified;


function AlreadyActive(message) {
  GeneralError.apply(this, arguments); 
  this.message = 'Listing is already active'; 
}
AlreadyActive.prototype = Object.create(GeneralError.prototype);
AlreadyActive.prototype.constructor = AlreadyActive;


function AlreadyDeActive(message) {
  GeneralError.apply(this, arguments); 
  this.message = 'Listing is already deactive'; 
}
AlreadyDeActive.prototype = Object.create(GeneralError.prototype);
AlreadyDeActive.prototype.constructor = AlreadyDeActive;


function StatusError(response) {
  let statusCode = response.statusCode;
  let errors = [];

  if (response.error) {
    if (typeof response.error === 'string') {
      response.error = JSON.parse(response.error);
    }

    if (Array.isArray(response.error)) {
      for (var i in response.error) {
        let error = {};
        for (var j in response.error[i]) {
          error[j] = response.error[i][j];
        }

        errors.push(error);
      }
    } else {
      errors.push(response.error);
    }
  }

  this.getErrors = () => {
    return errors || [];
  };

  this.setErrors = (e) => {
    errors = e;
    return this;
  };

  this.clearErrors = () => {
    errors = [];
    return this;
  };

  this.getStatusCode = () => {
    return statusCode;
  };

  this.getDescriptions = () => {
    return [];
  };
}
StatusError.prototype = Object.create(Error.prototype);
StatusError.prototype.constructor = StatusError;


function BadRequestError(response) {
  StatusError.apply(this, arguments); 
  this.error = response.error;
  this.message = response.error.detail;
}
BadRequestError.prototype = Object.create(StatusError.prototype);
BadRequestError.prototype.constructor = BadRequestError;


function DomainError(error) {
  this.domain = error.domain;
  this.status = error.status;
  this.description = error.description;
  this.violations = error.violations;
}
DomainError.prototype = Object.create(Error.prototype);
DomainError.prototype.constructor = DomainError;


function DomainErrors(response) {
  StatusError.apply(this, arguments);
  this.setErrors(this.getErrors().map((err) => {
    return new DomainError(err);
  }));

  this.getViolations = () => {
    return this.getErrors().filter((err) => {
      return Array.isArray(err.violations);
    }).map((err) => {
      return err.violations;
    });
  };

  this.getFailureDomains = () => {
    return this.getErrors().filter((err) => {
      return typeof err.domain === 'string' && err.status === 'FAILURE';
    }).map((err) => {
      return err.domain;
    });
  };

  this.getDescriptions = () => {
    return this.getErrors().filter((err) => {
      return typeof err.description === 'string';
    }).map((err) => {
      return err.description;
    });
  };
}
DomainErrors.prototype = Object.create(StatusError.prototype);
DomainErrors.prototype.constructor = DomainErrors;

module.exports = {
  IdNotSpecified: IdNotSpecified,
  PathNotSpecified: PathNotSpecified,
  AlreadyActive: AlreadyActive,
  AlreadyDeActive: AlreadyDeActive,
  StatusError: StatusError,
  Error: GeneralError,
  GeneralError: GeneralError,
  BadRequestError: BadRequestError,
  DomainErrors: DomainErrors
}