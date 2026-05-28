package com.mindmetric.api.wordnebula;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WordNebulaQuestionRepository extends JpaRepository<WordNebulaQuestion, String> {
  List<WordNebulaQuestion> findByActiveTrue();

  List<WordNebulaQuestion> findByTopicAndActiveTrue(String topic);

  List<WordNebulaQuestion> findByPoolKeyAndActiveTrue(String poolKey);

  List<WordNebulaQuestion> findByEngineKeyAndActiveTrue(String engineKey);
}
