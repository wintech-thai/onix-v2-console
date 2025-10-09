interface Resources {
  "common": {
    "auth": {
      "confirmNewPassword": "Confirm New Password",
      "confirmNewPasswordRequired": "Confirm new password is required",
      "currentPassword": "Current Password",
      "currentPasswordRequired": "Current password is required",
      "error": {
        "form": {
          "password": "Please enter your password",
          "username": "Please enter your username"
        },
        "invalidCredentials": "Invalid username or password"
      },
      "newPassword": "New Password",
      "newPasswordRequired": "New password is required",
      "password": "Password",
      "passwordMismatch": "New password and confirm new password do not match",
      "signInHeader": "Sign In to your account",
      "signInLabel": "Sign In",
      "success": {
        "login": "Login successful"
      },
      "updatePasswordHeader": "Change Password",
      "updatePasswordesc": "Please update your password to continue.",
      "username": "Username",
      "validPassword": {
        "1": "Length of password must be between 7-15",
        "2": "At least 1 lowercase letter",
        "3": "At least 1 uppercase letter",
        "4": "At least 1 special character in this set {#, !, @, $}",
        "IDP_UPDATE_PASSWORD_ERROR": "Unable to login with current password!!!"
      }
    },
    "common": {
      "cancel": "Cancel",
      "error": "An error occurred",
      "loading": "Loading...",
      "noData": "No data available",
      "ok": "OK",
      "save": "Save",
      "welcome": "Welcome"
    },
    "error": {
      "description": "We encountered an unexpected error. Please try again or contact support if the problem persists.",
      "errorDetails": "Error Details",
      "goBack": "Go Back",
      "goHome": "Go to Home",
      "hideDetails": "Hide Details",
      "retry": "Try Again",
      "showDetails": "Show Details",
      "title": "Oops! Something went wrong"
    },
    "navbar": {
      "logout": "Logout",
      "profile": "Profile",
      "settings": "Settings",
      "updatePassword": "Change Password"
    },
    "not-found": {
      "contactSupport": "If you think this is a bug, please contact support.",
      "description": "Sorry, the page you are looking for does not exist.",
      "goBack": "Go Back",
      "home": "Go to Home",
      "title": "404 - Page Not Found"
    },
    "organization": {
      "notFound": "No organization found.",
      "selectOrganization": "Select organization"
    },
    "qrcode": {
      "actions": {
        "bindToCustomer": "Bind to Customer",
        "bindToProduct": "Bind To Product",
        "unVerifyScanItem": "Un-Verify Scan Item"
      },
      "columns": {
        "action": "Action",
        "pin": "Pin",
        "productCode": "Product Code",
        "scanCount": "Scan Count",
        "serial": "Serial",
        "url": "URL",
        "verified": "Verified",
        "verifiedDate": "Verified Date"
      },
      "create": {
        "copySuccess": "Copied to clipboard",
        "copyTooltip": "Copy payload to clipboard",
        "error": "Failed to create scan item",
        "fields": {
          "pin": "Pin",
          "serial": "Serial"
        },
        "success": "Scan item created successfully",
        "title": "Create Scan Item",
        "validation": {
          "pinDuplicate": "Pin {{pin}} already exist in our database!!!",
          "pinRequired": "Pin is required",
          "serialDuplicate": "Serial {{serial}} already exist in our database!!!",
          "serialRequired": "Serial is required"
        }
      },
      "delete": {
        "error": "Failed to delete scan item",
        "message": "Are you sure you want to delete the selected scan items? This action cannot be undone.",
        "success": "Deleted scan item successfully",
        "title": "Confirm Deletion"
      },
      "filter": {
        "add": "ADD",
        "config": "CONFIG",
        "delete": "DELETE",
        "fullTextSearch": "Full Text Search",
        "scanItemAction": "Scan Item Action",
        "scanItemTemplate": "Scan Item Template",
        "search": "Search",
        "searchPlaceholder": "Enter search value",
        "selectSearchField": "Select search field"
      },
      "modal": {
        "copySuccess": "Copied to clipboard",
        "copyTooltip": "Copy scan item data to clipboard",
        "error": "Error loading scan item details",
        "fields": {
          "applied": "Applied",
          "createdDate": "Created Date",
          "customerId": "Customer ID",
          "itemGroup": "Item Group",
          "itemId": "Item ID",
          "no": "No",
          "pin": "Pin",
          "productCode": "Product Code",
          "registeredDate": "Registered Date",
          "runId": "Run ID",
          "scanCount": "Scan Count",
          "sequenceNo": "Sequence No",
          "serial": "Serial",
          "tags": "Tags",
          "uploadPath": "Upload Path",
          "url": "URL",
          "used": "Used",
          "verified": "Verified",
          "yes": "Yes"
        },
        "loading": "Loading scan item details...",
        "title": "Scan Item Detail"
      },
      "scanItemAction": {
        "buttons": {
          "defaultValue": "Default Value"
        },
        "error": {
          "create": "Failed to create scan item action",
          "loadDefault": "Error loading default values",
          "update": "Failed to update scan item action"
        },
        "fields": {
          "iv": "IV",
          "key": "Key",
          "redirectUrl": "Redirect URL",
          "rescanCheck": "Re-scan check",
          "theme": "Theme"
        },
        "success": {
          "create": "Scan item action created successfully",
          "update": "Scan item action updated successfully"
        },
        "title": "Scan Item Action",
        "validation": {
          "createdDateRequired": "Created Date is required",
          "encryptionIVRequired": "Encryption IV is required",
          "encryptionKeyRequired": "Encryption Key is required",
          "invalidUrl": "Invalid URL format",
          "orgIdRequired": "Organization ID is required",
          "registeredAwareFlagRequired": "Registered Aware Flag is required"
        }
      },
      "unverify": {
        "error": "Failed to un-verify scan item",
        "message": "Are you sure you want to un-verify this scan item? This will remove its verification status.",
        "success": "Scan item un-verified successfully",
        "title": "Confirm Un-Verification"
      }
    },
    "sidebar": {
      "admin": {
        "label": "Administration",
        "sub": {
          "1": "API Keys",
          "2": "Users",
          "3": "Audit Log"
        }
      },
      "dashboard": {
        "label": "Dashboard",
        "sub": {
          "1": "Overview"
        }
      },
      "general": {
        "label": "General",
        "sub": {
          "1": "Products",
          "2": "Customers",
          "3": "Scan Items",
          "4": "Jobs"
        }
      }
    },
    "table": {
      "noResults": "No results.",
      "of": "of",
      "rowsPerPage": "Rows per page:"
    }
  }
}

export default Resources;
