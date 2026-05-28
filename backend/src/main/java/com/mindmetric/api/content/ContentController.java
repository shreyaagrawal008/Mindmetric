package com.mindmetric.api.content;

import java.time.LocalDate;
import java.time.temporal.WeekFields;
import java.util.List;
import java.util.Locale;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/content")
public class ContentController {
  private final WeeklyLessonRepository lessons;

  public ContentController(WeeklyLessonRepository lessons) {
    this.lessons = lessons;
  }

  @GetMapping("/current")
  public WeeklyContentDto current(@RequestParam(defaultValue = "2") String gradeLevel) {
    String weekKey = currentWeekKey();
    Tier tier = tierForGrade(gradeLevel);
    List<WeeklyLesson> tierLessons = lessons.findByWeekKeyAndTierOrderByIdAsc(weekKey, tier);
    List<WeeklyLesson> allLessons = tierLessons.isEmpty() ? lessons.findByWeekKeyOrderByIdAsc(weekKey) : tierLessons;
    if (allLessons.isEmpty()) {
      allLessons = lessons.findAll();
    }
    WeeklyLesson first = allLessons.get(0);
    return new WeeklyContentDto(
      first.getWeekKey(),
      first.getMissionTitle(),
      first.getAcademicLesson(),
      first.getMascotLine(),
      List.of("Lexi the Word Pilot", "Digit the Math Bot", "Professor Plasma"),
      allLessons.stream()
        .map(item -> new WeeklyContentDto.LessonDto(item.getGameShell(), item.getSubject(), item.getTier(), item.getPrompt(), item.getAnswer(), item.getReward()))
        .toList()
    );
  }

  private String currentWeekKey() {
    LocalDate now = LocalDate.now();
    WeekFields fields = WeekFields.ISO;
    return now.getYear() + "-W" + String.format("%02d", now.get(fields.weekOfWeekBasedYear()));
  }

  private Tier tierForGrade(String gradeLevel) {
    if ("Pre-K".equalsIgnoreCase(gradeLevel) || "K".equalsIgnoreCase(gradeLevel)) {
      return Tier.TIER_1;
    }
    if (List.of("1", "2", "3").contains(gradeLevel)) {
      return Tier.TIER_2;
    }
    return Tier.TIER_3;
  }
}
