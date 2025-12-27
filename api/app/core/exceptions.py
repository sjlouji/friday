from fastapi import HTTPException, status


class BeancountFileNotFoundError(HTTPException):
    def __init__(self, file_path: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Beancount file not found: {file_path}",
        )


class BeancountFileError(HTTPException):
    def __init__(self, message: str):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Beancount file error: {message}",
        )


class AccountAlreadyExistsError(HTTPException):
    def __init__(self, account_name: str):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Account '{account_name}' already exists",
        )


class InvalidAccountNameError(HTTPException):
    def __init__(self, account_name: str, reason: str = ""):
        detail = f"Invalid account name: '{account_name}'"
        if reason:
            detail += f". {reason}"
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail,
        )

