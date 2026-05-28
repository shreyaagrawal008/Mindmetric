package com.mindmetric.api.user;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "users")
public class MindmetricUser {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String name;

  @Column(nullable = false, unique = true)
  private String username;

  @Column(unique = true)
  private String email;

  @Column(nullable = false)
  private String passwordHash;

  @Column(nullable = false)
  private String role;

  @Column(nullable = false)
  private String gradeLevel;

  private String authType = "MANUAL";

  private String parentName;
  private String parentPhone;
  private String childName;
  private boolean premiumStatus;
  private int points;
  private Instant createdAt = Instant.now();

  public Long getId() { return id; }
  public String getName() { return name; }
  public void setName(String name) { this.name = name; }
  public String getUsername() { return username; }
  public void setUsername(String username) { this.username = username; }
  public String getEmail() { return email; }
  public void setEmail(String email) { this.email = email; }
  public String getPasswordHash() { return passwordHash; }
  public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
  public String getRole() { return role; }
  public void setRole(String role) { this.role = role; }
  public String getGradeLevel() { return gradeLevel; }
  public void setGradeLevel(String gradeLevel) { this.gradeLevel = gradeLevel; }
  public String getAuthType() { return authType; }
  public void setAuthType(String authType) { this.authType = authType; }
  public String getParentName() { return parentName; }
  public void setParentName(String parentName) { this.parentName = parentName; }
  public String getParentPhone() { return parentPhone; }
  public void setParentPhone(String parentPhone) { this.parentPhone = parentPhone; }
  public String getChildName() { return childName; }
  public void setChildName(String childName) { this.childName = childName; }
  public boolean isPremiumStatus() { return premiumStatus; }
  public void setPremiumStatus(boolean premiumStatus) { this.premiumStatus = premiumStatus; }
  public int getPoints() { return points; }
  public void setPoints(int points) { this.points = points; }
  public Instant getCreatedAt() { return createdAt; }
}

