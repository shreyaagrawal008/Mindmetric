package com.mindmetric.api.content;

import java.util.List;

public record WeeklyContentDto(
  String weekKey,
  String missionTitle,
  String academicLesson,
  String mascotLine,
  List<String> friends,
  List<LessonDto> lessons
) {
  public record LessonDto(String gameShell, String subject, Tier tier, String prompt, String answer, String reward) {}
}
