package com.mindmetric.api.numbercomet;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/questions")
@CrossOrigin(origins = "http://localhost:5173")
public class QuestionController {

    private final QuestionRepository questionRepository;

    public QuestionController(QuestionRepository questionRepository) {
        this.questionRepository = questionRepository;
    }

    @GetMapping("/level/{levelId}/topic/{topicId}")
    public ResponseEntity<List<Question>> getQuestionsByTopic(@PathVariable int levelId, @PathVariable int topicId) {
        List<Question> questions = questionRepository.findQuestionsByLevelAndTopic(levelId, topicId);
        return ResponseEntity.ok(questions);
    }
}
