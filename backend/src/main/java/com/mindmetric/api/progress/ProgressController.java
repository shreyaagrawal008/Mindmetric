package com.mindmetric.api.progress;

import com.mindmetric.api.user.MindmetricUser;
import com.mindmetric.api.user.UserRepository;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/progress")
public class ProgressController {
  private final ProgressRepository progress;
  private final UserRepository users;

  public ProgressController(ProgressRepository progress, UserRepository users) {
    this.progress = progress;
    this.users = users;
  }

  @GetMapping("/{userId}")
  public List<ProgressLog> byUser(@PathVariable Long userId) {
    return progress.findByUserIdOrderByCompletedAtDesc(userId);
  }

  @PostMapping
  public ProgressLog create(@RequestBody ProgressLog log) {
    ProgressLog saved = progress.save(log);
    users.findById(log.getUserId()).ifPresent(user -> {
      user.setPoints(user.getPoints() + 25);
      users.save(user);
    });
    return saved;
  }
}
