package com.mindmetric.api.astromaze;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;
import org.springframework.stereotype.Service;

@Service
public class AstromazeService {
  private static final LocalDate CYCLE_ONE_START = LocalDate.of(2026, 5, 5);
  private static final List<String> DIFFICULTY_CYCLE = List.of(
    "easy", "easy", "easy",
    "medium", "medium", "medium", "medium",
    "hard", "hard", "hard"
  );

  public AstromazeCycleDto currentCycle() {
    List<AstromazeQuestionDto> questions = shuffleLockedQuestions();
    List<AstromazeMazeDto> mazes = new ArrayList<>();
    for (int mazeIndex = 0; mazeIndex < DIFFICULTY_CYCLE.size(); mazeIndex++) {
      String difficulty = DIFFICULTY_CYCLE.get(mazeIndex);
      int groupIndex = 0;
      for (int prior = 0; prior < mazeIndex; prior++) {
        if (DIFFICULTY_CYCLE.get(prior).equals(difficulty)) {
          groupIndex++;
        }
      }
      List<AstromazeQuestionDto> assigned = questions.stream()
        .filter(question -> question.difficulty().equals(difficulty))
        .skip((long) groupIndex * 2)
        .limit(2)
        .toList();
      mazes.add(new AstromazeMazeDto(mazeIndex + 1, difficulty, assigned));
    }
    return new AstromazeCycleDto("Alphabet Foundations", 2, 10, questions, mazes);
  }

  private List<AstromazeQuestionDto> shuffleLockedQuestions() {
    long cycleNumber = ChronoUnit.DAYS.between(CYCLE_ONE_START, LocalDate.now()) / 14;
    List<AstromazeQuestionDto> questions = new ArrayList<>(questionBank());
    Collections.shuffle(questions, new Random(20260505L + cycleNumber));
    return questions;
  }

  private List<AstromazeQuestionDto> questionBank() {
    return List.of(
      new AstromazeQuestionDto("alphabet-01", "easy", "Which letter starts apple?", "A", List.of("A", "M", "T"), "Apple starts with A."),
      new AstromazeQuestionDto("alphabet-02", "easy", "Which letter starts banana?", "B", List.of("B", "D", "S"), "Banana starts with B."),
      new AstromazeQuestionDto("alphabet-03", "easy", "Which letter starts cat?", "C", List.of("C", "P", "L"), "Cat starts with C."),
      new AstromazeQuestionDto("alphabet-04", "easy", "Which letter starts dog?", "D", List.of("D", "G", "A"), "Dog starts with D."),
      new AstromazeQuestionDto("alphabet-05", "easy", "Tap the big letter A.", "A", List.of("A", "a", "B"), "This is uppercase A."),
      new AstromazeQuestionDto("alphabet-06", "easy", "Tap the big letter B.", "B", List.of("B", "b", "D"), "This is uppercase B."),
      new AstromazeQuestionDto("alphabet-07", "medium", "Which letter starts elephant?", "E", List.of("E", "F", "C"), "Elephant starts with E."),
      new AstromazeQuestionDto("alphabet-08", "medium", "Which letter starts fish?", "F", List.of("F", "S", "H"), "Fish starts with F."),
      new AstromazeQuestionDto("alphabet-09", "medium", "Which letter starts goat?", "G", List.of("G", "J", "T"), "Goat starts with G."),
      new AstromazeQuestionDto("alphabet-10", "medium", "Which letter starts hat?", "H", List.of("H", "A", "N"), "Hat starts with H."),
      new AstromazeQuestionDto("alphabet-11", "medium", "What comes after A?", "B", List.of("B", "C", "D"), "B comes after A."),
      new AstromazeQuestionDto("alphabet-12", "medium", "What comes after B?", "C", List.of("C", "A", "D"), "C comes after B."),
      new AstromazeQuestionDto("alphabet-13", "medium", "Match the lowercase letter to A.", "a", List.of("a", "b", "d"), "Lowercase a matches A."),
      new AstromazeQuestionDto("alphabet-14", "medium", "Match the lowercase letter to C.", "c", List.of("c", "o", "s"), "Lowercase c matches C."),
      new AstromazeQuestionDto("alphabet-15", "hard", "Which word starts with M?", "moon", List.of("moon", "sun", "apple"), "Moon starts with M."),
      new AstromazeQuestionDto("alphabet-16", "hard", "Which word starts with S?", "star", List.of("star", "cat", "dog"), "Star starts with S."),
      new AstromazeQuestionDto("alphabet-17", "hard", "Which letter is missing: A, B, _, D?", "C", List.of("C", "E", "F"), "A, B, C, D is the order."),
      new AstromazeQuestionDto("alphabet-18", "hard", "Which letter is missing: E, F, _, H?", "G", List.of("G", "C", "J"), "E, F, G, H is the order."),
      new AstromazeQuestionDto("alphabet-19", "hard", "Which pair matches?", "M m", List.of("M m", "M n", "W m"), "Uppercase M matches lowercase m."),
      new AstromazeQuestionDto("alphabet-20", "hard", "Which pair matches?", "S s", List.of("S s", "S z", "C s"), "Uppercase S matches lowercase s.")
    );
  }
}
