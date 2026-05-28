package com.mindmetric.api.user;

import java.util.Locale;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
  private final UserRepository users;
  private final JwtDecoder googleJwtDecoder;
  private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
  private final SecureRandom random = new SecureRandom();
  private final Map<String, ResetCode> resetCodes = new ConcurrentHashMap<>();

  public AuthController(UserRepository users, JwtDecoder googleJwtDecoder) {
    this.users = users;
    this.googleJwtDecoder = googleJwtDecoder;
  }

  @PostMapping("/signup")
  public UserDtos.UserResponse signup(@RequestBody UserDtos.SignupRequest request) {
    validateManualSignup(request);
    String email = normalizeEmail(request.email());
    users.findByEmail(email).ifPresent(existing -> {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
    });
    users.findByUsername(request.username()).ifPresent(existing -> {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
    });

    MindmetricUser user = new MindmetricUser();
    user.setName(request.childName().trim());
    user.setChildName(request.childName().trim());
    user.setParentName(request.parentName().trim());
    user.setParentPhone(normalizePhone(request.parentPhone()));
    user.setEmail(email);
    user.setUsername(request.username().trim());
    user.setPasswordHash(encoder.encode(request.password()));
    user.setRole("Student");
    user.setGradeLevel(normalizeGrade(request.grade()));
    user.setAuthType("MANUAL");
    user.setPoints(0);
    user.setPremiumStatus(false);
    users.save(user);
    return toResponse(user);
  }

  @PostMapping("/google/start")
  public UserDtos.UserResponse googleStart(@RequestBody UserDtos.GoogleStartRequest request) {
    String email = normalizeEmail(request.email());
    return users.findByEmail(email).map(this::toResponse).orElseThrow(() ->
      new ResponseStatusException(HttpStatus.NOT_FOUND, "Google profile needs finalization")
    );
  }

  @PostMapping("/google/finalize")
  public UserDtos.UserResponse googleFinalize(@RequestBody UserDtos.GoogleFinalizeRequest request) {
    GoogleProfile profile = verifyGoogleCredential(request.credential());
    String email = normalizeEmail(profile.email());
    if (!email.equals(normalizeEmail(request.email()))) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Google account changed. Please sign in again.");
    }
    if (isBlank(request.childName())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Child name is required");
    }
    validateName(request.parentName(), "Parent name");
    validateName(request.childName(), "Child name");

    MindmetricUser user = users.findByEmail(email).map(existing -> {
      if (!"GOOGLE".equalsIgnoreCase(existing.getAuthType())) {
        throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists. Please login with password.");
      }
      return existing;
    }).orElseGet(MindmetricUser::new);

    user.setEmail(email);
    user.setParentName(isBlank(request.parentName()) ? "Google Parent" : request.parentName().trim());
    user.setParentPhone(normalizePhone(request.parentPhone()));
    user.setChildName(request.childName().trim());
    user.setName(request.childName().trim());
    if (isBlank(user.getUsername())) {
      user.setUsername(uniqueGoogleUsername(email));
    }
    if (isBlank(user.getPasswordHash())) {
      user.setPasswordHash(encoder.encode("GOOGLE_OAUTH_ACCOUNT"));
    }
    user.setRole("Student");
    user.setGradeLevel(normalizeGrade(request.grade()));
    user.setAuthType("GOOGLE");
    if (user.getId() == null) {
      user.setPoints(0);
      user.setPremiumStatus(false);
    }
    users.save(user);
    return toResponse(user);
  }

  @PostMapping("/google")
  public UserDtos.UserResponse google(@RequestBody UserDtos.GoogleTokenRequest request) {
    GoogleProfile profile = verifyGoogleCredential(request.credential());
    return users.findByEmail(profile.email()).map(this::toResponse).orElseThrow(() ->
      new ResponseStatusException(HttpStatus.NOT_FOUND, "Google profile needs finalization")
    );
  }

  private GoogleProfile verifyGoogleCredential(String credential) {
    if (isBlank(credential)) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Google credential is required");
    }

    Jwt jwt;
    try {
      jwt = googleJwtDecoder.decode(credential);
    } catch (JwtException ex) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid Google credential");
    }

    String email = normalizeEmail(jwt.getClaimAsString("email"));
    Boolean verified = jwt.getClaimAsString("email_verified") == null
      ? jwt.getClaim("email_verified")
      : Boolean.valueOf(jwt.getClaimAsString("email_verified"));
    if (!Boolean.TRUE.equals(verified)) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Google email is not verified");
    }

    return new GoogleProfile(email);
  }

  @PostMapping("/login")
  public UserDtos.UserResponse login(@RequestBody UserDtos.LoginRequest request) {
    if (isBlank(request.username()) || isBlank(request.password())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username/email and password are required");
    }
    String login = request.username().trim().toLowerCase(Locale.ROOT);
    MindmetricUser user = (login.contains("@") ? users.findByEmail(login) : users.findByUsername(login))
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid login"));
    if (!encoder.matches(request.password(), user.getPasswordHash())) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid login");
    }
    return toResponse(user);
  }

  @PostMapping("/forgot-password")
  public UserDtos.ForgotPasswordResponse forgotPassword(@RequestBody UserDtos.ForgotPasswordRequest request) {
    String email = normalizeEmail(request.email());
    users.findByEmail(email).orElseThrow(() ->
      new ResponseStatusException(HttpStatus.NOT_FOUND, "No MindMetric account is registered with that email")
    );

    String code = String.format("%06d", random.nextInt(1_000_000));
    resetCodes.put(email, new ResetCode(code, Instant.now().plusSeconds(600)));
    System.out.printf("MindMetric password reset code for %s: %s%n", email, code);
    return new UserDtos.ForgotPasswordResponse(maskEmail(email), 10, "Reset code sent");
  }

  @PutMapping("/{id}/premium")
  public UserDtos.UserResponse premium(@PathVariable Long id, @RequestParam boolean enabled) {
    MindmetricUser user = users.findById(id)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    user.setPremiumStatus(enabled);
    users.save(user);
    return toResponse(user);
  }

  private void validateManualSignup(UserDtos.SignupRequest request) {
    if (isBlank(request.parentName()) || isBlank(request.parentPhone()) || isBlank(request.email()) || isBlank(request.username()) || isBlank(request.password()) || isBlank(request.childName())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "All signup fields are required");
    }
    validateName(request.parentName(), "Parent name");
    validateName(request.childName(), "Child name");
    normalizePhone(request.parentPhone());
    if (!request.email().matches("(?i)^[^@\\s]+@gmail\\.com$")) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Enter a valid @gmail.com address");
    }
    if (!request.username().matches("^[A-Za-z0-9_]{3,20}$")) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username must be 3-20 characters using letters, numbers, or underscores");
    }
    if (!request.password().matches("^(?=.*[A-Za-z])(?=.*\\d).{8,}$")) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be at least 8 characters and include a number");
    }
  }

  private String normalizeEmail(String email) {
    if (isBlank(email) || !email.matches("(?i)^[^@\\s]+@gmail\\.com$")) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Enter a valid @gmail.com address");
    }
    return email.trim().toLowerCase(Locale.ROOT);
  }

  private void validateName(String value, String label) {
    if (isBlank(value) || !value.trim().matches("^[A-Za-z][A-Za-z ]{1,49}$")) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, label + " can use letters and spaces only");
    }
  }

  private String normalizePhone(String phone) {
    if (isBlank(phone) || !phone.trim().matches("^\\d{10}$")) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Phone number must be exactly 10 digits");
    }
    return phone.trim();
  }

  private String normalizeGrade(String grade) {
    if (isBlank(grade) || !grade.matches("Pre-K|K|Grade [1-6]")) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Grade must be Pre-K, K, or Grade 1 through Grade 6");
    }
    return grade.trim();
  }

  private String uniqueGoogleUsername(String email) {
    String base = email.substring(0, email.indexOf('@')).replaceAll("[^A-Za-z0-9]", "").toLowerCase(Locale.ROOT);
    if (base.isBlank()) base = "googleuser";
    String candidate = base;
    int suffix = 1;
    while (users.findByUsername(candidate).isPresent()) {
      suffix++;
      candidate = base + suffix;
    }
    return candidate;
  }

  private boolean isBlank(String value) {
    return value == null || value.trim().isEmpty();
  }

  private String firstPresent(String... values) {
    for (String value : values) {
      if (!isBlank(value)) return value.trim();
    }
    return "Google User";
  }

  private String maskEmail(String email) {
    int at = email.indexOf('@');
    if (at <= 1) return "***" + email.substring(at);
    return email.charAt(0) + "***" + email.substring(at - 1);
  }

  private UserDtos.UserResponse toResponse(MindmetricUser user) {
    return new UserDtos.UserResponse(
      user.getId(),
      user.getName(),
      user.getUsername(),
      user.getEmail(),
      user.getRole(),
      user.getGradeLevel(),
      user.getChildName(),
      user.getParentName(),
      user.getParentPhone(),
      user.getAuthType(),
      user.isPremiumStatus(),
      user.getPoints()
    );
  }

  private record ResetCode(String code, Instant expiresAt) {}
  private record GoogleProfile(String email) {}
}

