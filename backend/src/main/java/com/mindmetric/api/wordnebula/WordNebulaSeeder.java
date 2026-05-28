package com.mindmetric.api.wordnebula;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.DayOfWeek;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class WordNebulaSeeder implements CommandLineRunner {
  private static final String POOL = "WORD_NEBULA_FOUNDATIONS";
  private static final ObjectMapper MAPPER = new ObjectMapper();
  private static final TypeReference<List<String>> LIST_TYPE = new TypeReference<>() {};
  private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<>() {};
  private final WordNebulaQuestionRepository questions;

  public WordNebulaSeeder(WordNebulaQuestionRepository questions) {
    this.questions = questions;
  }

  @Override
  public void run(String... args) {
    questions.deleteAllInBatch();
    questions.saveAll(seed());
  }

  private List<WordNebulaQuestion> seed() {
    return List.of(
      q("WN-001", DayOfWeek.MONDAY, "Short Vowel CVC Substituted Phonics", "SPACE_FLASH_CARDS", "image_word", "CHOOSE THE WORD THAT MATCHES THE SOUND OUT PICTURE.", null, "assets/word-nebula/dog.png", "dog", "[\"dot\",\"dog\",\"dig\"]", "{\"target\":\"DOG\"}", 1),
      q("WN-002", DayOfWeek.TUESDAY, "Ending Consonant Sounds Isolation", "SPACE_FLASH_CARDS", "image_word", "FIND THE ITEM THAT ENDS WITH THE SOUND OF /T/.", null, "assets/word-nebula/net.png", "net", "[\"net\",\"pen\",\"sun\"]", "{\"target\":\"NET\"}", 1),
      q("WN-003", DayOfWeek.WEDNESDAY, "Rhyming Word Family Matching", "SPACE_FLASH_CARDS", "rhyme_catch", "WHICH PLANET RHYMES WITH THE WORD 'CAT'?", null, "assets/word-nebula/hat.png", "bat", "[\"bag\",\"bat\",\"car\"]", "{\"target\":\"HAT\"}", 1),
      q("WN-004", DayOfWeek.THURSDAY, "Consonant Blend Discrimination (/ST/)", "SPACE_FLASH_CARDS", "initial_sound", "CHOOSE THE ITEM THAT STARTS WITH THE BLEND /ST/.", null, "assets/word-nebula/star.png", "star", "[\"star\",\"sun\",\"tree\"]", "{\"target\":\"STAR\"}", 1),
      q("WN-005", DayOfWeek.FRIDAY, "Middle Vowel Identification", "SPACE_FLASH_CARDS", "image_word", "FIND THE WORD THAT HAS A SHORT /I/ SOUND IN THE MIDDLE.", null, "assets/word-nebula/pig.png", "pig", "[\"peg\",\"pig\",\"pug\"]", "{\"target\":\"PIG\"}", 1),
      q("WN-006", DayOfWeek.MONDAY, "Short Vowel CVC", "SPACE_FLASH_CARDS", "image_word", "FIND THE WORD FOR THE PICTURE.", null, "assets/word-nebula/fox.png", "fox", "[\"box\",\"fox\",\"fix\"]", "{\"target\":\"FOX\"}", 1),
      q("WN-007", DayOfWeek.TUESDAY, "Beginning Consonant Sounds", "SPACE_FLASH_CARDS", "image_word", "WHICH WORD STARTS WITH THE /S/ SOUND?", null, "assets/word-nebula/sun.png", "sun", "[\"run\",\"sun\",\"bun\"]", "{\"target\":\"SUN\"}", 1),
      q("WN-008", DayOfWeek.WEDNESDAY, "Consonant Blend Discrimination (/TR/)", "SPACE_FLASH_CARDS", "initial_sound", "CHOOSE THE ITEM THAT STARTS WITH THE BLEND /TR/.", null, "assets/word-nebula/truck.png", "truck", "[\"duck\",\"truck\",\"track\"]", "{\"target\":\"TRUCK\"}", 2),
      q("WN-009", DayOfWeek.THURSDAY, "Digraph Identification (/SH/)", "SPACE_FLASH_CARDS", "initial_sound", "FIND THE WORD THAT HAS THE /SH/ SOUND.", null, "assets/word-nebula/ship.png", "ship", "[\"sip\",\"ship\",\"shop\"]", "{\"target\":\"SHIP\"}", 2),
      q("WN-010", DayOfWeek.FRIDAY, "Vowel Team Reading", "SPACE_FLASH_CARDS", "image_word", "CHOOSE THE CORRECT WORD FOR THE PICTURE.", null, "assets/word-nebula/leaf.png", "leaf", "[\"loaf\",\"leaf\",\"life\"]", "{\"target\":\"LEAF\"}", 2),
      q("WN-011", DayOfWeek.MONDAY, "Rhyming Match", "SPACE_FLASH_CARDS", "rhyme_catch", "FIND THE WORD THAT RHYMES WITH 'FALL'.", null, "assets/word-nebula/ball.png", "ball", "[\"tall\",\"bell\",\"ball\"]", "{\"target\":\"BALL\"}", 1),
      q("WN-012", DayOfWeek.TUESDAY, "Short Vowel Identification", "SPACE_FLASH_CARDS", "image_word", "FIND THE WORD WITH A SHORT /E/ SOUND.", null, "assets/word-nebula/egg.png", "egg", "[\"egg\",\"eel\",\"ear\"]", "{\"target\":\"EGG\"}", 1),
      q("WN-013", DayOfWeek.WEDNESDAY, "Initial Sound Isolation", "SPACE_FLASH_CARDS", "initial_sound", "CHOOSE THE ITEM THAT STARTS WITH /M/.", null, "assets/word-nebula/moon.png", "moon", "[\"noon\",\"soon\",\"moon\"]", "{\"target\":\"MOON\"}", 1),
      q("WN-014", DayOfWeek.THURSDAY, "Ending Consonant Sound", "SPACE_FLASH_CARDS", "image_word", "FIND THE WORD THAT ENDS WITH /P/.", null, "assets/word-nebula/cap.png", "cap", "[\"cab\",\"cat\",\"cap\"]", "{\"target\":\"CAP\"}", 1),
      q("WN-015", DayOfWeek.FRIDAY, "Digraph Identification (/SH/)", "SPACE_FLASH_CARDS", "image_word", "FIND THE ITEM THAT ENDS WITH /SH/.", null, "assets/word-nebula/shell.png", "shell", "[\"shell\",\"sell\",\"shop\"]", "{\"target\":\"SHELL\"}", 2),
      q("WN-016", DayOfWeek.MONDAY, "Consonant Blend (/ST/)", "SPACE_FLASH_CARDS", "image_word", "WHICH WORD ENDS WITH THE BLEND /ST/?", null, "assets/word-nebula/nest.png", "nest", "[\"net\",\"nest\",\"pest\"]", "{\"target\":\"NEST\"}", 2),
      q("WN-017", DayOfWeek.TUESDAY, "Ending Digraph (/NG/)", "SPACE_FLASH_CARDS", "image_word", "CHOOSE THE WORD THAT ENDS IN /NG/.", null, "assets/word-nebula/king.png", "king", "[\"kin\",\"king\",\"ring\"]", "{\"target\":\"KING\"}", 2),
      q("WN-018", DayOfWeek.WEDNESDAY, "Rhyming Word Family Matching", "SPACE_FLASH_CARDS", "rhyme_catch", "WHAT RHYMES WITH 'SING'?", null, "assets/word-nebula/ring.png", "ring", "[\"ran\",\"ring\",\"rug\"]", "{\"target\":\"RING\"}", 2),
      q("WN-019", DayOfWeek.THURSDAY, "Consonant Sound Identification", "SPACE_FLASH_CARDS", "image_word", "FIND THE ITEM THAT STARTS WITH /S/.", null, "assets/word-nebula/sock.png", "sock", "[\"rock\",\"sock\",\"lock\"]", "{\"target\":\"SOCK\"}", 1),
      q("WN-020", DayOfWeek.FRIDAY, "Consonant Blends (/SP/)", "SPACE_FLASH_CARDS", "initial_sound", "WHICH WORD STARTS WITH /SP/?", null, "assets/word-nebula/spoon.png", "spoon", "[\"soon\",\"spoon\",\"spin\"]", "{\"target\":\"SPOON\"}", 2)
    );
  }

  private WordNebulaQuestion q(
    String id,
    DayOfWeek dayOfWeek,
    String topic,
    String engineKey,
    String promptType,
    String promptText,
    String audioCue,
    String imageCue,
    String answer,
    String optionsJson,
    String payloadJson,
    int difficulty
  ) {
    String questionImageUrl = imageCue == null || imageCue.isBlank() ? assetPath(answer) : normalizeAssetPath(imageCue);
    return new WordNebulaQuestion(
      id,
      dayOfWeek,
      topic,
      POOL,
      engineKey,
      promptType,
      promptText,
      audioCue,
      questionImageUrl,
      questionImageUrl,
      answer,
      options(optionsJson),
      enrichPayload(payloadJson, questionImageUrl),
      difficulty
    );
  }

  private List<String> options(String json) {
    try {
      return MAPPER.readValue(json, LIST_TYPE);
    } catch (Exception ex) {
      throw new IllegalStateException("Invalid Word Nebula seed options", ex);
    }
  }

  private String assetPath(String optionText) {
    String slug = optionText.toLowerCase(Locale.ROOT)
      .replace("&", " and ")
      .replaceAll("[^a-z0-9]+", "-")
      .replaceAll("(^-|-$)", "");
    return "/assets/images/word-nebula/cosmic-" + slug + ".svg";
  }

  private String normalizeAssetPath(String imageCue) {
    String normalized = imageCue.startsWith("/") ? imageCue : "/" + imageCue;
    if (normalized.startsWith("/assets/images/")) {
      return normalized;
    }
    String fileName = normalized.substring(normalized.lastIndexOf('/') + 1);
    String stem = fileName.contains(".") ? fileName.substring(0, fileName.lastIndexOf('.')) : fileName;
    return assetPath(stem);
  }

  private Map<String, Object> enrichPayload(String json, String questionImageUrl) {
    Map<String, Object> payload = new java.util.LinkedHashMap<>(map(json));
    payload.put("questionImageUrl", questionImageUrl);
    return payload;
  }

  private Map<String, Object> map(String json) {
    try {
      return MAPPER.readValue(json, MAP_TYPE);
    } catch (Exception ex) {
      throw new IllegalStateException("Invalid Word Nebula seed payload", ex);
    }
  }
}
