package com.mindmetric.api.content;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.InputStream;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class ContentSeeder implements CommandLineRunner {
  private final WeeklyLessonRepository lessons;
  private final ObjectMapper objectMapper;

  public ContentSeeder(WeeklyLessonRepository lessons, ObjectMapper objectMapper) {
    this.lessons = lessons;
    this.objectMapper = objectMapper;
  }

  @Override
  public void run(String... args) throws Exception {
    try (InputStream stream = getClass().getResourceAsStream("/weekly_content.json")) {
      if (stream == null) {
        return;
      }
      WeeklyContentDto content = objectMapper.readValue(stream, WeeklyContentDto.class);
      if (lessons.existsByWeekKey(content.weekKey())) {
        return;
      }
      for (WeeklyContentDto.LessonDto item : content.lessons()) {
        WeeklyLesson lesson = new WeeklyLesson();
        lesson.setWeekKey(content.weekKey());
        lesson.setMissionTitle(content.missionTitle());
        lesson.setAcademicLesson(content.academicLesson());
        lesson.setMascotLine(content.mascotLine());
        lesson.setGameShell(item.gameShell());
        lesson.setSubject(item.subject());
        lesson.setTier(item.tier());
        lesson.setPrompt(item.prompt());
        lesson.setAnswer(item.answer());
        lesson.setReward(item.reward());
        lessons.save(lesson);
      }
    }
  }
}
