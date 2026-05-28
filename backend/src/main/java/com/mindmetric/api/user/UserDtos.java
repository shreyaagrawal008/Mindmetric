package com.mindmetric.api.user;

public class UserDtos {
  public record SignupRequest(String parentName, String parentPhone, String email, String username, String password, String childName, String grade) {}
  public record LoginRequest(String username, String password) {}
  public record GoogleStartRequest(String email, String parentName) {}
  public record GoogleFinalizeRequest(String email, String credential, String parentName, String parentPhone, String childName, String grade) {}
  public record GoogleTokenRequest(String credential) {}
  public record ForgotPasswordRequest(String email) {}
  public record ForgotPasswordResponse(String maskedEmail, int expiresInMinutes, String message) {}
  public record UserResponse(Long id, String name, String username, String email, String role, String gradeLevel, String childName, String parentName, String parentPhone, String authType, boolean premiumStatus, int points) {}
}
