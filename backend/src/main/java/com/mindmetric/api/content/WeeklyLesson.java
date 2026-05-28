package com.mindmetric.api.content;

import jakarta.persistence.*;

@Entity
@Table(name = "weekly_lessons")
public class WeeklyLesson {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String weekKey;

  @Column(nullable = false)
  private String missionTitle;

  @Column(nullable = false, length = 700)
  private String academicLesson;

  @Column(nullable = false, length = 700)
  private String mascotLine;

  @Column(nullable = false)
  private String gameShell;

  @Column(nullable = false)
  private String subject;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private Tier tier;

  @Column(nullable = false, length = 700)
  private String prompt;

  @Column(nullable = false)
  private String answer;

  @Column(nullable = false)
  private String reward;

  public Long getId() { return id; }
  public String getWeekKey() { return weekKey; }
  public void setWeekKey(String weekKey) { this.weekKey = weekKey; }
  public String getMissionTitle() { return missionTitle; }
  public void setMissionTitle(String missionTitle) { this.missionTitle = missionTitle; }
  public String getAcademicLesson() { return academicLesson; }
  public void setAcademicLesson(String academicLesson) { this.academicLesson = academicLesson; }
  public String getMascotLine() { return mascotLine; }
  public void setMascotLine(String mascotLine) { this.mascotLine = mascotLine; }
  public String getGameShell() { return gameShell; }
  public void setGameShell(String gameShell) { this.gameShell = gameShell; }
  public String getSubject() { return subject; }
  public void setSubject(String subject) { this.subject = subject; }
  public Tier getTier() { return tier; }
  public void setTier(Tier tier) { this.tier = tier; }
  public String getPrompt() { return prompt; }
  public void setPrompt(String prompt) { this.prompt = prompt; }
  public String getAnswer() { return answer; }
  public void setAnswer(String answer) { this.answer = answer; }
  public String getReward() { return reward; }
  public void setReward(String reward) { this.reward = reward; }
}
