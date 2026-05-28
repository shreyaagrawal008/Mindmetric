package com.mindmetric.api.numbercomet;

import jakarta.persistence.*;

@Entity
@Table(name = "game_questions")
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int levelId;
    private int topicId;
    private int questionNumber;

    @Column(length = 500)
    private String instructionText;

    private String correctAnswer;
    private String optionBlue;
    private String optionPink;
    private String optionGreen;
    
    private String assetAudioPath;
    private String questionType;
    @Column(length = 2000)
    private String assetValue;

    public Question() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public int getLevelId() { return levelId; }
    public void setLevelId(int levelId) { this.levelId = levelId; }

    public int getTopicId() { return topicId; }
    public void setTopicId(int topicId) { this.topicId = topicId; }

    public int getQuestionNumber() { return questionNumber; }
    public void setQuestionNumber(int questionNumber) { this.questionNumber = questionNumber; }

    public String getInstructionText() { return instructionText; }
    public void setInstructionText(String instructionText) { this.instructionText = instructionText; }

    public String getCorrectAnswer() { return correctAnswer; }
    public void setCorrectAnswer(String correctAnswer) { this.correctAnswer = correctAnswer; }

    public String getOptionBlue() { return optionBlue; }
    public void setOptionBlue(String optionBlue) { this.optionBlue = optionBlue; }

    public String getOptionPink() { return optionPink; }
    public void setOptionPink(String optionPink) { this.optionPink = optionPink; }

    public String getOptionGreen() { return optionGreen; }
    public void setOptionGreen(String optionGreen) { this.optionGreen = optionGreen; }

    public String getAssetAudioPath() { return assetAudioPath; }
    public void setAssetAudioPath(String assetAudioPath) { this.assetAudioPath = assetAudioPath; }

    public String getQuestionType() { return questionType; }
    public void setQuestionType(String questionType) { this.questionType = questionType; }

    public String getAssetValue() { return assetValue; }
    public void setAssetValue(String assetValue) { this.assetValue = assetValue; }

    // --- Jackson JSON Aliases for Frontend Compatibility ---

    @Transient
    public String[] getOptions() {
        return new String[]{optionBlue, optionPink, optionGreen};
    }

    @Transient
    public String getQuestion() {
        return instructionText;
    }

    @Transient
    public String getAnswer() {
        return correctAnswer;
    }

    @Transient
    public String getType() {
        return questionType;
    }

    @Transient
    public Object getAsset() {
        if ("countItems".equals(questionType) && assetValue != null) {
            return assetValue.split(",");
        }
        return assetValue;
    }
}
