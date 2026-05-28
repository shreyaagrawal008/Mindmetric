package com.mindmetric.api.astromaze;

import java.util.List;

public record AstromazeQuestionDto(
  String id,
  String difficulty,
  String question,
  String answer,
  List<String> options,
  String lesson
) {}
