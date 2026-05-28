package com.mindmetric.api.astromaze;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/astromaze")
public class AstromazeController {
  private final AstromazeService service;

  public AstromazeController(AstromazeService service) {
    this.service = service;
  }

  @GetMapping("/cycle")
  public AstromazeCycleDto currentCycle() {
    return service.currentCycle();
  }
}
