package com.mindmetric.api.wordnebula;

import com.mindmetric.api.wordnebula.WordNebulaDtos.AdvanceRequest;
import com.mindmetric.api.wordnebula.WordNebulaDtos.SessionDto;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/word-nebula")
public class WordNebulaController {
  private final WordNebulaService service;

  public WordNebulaController(WordNebulaService service) {
    this.service = service;
  }

  @PostMapping("/sessions")
  public SessionDto start(@RequestParam Long userId, @RequestParam(defaultValue = "WORD_NEBULA_FOUNDATIONS") String topic) {
    return service.start(userId, topic);
  }

  @PostMapping("/sessions/{sessionId}/advance")
  public SessionDto advance(@RequestParam Long userId, @PathVariable String sessionId, @RequestBody AdvanceRequest request) {
    return service.advance(userId, sessionId, request.questionId());
  }

  @PostMapping("/sessions/{sessionId}/reset")
  public SessionDto reset(@RequestParam Long userId, @PathVariable String sessionId) {
    return service.reset(userId, sessionId);
  }
}
