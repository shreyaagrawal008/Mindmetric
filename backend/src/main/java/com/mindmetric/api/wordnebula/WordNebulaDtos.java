package com.mindmetric.api.wordnebula;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Map;

public final class WordNebulaDtos {
  private WordNebulaDtos() {
  }

  public record QuestionDto(
    String id,
    DayOfWeek dayOfWeek,
    String poolKey,
    String topic,
    String engineKey,
    String gameEngineType,
    String promptType,
    String promptText,
    String audioCue,
    String imageCue,
    String questionImageUrl,
    String answer,
    List<String> options,
    Map<String, Object> payload,
    int difficulty
  ) {
  }

  public record SessionDto(
    String sessionId,
    String userId,
    String poolKey,
    String engineKey,
    int currentIndex,
    int remaining,
    List<String> activeQuestionIds,
    List<String> consumedQuestionIds,
    List<QuestionDto> questions
  ) {
  }

  public record AdvanceRequest(String questionId) {
  }
}
