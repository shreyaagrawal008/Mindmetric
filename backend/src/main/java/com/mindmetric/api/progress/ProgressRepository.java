package com.mindmetric.api.progress;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProgressRepository extends JpaRepository<ProgressLog, Long> {
  List<ProgressLog> findByUserIdOrderByCompletedAtDesc(Long userId);
}
