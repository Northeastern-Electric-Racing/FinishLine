"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.AccessDeniedGuestException = exports.AccessDeniedMemberException = exports.AccessDeniedAdminOnlyException = exports.AccessDeniedException = exports.NotFoundException = exports.DeletedException = exports.InvalidOrganizationException = exports.HttpException = void 0;
/**
 * Custom Error type that has a status code and a message (from the default Error class)
 */
var HttpException = /** @class */ (function (_super) {
    __extends(HttpException, _super);
    /**
     * Constructs an error with a status and message.
     * @param status the status code of the error (e.g., 400, 404, 403)
     * @param message the message to send with the error
     */
    function HttpException(status, message) {
        var _this = _super.call(this, message) || this;
        _this.status = status;
        return _this;
    }
    return HttpException;
}(Error));
exports.HttpException = HttpException;
var InvalidOrganizationException = /** @class */ (function (_super) {
    __extends(InvalidOrganizationException, _super);
    /**
     * Constructs an invalid organization error
     * @param item the name of the object that has an invalid organization
     */
    function InvalidOrganizationException(item) {
        return _super.call(this, 400, "".concat(item, " does not exist in current organization!")) || this;
    }
    return InvalidOrganizationException;
}(HttpException));
exports.InvalidOrganizationException = InvalidOrganizationException;
var DeletedException = /** @class */ (function (_super) {
    __extends(DeletedException, _super);
    /**
     * Constructs a deleted error
     * @param name the name of the thing that is deleted
     * @param id the id of the thing that is deleted
     */
    function DeletedException(name, id) {
        return _super.call(this, 404, "".concat(name, " with id: ").concat(id, " has been deleted already!")) || this;
    }
    return DeletedException;
}(HttpException));
exports.DeletedException = DeletedException;
var NotFoundException = /** @class */ (function (_super) {
    __extends(NotFoundException, _super);
    /**
     * Constructs a not found error
     * @param name the name of the thing that can't be found
     * @param id the id of the thing that can't be found
     */
    function NotFoundException(name, id) {
        return _super.call(this, 404, "".concat(name, " with id: ").concat(id, " not found!")) || this;
    }
    return NotFoundException;
}(HttpException));
exports.NotFoundException = NotFoundException;
var AccessDeniedException = /** @class */ (function (_super) {
    __extends(AccessDeniedException, _super);
    /**
     * Constructs an access denied error
     * @param message the optional message to add to the 'Access Denied' message
     */
    function AccessDeniedException(message) {
        return _super.call(this, 403, 'Access Denied' + (message ? ": ".concat(message) : '!')) || this;
    }
    return AccessDeniedException;
}(HttpException));
exports.AccessDeniedException = AccessDeniedException;
var AccessDeniedAdminOnlyException = /** @class */ (function (_super) {
    __extends(AccessDeniedAdminOnlyException, _super);
    /**
     * Constructs an access denied error that non-admins may receive.
     * @param message the action that is disallowed.
     */
    function AccessDeniedAdminOnlyException(message) {
        return _super.call(this, "admin and app-admin only have the ability to ".concat(message)) || this;
    }
    return AccessDeniedAdminOnlyException;
}(AccessDeniedException));
exports.AccessDeniedAdminOnlyException = AccessDeniedAdminOnlyException;
var AccessDeniedMemberException = /** @class */ (function (_super) {
    __extends(AccessDeniedMemberException, _super);
    /**
     * Constructs an access denied error that guests and members may receive.
     * @param message the action that is disallowed.
     */
    function AccessDeniedMemberException(message) {
        return _super.call(this, "members and guests do not have the ability to ".concat(message)) || this;
    }
    return AccessDeniedMemberException;
}(AccessDeniedException));
exports.AccessDeniedMemberException = AccessDeniedMemberException;
var AccessDeniedGuestException = /** @class */ (function (_super) {
    __extends(AccessDeniedGuestException, _super);
    /**
     * Constructs an access denied error that guests may receive.
     * @param message the action that is disallowed.
     */
    function AccessDeniedGuestException(message) {
        return _super.call(this, "guests do not have the ability to ".concat(message)) || this;
    }
    return AccessDeniedGuestException;
}(AccessDeniedException));
exports.AccessDeniedGuestException = AccessDeniedGuestException;
/*
 * Error handling middleware. Takes the error and sends back the status of it and the message
 */
var errorHandler = function (error, _req, res, next) {
    if (res.headersSent) {
        return next(error);
    }
    if (error instanceof HttpException) {
        res.status(error.status).json({ message: error.message });
    }
    else {
        res.status(500).json({ message: JSON.stringify(error) });
        throw error;
    }
};
exports.errorHandler = errorHandler;
