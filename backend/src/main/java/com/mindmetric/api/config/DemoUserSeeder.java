package com.mindmetric.api.config;

import com.mindmetric.api.user.MindmetricUser;
import com.mindmetric.api.user.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DemoUserSeeder implements CommandLineRunner {
  private final UserRepository users;
  private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

  public DemoUserSeeder(UserRepository users) {
    this.users = users;
  }

  @Override
  public void run(String... args) {
    if (users.findByUsername("nova").isPresent()) {
      return;
    }
    MindmetricUser user = new MindmetricUser();
    user.setName("Nova Learner");
    user.setChildName("Nova Learner");
    user.setEmail("nova.parent@mindmetric.local");
    user.setAuthType("MANUAL");
    user.setUsername("nova");
    user.setPasswordHash(encoder.encode("mindmetric"));
    user.setRole("Student");
    user.setGradeLevel("2");
    user.setParentName("Demo Parent");
    user.setParentPhone("0000000000");
    user.setPoints(160);
    user.setPremiumStatus(false);
    users.save(user);
  }
}
