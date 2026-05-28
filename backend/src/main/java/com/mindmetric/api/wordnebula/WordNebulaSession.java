package com.mindmetric.api.wordnebula;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "word_nebula_sessions")
public class WordNebulaSession {
  @Id
  @Column(length = 96)
  private String id;

  @Column(nullable = false, length = 80)
  private String userId;

  @Column(nullable = false, length = 80)
  private String topic;

  @Column(nullable = false, length = 40)
  private String engineKey;

  @Convert(converter = WordNebulaQuestion.StringListJsonConverter.class)
  @Column(name = "active_question_ids_json", nullable = false, columnDefinition = "longtext")
  private List<String> activeQuestionIds = List.of();

  @Convert(converter = WordNebulaQuestion.StringListJsonConverter.class)
  @Column(name = "consumed_question_ids_json", nullable = false, columnDefinition = "longtext")
  private List<String> consumedQuestionIds = List.of();

  @Column(nullable = false)
  private Integer currentIndex;

  @Column(nullable = false)
  private Instant createdAt;

  @Column(nullable = false)
  private Instant updatedAt;

  protected WordNebulaSession() {
  }

  public WordNebulaSession(String id, String userId, String topic, String engineKey, List<String> activeQuestionIds) {
    this.id = id;
    this.userId = userId;
    this.topic = topic;
    this.engineKey = engineKey;
    this.activeQuestionIds = activeQuestionIds == null ? List.of() : List.copyOf(activeQuestionIds);
    this.consumedQuestionIds = List.of();
    this.currentIndex = 0;
    this.createdAt = Instant.now();
    this.updatedAt = this.createdAt;
  }

  @PreUpdate
  void touch() {
    this.updatedAt = Instant.now();
  }

  public String getId() {
    return id;
  }

  public String getUserId() {
    return userId;
  }

  public String getTopic() {
    return topic;
  }

  public String getEngineKey() {
    return engineKey;
  }

  public List<String> getActiveQuestionIds() {
    return activeQuestionIds;
  }

  public void setActiveQuestionIds(List<String> activeQuestionIds) {
    this.activeQuestionIds = activeQuestionIds == null ? List.of() : List.copyOf(activeQuestionIds);
  }

  public List<String> getConsumedQuestionIds() {
    return consumedQuestionIds;
  }

  public void setConsumedQuestionIds(List<String> consumedQuestionIds) {
    this.consumedQuestionIds = consumedQuestionIds == null ? List.of() : List.copyOf(consumedQuestionIds);
  }

  public Integer getCurrentIndex() {
    return currentIndex;
  }

  public void setCurrentIndex(Integer currentIndex) {
    this.currentIndex = currentIndex;
  }
}
