package com.mindmetric.api.astromaze;

import java.util.List;

public record AstromazeCycleDto(
  String cycleName,
  int weeks,
  int totalMazes,
  List<AstromazeQuestionDto> questions,
  List<AstromazeMazeDto> mazes
) {}
