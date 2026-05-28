package com.mindmetric.api.wordnebula;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WordNebulaSessionRepository extends JpaRepository<WordNebulaSession, String> {
  List<WordNebulaSession> findByUserIdAndTopicOrderByUpdatedAtDesc(String userId, String topic);
}
