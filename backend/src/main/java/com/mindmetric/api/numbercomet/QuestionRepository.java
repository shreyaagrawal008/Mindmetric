package com.mindmetric.api.numbercomet;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    @Query(value = "SELECT * FROM game_questions WHERE level_id = ?1 AND topic_id = ?2 ORDER BY question_number ASC", nativeQuery = true)
    List<Question> findQuestionsByLevelAndTopic(int levelId, int topicId);
}
