package com.mindmetric.api.astromaze;

import java.util.List;

public record AstromazeMazeDto(
  int mazeNumber,
  String difficulty,
  List<AstromazeQuestionDto> questions
) {}
