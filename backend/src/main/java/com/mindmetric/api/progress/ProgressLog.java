package com.mindmetric.api.progress;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "progress_logs")
public class ProgressLog {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private Long userId;

  @Column(nullable = false)
  private String gameShell;

  @Column(nullable = false)
  private String subject;

  @Column(nullable = false)
  private String tier;

  private int score;

  @Column(nullable = false)
  private String knowledgeLeaf;

  private Instant completedAt = Instant.now();

  public Long getId() { return id; }
  public Long getUserId() { return userId; }
  public void setUserId(Long userId) { this.userId = userId; }
  public String getGameShell() { return gameShell; }
  public void setGameShell(String gameShell) { this.gameShell = gameShell; }
  public String getSubject() { return subject; }
  public void setSubject(String subject) { this.subject = subject; }
  public String getTier() { return tier; }
  public void setTier(String tier) { this.tier = tier; }
  public int getScore() { return score; }
  public void setScore(int score) { this.score = score; }
  public String getKnowledgeLeaf() { return knowledgeLeaf; }
  public void setKnowledgeLeaf(String knowledgeLeaf) { this.knowledgeLeaf = knowledgeLeaf; }
  public Instant getCompletedAt() { return completedAt; }
}
