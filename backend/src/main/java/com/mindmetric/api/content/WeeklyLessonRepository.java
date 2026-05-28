package com.mindmetric.api.content;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WeeklyLessonRepository extends JpaRepository<WeeklyLesson, Long> {
  boolean existsByWeekKey(String weekKey);
  List<WeeklyLesson> findByWeekKeyOrderByIdAsc(String weekKey);
  List<WeeklyLesson> findByWeekKeyAndTierOrderByIdAsc(String weekKey, Tier tier);
}
