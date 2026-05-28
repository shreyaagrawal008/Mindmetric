package com.mindmetric.api.wordnebula;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.DayOfWeek;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "word_nebula_questions")
public class WordNebulaQuestion {
  @Id
  @Column(length = 32)
  private String id;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 16)
  private DayOfWeek dayOfWeek;

  @Column(nullable = false, length = 80)
  private String topic;

  @Column(nullable = false, length = 80)
  private String poolKey = "WORD_NEBULA_FOUNDATIONS";

  @Column(nullable = false, length = 40)
  private String engineKey;

  @Column(nullable = false, length = 40)
  private String promptType;

  @Column(nullable = false, length = 255)
  private String promptText;

  @Column(length = 255)
  private String audioCue;

  @Column(length = 255)
  private String imageCue;

  @Column(nullable = false, length = 255)
  private String questionImageUrl;

  @Column(nullable = false, length = 80)
  private String answer;

  @Convert(converter = StringListJsonConverter.class)
  @Column(name = "options_json", nullable = false, columnDefinition = "longtext")
  private List<String> options = List.of();

  @Convert(converter = StringObjectMapJsonConverter.class)
  @Column(name = "payload_json", nullable = false, columnDefinition = "longtext")
  private Map<String, Object> payload = Map.of();

  @Column(nullable = false)
  private Integer difficulty;

  @Column(nullable = false)
  private Boolean active = true;

  protected WordNebulaQuestion() {
  }

  public WordNebulaQuestion(
    String id,
    DayOfWeek dayOfWeek,
    String topic,
    String poolKey,
    String engineKey,
    String promptType,
    String promptText,
    String audioCue,
    String imageCue,
    String questionImageUrl,
    String answer,
    List<String> options,
    Map<String, Object> payload,
    Integer difficulty
  ) {
    this.id = id;
    this.dayOfWeek = dayOfWeek;
    this.topic = topic;
    this.poolKey = poolKey;
    this.engineKey = engineKey;
    this.promptType = promptType;
    this.promptText = promptText;
    this.audioCue = audioCue;
    this.imageCue = imageCue;
    this.questionImageUrl = questionImageUrl;
    this.answer = answer;
    this.options = options == null ? List.of() : List.copyOf(options);
    this.payload = payload == null ? Map.of() : Map.copyOf(payload);
    this.difficulty = difficulty;
    this.active = true;
  }

  public String getId() {
    return id;
  }

  public DayOfWeek getDayOfWeek() {
    return dayOfWeek;
  }

  public String getTopic() {
    return topic;
  }

  public String getPoolKey() {
    return poolKey;
  }

  public String getEngineKey() {
    return engineKey;
  }

  public String getPromptType() {
    return promptType;
  }

  public String getPromptText() {
    return promptText;
  }

  public String getAudioCue() {
    return audioCue;
  }

  public String getImageCue() {
    return imageCue;
  }

  public String getQuestionImageUrl() {
    return questionImageUrl;
  }

  public String getAnswer() {
    return answer;
  }

  public List<String> getOptions() {
    return options;
  }

  public Map<String, Object> getPayload() {
    return payload;
  }

  public Integer getDifficulty() {
    return difficulty;
  }

  public static class StringListJsonConverter implements AttributeConverter<List<String>, String> {
    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final TypeReference<List<String>> LIST_TYPE = new TypeReference<>() {};

    @Override
    public String convertToDatabaseColumn(List<String> value) {
      try {
        return MAPPER.writeValueAsString(value == null ? List.of() : value);
      } catch (Exception ex) {
        throw new IllegalStateException("Unable to write Word Nebula string list JSON", ex);
      }
    }

    @Override
    public List<String> convertToEntityAttribute(String value) {
      if (value == null || value.isBlank()) {
        return List.of();
      }
      try {
        JsonNode node = MAPPER.readTree(value.trim());
        while (node != null && node.isTextual()) {
          node = MAPPER.readTree(node.asText());
        }
        if (!node.isArray()) {
          throw new IllegalArgumentException("Expected JSON array, got " + node.getNodeType());
        }
        return MAPPER.convertValue(node, LIST_TYPE);
      } catch (Exception ex) {
        throw new IllegalStateException("Invalid Word Nebula string list JSON", ex);
      }
    }
  }

  public static class StringObjectMapJsonConverter implements AttributeConverter<Map<String, Object>, String> {
    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<>() {};

    @Override
    public String convertToDatabaseColumn(Map<String, Object> value) {
      try {
        return MAPPER.writeValueAsString(value == null ? Map.of() : value);
      } catch (Exception ex) {
        throw new IllegalStateException("Unable to write Word Nebula payload JSON", ex);
      }
    }

    @Override
    public Map<String, Object> convertToEntityAttribute(String value) {
      if (value == null || value.isBlank()) {
        return Map.of();
      }
      try {
        JsonNode node = MAPPER.readTree(value.trim());
        while (node != null && node.isTextual()) {
          node = MAPPER.readTree(node.asText());
        }
        if (!node.isObject()) {
          throw new IllegalArgumentException("Expected JSON object, got " + node.getNodeType());
        }
        return MAPPER.convertValue(node, MAP_TYPE);
      } catch (Exception ex) {
        throw new IllegalStateException("Invalid Word Nebula JSON payload", ex);
      }
    }
  }
}
