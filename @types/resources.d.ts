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
          "encryptionIVLength": "Encryption IV must be exactly 16 characters",
          "encryptionKeyLength": "Encryption Key must be exactly 16 characters",
          "invalidUrl": "Invalid URL format",
          "orgIdRequired": "Organization ID is required",
          "redirectUrlMax": "Redirect URL must be at most 80 characters",
          "redirectUrlRequired": "Redirect URL is required",
          "registeredAwareFlagRequired": "Registered Aware Flag is required",
          "themeVerifyMax": "Theme must be at most 15 characters"
        }
      },
      "scanItemTemplate": {
        "buttons": {
          "defaultValue": "Default Value"
        },
        "error": {
          "create": "Failed to create scan item template",
          "loadDefault": "Error loading default values",
          "update": "Failed to update scan item template"
        },
        "fields": {
          "generatorCount": "Item Count",
          "notificationEmail": "Notification Email",
          "pinDigit": "Pin Length",
          "serialDigit": "Serial Length",
          "serialPrefixDigit": "Prefix Length",
          "urlTemplate": "URL Template"
        },
        "success": {
          "create": "Scan item template created successfully",
          "update": "Scan item template updated successfully"
        },
        "title": "Scan Item Template",
        "validation": {
          "createdDateRequired": "Created Date is required",
          "generatorCountRequired": "Item Count is required",
          "invalidEmail": "Invalid email format",
          "orgIdRequired": "Organization ID is required",
          "pinDigitMax": "Pin Length must be at most 9",
          "pinDigitMin": "Pin Length must be at least 7",
          "serialDigitMax": "Serial Length must be at most 9",
          "serialDigitMin": "Serial Length must be at least 7",
          "serialPrefixDigitMax": "Prefix Length must be at most 3",
          "serialPrefixDigitMin": "Prefix Length must be at least 2",
          "urlTemplateRequired": "URL Template is required"
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
  },
  "product": {
    "product": {
      "actions": {
        "back": "Back",
        "cancel": "Cancel",
        "create": "Create",
        "delete": "Delete",
        "save": "Save",
        "update": "Update"
      },
      "attach": {
        "message": "Are you sure you want to attach this product?",
        "title": "Attach Product"
      },
      "content": {
        "placeholder": "Enter product content...",
        "title": "Content"
      },
      "createTitle": "Create Product",
      "detail": {
        "code": "Code",
        "description": "Description",
        "itemType": "Item Type",
        "tags": "Tags",
        "title": "Product Detail"
      },
      "form": {
        "leavePage": "Leave Page",
        "unsavedChanges": "You have unsaved changes. Are you sure you want to leave?"
      },
      "messages": {
        "createError": "Failed to create product",
        "createSuccess": "Product created successfully",
        "deleteError": "Failed to delete product",
        "deleteSuccess": "Product deleted successfully",
        "updateError": "Failed to update product",
        "updateSuccess": "Product updated successfully"
      },
      "narratives": {
        "narrative": "Narrative",
        "title": "Narratives"
      },
      "properties": {
        "available": "Available Properties",
        "loading": "Loading properties...",
        "noAvailable": "No available properties",
        "noSelected": "No selected properties",
        "property": "Property",
        "selected": "Selected Properties",
        "title": "Properties",
        "value": "Value"
      },
      "table": {
        "actions": {
          "productImage": "Product Images"
        },
        "columns": {
          "action": "Action",
          "code": "Product Code",
          "description": "Description",
          "noImage": "No Image",
          "productImage": "Product Image",
          "select": "Select",
          "selectAll": "Select all",
          "selectRow": "Select row",
          "tags": "Tags"
        },
        "filter": {
          "add": "ADD",
          "attach": "ATTACH",
          "delete": "DELETE",
          "fullTextSearch": "Full Text Search",
          "search": "Search",
          "searchPlaceholder": "Enter search value",
          "selectSearchField": "Select search field"
        }
      },
      "title": "Products",
      "updateTitle": "Update Product",
      "validation": {
        "atLeastOneNarrative": "At least one narrative is required",
        "codeRequired": "Code is required",
        "contentRequired": "Content is required",
        "descriptionRequired": "Description is required",
        "narrativeRequired": "Narrative text is required",
        "tagsRequired": "At least one tag is required"
      }
    }
  }
}

export default Resources;
