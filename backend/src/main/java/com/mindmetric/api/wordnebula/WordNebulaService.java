package com.mindmetric.api.wordnebula;

import com.mindmetric.api.wordnebula.WordNebulaDtos.QuestionDto;
import com.mindmetric.api.wordnebula.WordNebulaDtos.SessionDto;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashSet;
import java.util.HexFormat;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WordNebulaService {
  private static final int ACTIVE_SET_SIZE = 50;
  private static final String DEFAULT_POOL_KEY = "WORD_NEBULA_FOUNDATIONS";
  private final WordNebulaQuestionRepository questionRepository;
  private final WordNebulaSessionRepository sessionRepository;

  public WordNebulaService(
    WordNebulaQuestionRepository questionRepository,
    WordNebulaSessionRepository sessionRepository
  ) {
    this.questionRepository = questionRepository;
    this.sessionRepository = sessionRepository;
  }

  @Transactional
  public SessionDto start(Long userId, String poolKey) {
    String scopedUserId = requireUser(userId);
    String normalizedPoolKey = normalizePoolKey(poolKey);
    WordNebulaSession session = sessionRepository.findByUserIdAndTopicOrderByUpdatedAtDesc(scopedUserId, normalizedPoolKey)
      .stream()
      .findFirst()
      .orElseGet(() -> createSession(scopedUserId, normalizedPoolKey));
    return toDto(session);
  }

  @Transactional
  public SessionDto advance(Long userId, String sessionId, String questionId) {
    WordNebulaSession session = sessionRepository.findById(sessionId)
      .orElseThrow(() -> new IllegalArgumentException("Unknown Word Nebula session: " + sessionId));
    requireSessionOwner(userId, session);

    List<String> activeIds = session.getActiveQuestionIds();
    LinkedHashSet<String> consumed = new LinkedHashSet<>(session.getConsumedQuestionIds());
    if (questionId != null && activeIds.contains(questionId)) {
      consumed.add(questionId);
    }

    if (consumed.size() >= activeIds.size()) {
      return toDto(refreshSession(session));
    }

    int nextIndex = session.getCurrentIndex();
    Set<String> consumedSet = new HashSet<>(consumed);
    while (nextIndex < activeIds.size() && consumedSet.contains(activeIds.get(nextIndex))) {
      nextIndex += 1;
    }
    if (nextIndex >= activeIds.size()) {
      nextIndex = 0;
      while (nextIndex < activeIds.size() && consumedSet.contains(activeIds.get(nextIndex))) {
        nextIndex += 1;
      }
    }

    session.setConsumedQuestionIds(new ArrayList<>(consumed));
    session.setCurrentIndex(nextIndex);
    return toDto(sessionRepository.save(session));
  }

  @Transactional
  public SessionDto reset(Long userId, String sessionId) {
    WordNebulaSession session = sessionRepository.findById(sessionId)
      .orElseThrow(() -> new IllegalArgumentException("Unknown Word Nebula session: " + sessionId));
    requireSessionOwner(userId, session);
    return toDto(refreshSession(session));
  }

  private WordNebulaSession createSession(String userId, String poolKey) {
    String normalizedPoolKey = normalizePoolKey(poolKey);
    List<WordNebulaQuestion> bank = questionRepository.findByPoolKeyAndActiveTrue(normalizedPoolKey);
    if (bank.isEmpty()) {
      throw new IllegalStateException("Word Nebula active set requires at least 1 active question: " + normalizedPoolKey);
    }
    int activeSize = Math.min(ACTIVE_SET_SIZE, bank.size());

    String engineKey = "MIXED_WORD_NEBULA";
    List<String> ids = bank.stream()
      .sorted(Comparator.comparing(WordNebulaQuestion::getId))
      .map(WordNebulaQuestion::getId)
      .collect(ArrayList::new, ArrayList::add, ArrayList::addAll);
    Collections.shuffle(ids, new Random(seed(userId, normalizedPoolKey, Instant.now().toString())));
    List<String> activeIds = ids.stream().limit(activeSize).toList();
    String sessionId = stableSessionId(userId, normalizedPoolKey, System.nanoTime());
    return sessionRepository.save(new WordNebulaSession(sessionId, userId, normalizedPoolKey, engineKey, activeIds));
  }

  private WordNebulaSession refreshSession(WordNebulaSession session) {
    List<String> activeIds = randomizedActiveIds(session.getUserId(), session.getTopic());
    session.setActiveQuestionIds(activeIds);
    session.setConsumedQuestionIds(List.of());
    session.setCurrentIndex(0);
    return sessionRepository.save(session);
  }

  private List<String> randomizedActiveIds(String userId, String topic) {
    List<WordNebulaQuestion> bank = questionRepository.findByPoolKeyAndActiveTrue(normalizePoolKey(topic));
    if (bank.isEmpty()) {
      throw new IllegalStateException("Word Nebula active set requires at least 1 active question: " + topic);
    }
    int activeSize = Math.min(ACTIVE_SET_SIZE, bank.size());
    List<String> ids = bank.stream()
      .sorted(Comparator.comparing(WordNebulaQuestion::getId))
      .map(WordNebulaQuestion::getId)
      .collect(ArrayList::new, ArrayList::add, ArrayList::addAll);
    Collections.shuffle(ids, new Random(seed(userId, topic, Instant.now().toString())));
    return ids.stream().limit(activeSize).toList();
  }

  private String normalizePoolKey(String poolKey) {
    if (poolKey == null || poolKey.isBlank() || "ALL".equalsIgnoreCase(poolKey) || DEFAULT_POOL_KEY.equalsIgnoreCase(poolKey)) {
      return DEFAULT_POOL_KEY;
    }
    return poolKey.trim().toUpperCase(java.util.Locale.ROOT);
  }

  private String requireUser(Long userId) {
    if (userId == null) {
      throw new IllegalArgumentException("Word Nebula requires a signed-in user.");
    }
    return String.valueOf(userId);
  }

  private void requireSessionOwner(Long userId, WordNebulaSession session) {
    String scopedUserId = requireUser(userId);
    if (!session.getUserId().equals(scopedUserId)) {
      throw new IllegalArgumentException("Word Nebula session does not belong to this user.");
    }
  }

  private SessionDto toDto(WordNebulaSession session) {
    List<String> activeIds = session.getActiveQuestionIds();
    List<String> consumedIds = session.getConsumedQuestionIds();
    Set<String> activeSet = new HashSet<>(activeIds);
    Map<String, WordNebulaQuestion> byId = questionRepository.findAllById(activeIds).stream()
      .filter(question -> activeSet.contains(question.getId()))
      .collect(java.util.stream.Collectors.toMap(WordNebulaQuestion::getId, question -> question));
    List<QuestionDto> questions = activeIds.stream()
      .map(byId::get)
      .filter(java.util.Objects::nonNull)
      .map(this::toQuestionDto)
      .toList();

    return new SessionDto(
      session.getId(),
      session.getUserId(),
      session.getTopic(),
      session.getEngineKey(),
      session.getCurrentIndex(),
      activeIds.size() - consumedIds.size(),
      activeIds,
      consumedIds,
      questions
    );
  }

  private QuestionDto toQuestionDto(WordNebulaQuestion question) {
    return new QuestionDto(
      question.getId(),
      question.getDayOfWeek(),
      question.getPoolKey(),
      question.getTopic(),
      question.getEngineKey(),
      question.getEngineKey(),
      question.getPromptType(),
      question.getPromptText(),
      question.getAudioCue(),
      question.getImageCue(),
      question.getQuestionImageUrl(),
      question.getAnswer(),
      question.getOptions(),
      question.getPayload(),
      question.getDifficulty()
    );
  }

  private long seed(String userId, String topic, String nonce) {
    return stableSessionId(userId, topic, nonce).hashCode();
  }

  private String stableSessionId(String userId, String topic, Object nonce) {
    try {
      MessageDigest digest = MessageDigest.getInstance("SHA-256");
      byte[] hash = digest.digest((userId + ":" + topic + ":" + nonce).getBytes(StandardCharsets.UTF_8));
      return "wn-" + HexFormat.of().formatHex(hash, 0, 12);
    } catch (NoSuchAlgorithmException ex) {
      throw new IllegalStateException("SHA-256 unavailable", ex);
    }
  }
}
