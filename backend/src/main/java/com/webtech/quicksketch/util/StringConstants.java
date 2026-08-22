package com.webtech.quicksketch.util;

public final class StringConstants 
{
    private StringConstants() {}

    /* DTO validators */
    public static final String EMAIL_REGEX = "[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";
    public static final String INVALID_EMAIL_MESSAGE = "Invalid email format";

    public static final String USERNAME_REGEX = "^[a-zA-Z0-9_]{3,30}$";
    public static final String INVALID_USERNAME_MESSAGE = "Username must be 3-30 characters long and can only contain alphanumeric characters, underscores and periods";

    public static final String VALIDATION_PATTERN= "^(?=.*[A-Za-z])(?=.*\\d).{8,64}$";
    public static final String PASSWORD_MESSAGE = "Password must be 8 characters or longer and contain both letters and numbers";

    /* Service errors */
    public static final String EMAIL_ALREADY_REGISTERED_MESSAGE = "Email already registered";
    public static final String INVALID_TOKEN_MESSAGE = "Invalid or expired token";
    public static final String INVALID_CREDENTIALS_MESSAGE = "Invalid credentials";

    /* Generic */
    public static final String NOT_FOUND(String resource) { return resource + " not found"; }
}
