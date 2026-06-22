package com.mindmetric.api.numbercomet;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private QuestionRepository questionRepository;

    private final Random random = new Random();
    private List<Integer> level1Topic1Targets;

    @Override
    public void run(String... args) throws Exception {
        seedQuestions();
    }

    private void seedQuestions() {
        System.out.println("Starting Number Comet Curriculum Seeder (11 Levels x 8 Topics x 10 Questions)...");
        questionRepository.deleteAll(); // Clean slate

        List<Question> batchList = new ArrayList<>();
        int batchSize = 100;

        for (int level = 1; level <= 11; level++) {
            int maxQ = 10;
            for (int topic = 1; topic <= 8; topic++) {
                Set<String> seen = new HashSet<>();
                for (int qNum = 1; qNum <= maxQ; qNum++) {
                    Question q = new Question();
                    q.setLevelId(level);
                    q.setTopicId(topic);
                    q.setQuestionNumber(qNum);

                    String[] qData;
                    int attempts = 0;
                    do {
                        qData = generate(level, topic, qNum);
                        attempts++;
                    } while (seen.contains(String.join("|", qData)) && attempts < 100);
                    seen.add(String.join("|", qData));
                    String correct = qData[0];
                    String d1 = qData[1];
                    String d2 = qData[2];
                    String instruction = qData[3];
                    String type = qData.length > 4 ? qData[4] : "audioCheck";
                    String asset = qData.length > 5 ? qData[5] : "🔊";

                    q.setCorrectAnswer(correct);
                    q.setInstructionText(instruction);
                    q.setQuestionType(type);
                    q.setAssetValue(asset);
                    
                    // Default audio mapping for numbers
                    if (correct.matches("\\d+")) {
                        q.setAssetAudioPath("/audio/answers/" + correct + ".mp3");
                    } else {
                        // For string concepts (e.g. "BIG", "RED"), we could map to specific MP3s.
                        // Currently falling back to generic correct sound in UI, so this is safe.
                        q.setAssetAudioPath("");
                    }

                    List<String> opts = Arrays.asList(correct, d1, d2);
                    Collections.shuffle(opts, random);

                    q.setOptionBlue(opts.get(0));
                    q.setOptionPink(opts.get(1));
                    q.setOptionGreen(opts.get(2));

                    batchList.add(q);

                    if (batchList.size() >= batchSize) {
                        questionRepository.saveAll(batchList);
                        batchList.clear();
                    }
                }
            }
        }
        
        if (!batchList.isEmpty()) {
            questionRepository.saveAll(batchList);
        }
        
        System.out.println("Successfully seeded " + (11 * 8 * 10) + " Number Comet questions into MySQL.");
    }

    private String[] generate(int level, int topic, int qNum) {
        switch(level) {
            case 1: return genLevel1(topic, qNum);
            case 2: return genLevel2(topic);
            case 3: return genLevel3(topic, qNum);
            case 4: return genLevel4(topic, qNum);
            case 5: return genLevel5(topic, qNum);
            case 6: return genLevel6(topic, qNum);
            case 7: return genLevel7(topic, qNum);
            case 8: return genLevel8(topic, qNum);
            case 9: return genLevel9(topic);
            case 10: return genLevel10(topic);
            case 11: return genLevel11(topic);
            default: return buildN(1, 1, 5, "LISTEN CLOSELY AND FIND THE MATCHING NUMBER!");
        }
    }

    // --- Helpers ---
    private int r(int min, int max) { 
        return random.nextInt(max - min + 1) + min; 
    }
    
    private int uniqueR(int min, int max, int... excludes) {
        int val;
        boolean bad;
        do {
            val = r(min, max);
            bad = false;
            for(int ex : excludes) {
                if(val == ex) bad = true;
            }
        } while(bad);
        return val;
    }
    
    private String[] buildN(int correct, int min, int max, String inst) {
        int d1 = uniqueR(min, max, correct);
        int d2 = uniqueR(min, max, correct, d1);
        return new String[]{String.valueOf(correct), String.valueOf(d1), String.valueOf(d2), inst};
    }
    
    private String[] buildS(String correct, String[] pool, String inst) {
        String d1, d2;
        do { d1 = pool[random.nextInt(pool.length)]; } while(d1.equals(correct));
        do { d2 = pool[random.nextInt(pool.length)]; } while(d2.equals(correct) || d2.equals(d1));
        return new String[]{correct, d1, d2, inst};
    }

    // --- Level Generators ---
    private String[] genLevel1(int topic, int qNum) {
        String[] objects = {
            "⭐", "🚀", "🪐", "☄️", "🍎", "🚗", "🐶", "🐱", "🐦", "🐟",
            "🌳", "🌸", "☀️", "🌙", "☁️", "🌧️", "❄️", "🔥", "💧", "🌍",
            "🐻", "🦁", "🐯", "🐘", "🐵", "🐧", "🐸", "🐢", "🐍", "🐛"
        };
        String obj = objects[random.nextInt(objects.length)];

        switch(topic) {
            case 1: {
                if (qNum == 1 || level1Topic1Targets == null || level1Topic1Targets.isEmpty()) {
                    level1Topic1Targets = new ArrayList<>(Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10));
                    Collections.shuffle(level1Topic1Targets, random);
                }
                int correctNum = level1Topic1Targets.remove(0);
                String qText = "Find the number <span style='color: #FFD700; font-size: 1.5em; text-shadow: 0 0 10px #FFD700; padding: 0 5px;'>" + correctNum + "</span>!";
                return buildT(correctNum, 1, 10, qText, "audioCheck", "🔊");
            }
            case 2: { // Tower Tally: Tall vs Short
                String[] towerEmojis = {
                    "🗼", "🏢", "🌲", "🦒", "🪜", "🏗️", "🏙️", "🏛️", "🏰", "🎢",
                    "🧍‍♂️", "🚪", "🪔", "💈", "🚏", "🚦", "🌵", "🌴", "🎋", "🛖",
                    "🚀", "🧱", "🪟", "🏔️", "⛺", "🗽", "🪵", "🧍‍♀️", "🧋", "🍾"
                };
                String tEmoji = towerEmojis[random.nextInt(towerEmojis.length)];
                boolean leftTall = random.nextBoolean();
                boolean askTall = random.nextBoolean();
                String q = askTall ? "Which " + tEmoji + " is TALLER?" : "Which " + tEmoji + " is SHORTER?";
                String ans = (leftTall == askTall) ? "A" : "B";
                String json = String.format("{\"leftTall\":%b,\"askTall\":%b,\"emoji\":\"%s\"}", leftTall, askTall, tEmoji);
                return buildT(ans, "A", "B", "NONE", q, "comparison_tallShort", json);
            }
            case 3: {
                int n = random.nextInt(5) + 1;
                return buildT(n, 1, 10, "Find the correct quantity", "countItems", repeat(obj, n));
            }
            case 4: { 
                int n = random.nextInt(4) + 1; 
                String seq = "";
                for(int i=1; i<=n; i++) seq += i + " ➔ ";
                seq += "?";
                int correct = n + 1;
                return buildT(correct, 1, 10, "What comes next in the count?", "text", seq);
            }
            case 5: {
                int n = random.nextInt(5) + 1;
                return buildT(n, 1, 10, "Touch and count the objects!", "countItems", repeat(obj, n));
            }
            case 6: {
                int n = random.nextInt(5) + 1;
                return buildT(n, 1, 10, "Count the scattered " + obj + "s!", "countItems", repeat(obj, n));
            }
            case 7: {
                int n = random.nextInt(5) + 1;
                return buildT(n, 1, 10, "Listen and count the sounds!", "audioCheck", "🔊");
            }
            case 8: { 
                int n = random.nextInt(3) + 1; 
                String seq = n + ", _ , " + (n+2);
                int correct = n + 1;
                return buildT(correct, 1, 10, "What is the missing number?", "text", seq); 
            }
            default: return new String[]{"1", "2", "3", "Error", "text", ""};
        }
    }

    private String repeat(String s, int count) {
        String[] arr = new String[count];
        Arrays.fill(arr, s);
        return String.join(",", arr);
    }
    
    private String[] buildT(int correct, int min, int max, String inst, String type, String asset) {
        int d1 = uniqueR(min, max, correct);
        int d2 = uniqueR(min, max, correct, d1);
        return new String[]{String.valueOf(correct), String.valueOf(d1), String.valueOf(d2), inst, type, asset};
    }

    private String[] buildT(String correct, String opt1, String opt2, String opt3, String inst, String type, String asset) {
        String[] all = {opt1, opt2, opt3};
        String d1 = "", d2 = "";
        for(String o : all) {
            if(!o.equals(correct)) {
                if(d1.isEmpty()) d1 = o;
                else d2 = o;
            }
        }
        return new String[]{correct, d1, d2, inst, type, asset};
    }

    private String[] genLevel2(int topic) {
        String[] objects = {"⭐", "🚀", "🪐", "☄️"};
        String obj = objects[random.nextInt(objects.length)];

        switch(topic) {
            case 1: {
                int n = r(1,10);
                return buildT(n, 1, 10, "How many fingers?", "countItems", repeat("☝️", n));
            }
            case 2: {
                int d1 = r(1,3);
                int d2 = r(4,6);
                return new String[]{"0", String.valueOf(d1), String.valueOf(d2), "Find the empty basket!", "zeroConcept", "🔍"};
            }
            case 3: {
                int n = r(6,7);
                return buildT(n, 1, 10, "Count the objects!", "countItems", repeat(obj, n));
            }
            case 4: {
                int n = r(8,9);
                return buildT(n, 1, 10, "Count the objects!", "countItems", repeat(obj, n));
            }
            case 5: {
                int n = r(1,9);
                return buildT(10 - n, 1, 10, "How many more fuel blocks to launch?", "tenFrame", String.valueOf(n));
            }
            case 6: {
                int n = r(0,10);
                return buildT(n, 0, 10, "Which number traces this path?", "traceShape", String.valueOf(n));
            }
            case 7: { 
                int start = random.nextBoolean() ? 5 : 10;
                int n = r(0, start - 2); 
                String seq = (n+2) + " ➔ " + (n+1) + " ➔ _";
                return buildT(n, 0, 10, "What comes next in the countdown?", "text", seq); 
            }
            case 8: {
                int total = 10;
                int n = r(1,9);
                return buildT(n, 1, 10, "Count only the glowing objects!", "highlightCount", total + "," + n);
            }
            default: return buildN(1, 1, 10, "Error");
        }
    }

    private String[] genLevel3(int topic, int qNum) {
        switch(topic) {
            case 1: { // Big vs Small Real-World
                String[][] pairs = {
                    {"🐘", "🐁", "animals", "Elephant", "Mouse"},
                    {"🐋", "🐟", "animals", "Whale", "Fish"},
                    {"🌎", "🍎", "space", "Earth", "Apple"},
                    {"🚢", "🛶", "vehicles", "Ship", "Canoe"},
                    {"🏔️", "🪨", "nature", "Mountain", "Rock"},
                    {"🦅", "🐝", "animals", "Eagle", "Bee"},
                    {"🦁", "🐞", "animals", "Lion", "Ladybug"},
                    {"🐻", "🐜", "animals", "Bear", "Ant"},
                    {"☀️", "💡", "space", "Sun", "Lightbulb"},
                    {"🦖", "🦎", "animals", "T-Rex", "Lizard"},
                    {"🍉", "🍇", "food", "Watermelon", "Grape"},
                    {"🍕", "🍟", "food", "Pizza", "Fry"},
                    {"🚌", "🚲", "vehicles", "Bus", "Bike"},
                    {"🏰", "⛺", "buildings", "Castle", "Tent"},
                    {"🛩️", "🪁", "vehicles", "Airplane", "Kite"},
                    {"🌳", "🍄", "nature", "Tree", "Mushroom"},
                    {"🛋️", "🪑", "furniture", "Sofa", "Chair"},
                    {"🐎", "🐱", "animals", "Horse", "Cat"},
                    {"🌻", "🌼", "nature", "Sunflower", "Daisy"},
                    {"🎹", "🎻", "instruments", "Piano", "Violin"},
                    {"📺", "📱", "electronics", "TV", "Phone"},
                    {"🎂", "🧁", "food", "Cake", "Cupcake"},
                    {"🪗", "🪈", "instruments", "Accordion", "Flute"},
                    {"💻", "⌚", "electronics", "Laptop", "Watch"},
                    {"🚢", "⛵", "vehicles", "Ship", "Sailboat"},
                    {"🐅", "🐭", "animals", "Tiger", "Mouse"},
                    {"🏭", "🛖", "buildings", "Factory", "Hut"},
                    {"🏟️", "🏠", "buildings", "Stadium", "House"},
                    {"🐋", "🦐", "animals", "Whale", "Shrimp"},
                    {"🦏", "🦔", "animals", "Rhino", "Hedgehog"}
                };
                int idx = (qNum - 1) % pairs.length;
                String[] pair = pairs[idx];
                boolean leftBig = r(0, 1) == 0;
                boolean askBig = r(0, 1) == 0;
                String item1 = leftBig ? pair[0] : pair[1];
                String item2 = leftBig ? pair[1] : pair[0];
                String name1 = leftBig ? pair[3] : pair[4];
                String name2 = leftBig ? pair[4] : pair[3];
                String ans = (leftBig == askBig) ? "A" : "B";
                String q = askBig ? "Which one is BIGGER?" : "Which one is SMALLER?";
                String json = String.format(java.util.Locale.US, "{\"item1\":\"%s\",\"item2\":\"%s\",\"name1\":\"%s\",\"name2\":\"%s\",\"leftBig\":%b,\"askBig\":%b}", item1, item2, name1, name2, leftBig, askBig);
                return buildT(ans, "A", "B", "NONE", q, "comparison_realWorldSize", json);
            }
            case 2: { // Tall vs Short Real-World
                String[][] pairs = {
                    {"🦒", "🐰", "animals", "Giraffe", "Bunny"},
                    {"🏢", "🏠", "buildings", "Building", "Doghouse"},
                    {"🥛", "☕", "food", "Glass of Juice", "Teacup"},
                    {"🗼", "🧍", "city", "Tower", "Person"},
                    {"🌲", "🌱", "nature", "Pine Tree", "Sprout"},
                    {"🪜", "🪑", "objects", "Ladder", "Stool"},
                    {"⛰️", "🏕️", "nature", "Mountain", "Tent"},
                    {"🦩", "🦆", "animals", "Flamingo", "Duck"},
                    {"🗽", "🧸", "objects", "Statue of Liberty", "Teddy Bear"},
                    {"🏗️", "🧱", "objects", "Crane", "Brick"},
                    {"🦕", "🐢", "animals", "Brachiosaurus", "Turtle"},
                    {"🏙️", "🛖", "buildings", "Skyscraper", "Hut"},
                    {"🗼", "⛺", "buildings", "Tokyo Tower", "Tent"},
                    {"🌲", "🍄", "nature", "Pine Tree", "Mushroom"},
                    {"🧍‍♂️", "👶", "people", "Man", "Baby"},
                    {"🚪", "🪟", "buildings", "Door", "Window"},
                    {"🍾", "🥫", "food", "Bottle", "Can"},
                    {"🪔", "🕯️", "objects", "Floor Lamp", "Candle"},
                    {"🗼", "📭", "city", "Tower", "Mailbox"},
                    {"🏛️", "🪵", "objects", "Pillar", "Log"},
                    {"🧋", "🍶", "food", "Boba Tea", "Sake Cup"},
                    {"💈", "🧯", "objects", "Barber Pole", "Fire Extinguisher"},
                    {"🚏", "🛑", "city", "Bus Stop", "Stop Sign"},
                    {"🗼", "🚥", "city", "Tower", "Traffic Light"},
                    {"🐪", "🐑", "animals", "Camel", "Sheep"},
                    {"🌵", "🪴", "nature", "Saguaro", "Potted Plant"},
                    {"🦒", "🦦", "animals", "Giraffe", "Otter"},
                    {"🎢", "🎠", "fun", "Rollercoaster", "Carousel"},
                    {"🏰", "🛖", "buildings", "Castle", "Hut"},
                    {"🛝", "🪀", "toys", "Slide", "Yo-yo"}
                };
                int idx = (qNum - 1) % pairs.length;
                String[] p = pairs[idx];
                boolean leftTall = r(0,1) == 0;
                boolean askTall = r(0,1) == 0;
                String q = askTall ? "Look at these two! Which one is TALLER?" : "Look at these two! Which one is SHORTER?";
                String ans = (leftTall == askTall) ? "A" : "B";
                String i1 = leftTall ? p[0] : p[1];
                String i2 = leftTall ? p[1] : p[0];
                String json = String.format("{\"item1\":\"%s\",\"item2\":\"%s\",\"leftTall\":%b,\"askTall\":%b,\"type\":\"%s\"}", i1, i2, leftTall, askTall, p[2]);
                return buildT(ans, "A", "B", "NONE", q, "comparison_tallShortRealWorld", json);
            }
            case 3: { // Long vs Short Real-World (Bridge Builder)
                String[][] pairs = {
                    {"🪵", "🪨", "nature", "Log", "Rock"},
                    {"🪜", "🪑", "furniture", "Ladder", "Chair"},
                    {"🪢", "🧵", "tools", "Rope", "Thread"},
                    {"📏", "✏️", "school", "Ruler", "Pencil"},
                    {"🦯", "🪥", "tools", "Cane", "Toothbrush"},
                    {"🧹", "🖌️", "tools", "Broom", "Paintbrush"},
                    {"🛤️", "🛑", "objects", "Train Track", "Stop Sign"},
                    {"🛶", "🛟", "objects", "Canoe", "Life Ring"},
                    {"⛓️", "📎", "tools", "Chain", "Paperclip"},
                    {"🧣", "🧤", "clothing", "Scarf", "Glove"},
                    {"🎿", "⛸️", "sports", "Skis", "Ice Skate"},
                    {"🏏", "🏓", "sports", "Cricket Bat", "Ping Pong Paddle"},
                    {"🌂", "🕶️", "objects", "Umbrella", "Sunglasses"},
                    {"🥢", "🥄", "food", "Chopsticks", "Spoon"},
                    {"🪈", "🪇", "music", "Flute", "Maraca"},
                    {"🥖", "🥐", "food", "Baguette", "Croissant"},
                    {"🐍", "🐛", "animals", "Snake", "Caterpillar"},
                    {"🪱", "🐌", "animals", "Earthworm", "Snail"},
                    {"🐊", "🐸", "animals", "Crocodile", "Frog"},
                    {"🐉", "🦎", "animals", "Dragon", "Lizard"},
                    {"🛹", "🛼", "sports", "Skateboard", "Roller Skate"},
                    {"🗡️", "🔪", "tools", "Sword", "Knife"},
                    {"🪚", "🪛", "tools", "Saw", "Screwdriver"},
                    {"🧻", "🧼", "bath", "Toilet Paper Roll", "Soap"},
                    {"🔌", "🔋", "electronics", "Extension Cord", "Battery"},
                    {"🚿", "🧽", "bath", "Shower Hose", "Sponge"},
                    {"🧬", "🧶", "science", "DNA Strand", "Yarn Ball"},
                    {"🎋", "🍃", "nature", "Bamboo", "Leaf"},
                    {"🌴", "🥥", "nature", "Palm Tree", "Coconut"},
                    {"🏗️", "🧱", "buildings", "Crane", "Brick"}
                };
                int idx = (qNum - 1) % pairs.length;
                String[] p = pairs[idx];
                boolean leftLong = r(0,1) == 0;
                boolean askLong = r(0,1) == 0;
                String q = askLong ? "Which object is LONGER to help build our bridge?" : "Which object is SHORTER to help build our bridge?";
                String ans = (leftLong == askLong) ? "A" : "B";
                String i1 = leftLong ? p[0] : p[1];
                String i2 = leftLong ? p[1] : p[0];
                String json = String.format("{\"item1\":\"%s\",\"item2\":\"%s\",\"leftLong\":%b,\"askLong\":%b,\"type\":\"%s\"}", i1, i2, leftLong, askLong, p[2]);
                return buildT(ans, "A", "B", "NONE", q, "comparison_longShortRealWorld", json);
            }
            case 5: { // Heavy vs Light
                String[][] pairs = {
                    {"🍉", "🍓", "food", "Watermelon", "Strawberry"},
                    {"⚓", "🪶", "objects", "Anchor", "Feather"},
                    {"🎈", "🪨", "surprise", "Balloon", "Rock"},
                    {"🐘", "🐭", "animals", "Elephant", "Mouse"},
                    {"🚗", "🚲", "vehicles", "Car", "Bike"},
                    {"🏋️‍♂️", "🧽", "objects", "Weights", "Sponge"},
                    {"🎳", "🎾", "sports", "Bowling Ball", "Tennis Ball"},
                    {"📺", "📱", "electronics", "TV", "Phone"},
                    {"🧱", "🍃", "nature", "Brick", "Leaf"},
                    {"🐄", "🦋", "animals", "Cow", "Butterfly"},
                    {"🚢", "🛶", "vehicles", "Ship", "Canoe"},
                    {"🦖", "🦎", "animals", "T-Rex", "Lizard"},
                    {"🛋️", "🪑", "furniture", "Sofa", "Chair"},
                    {"🌲", "🍄", "nature", "Tree", "Mushroom"},
                    {"🏰", "⛺", "buildings", "Castle", "Tent"},
                    {"🏔️", "🧊", "nature", "Mountain", "Ice Cube"},
                    {"🦛", "🦆", "animals", "Hippo", "Duck"},
                    {"🛢️", "🥫", "objects", "Oil Drum", "Tin Can"},
                    {"🚂", "🛹", "vehicles", "Train", "Skateboard"},
                    {"🐻", "🐝", "animals", "Bear", "Bee"},
                    {"🐋", "🦐", "animals", "Whale", "Shrimp"},
                    {"🍔", "🍟", "food", "Burger", "Fry"},
                    {"🪨", "🪀", "objects", "Boulder", "Yo-yo"},
                    {"🧲", "📎", "tools", "Magnet", "Paperclip"},
                    {"🚁", "🪁", "vehicles", "Helicopter", "Kite"},
                    {"🧳", "👛", "accessories", "Luggage", "Purse"},
                    {"🚜", "🛴", "vehicles", "Tractor", "Scooter"},
                    {"🐎", "🐿️", "animals", "Horse", "Squirrel"},
                    {"🪵", "🥢", "wood", "Log", "Chopstick"},
                    {"🦏", "🦔", "animals", "Rhino", "Hedgehog"}
                };
                int idx = (qNum - 1) % pairs.length;
                String[] p = pairs[idx];
                boolean leftHeavy = r(0,1) == 0;
                boolean askHeavy = r(0,1) == 0;
                String q = askHeavy ? "Luna's scale tipped over! Can you tap the item that is HEAVIER?" : "Luna's scale tipped over! Can you tap the item that is LIGHTER?";
                String ans = (leftHeavy == askHeavy) ? "A" : "B";
                String i1 = leftHeavy ? p[0] : p[1];
                String i2 = leftHeavy ? p[1] : p[0];
                String n1 = leftHeavy ? p[3] : p[4];
                String n2 = leftHeavy ? p[4] : p[3];
                String json = String.format("{\"item1\":\"%s\",\"item2\":\"%s\",\"name1\":\"%s\",\"name2\":\"%s\",\"leftHeavy\":%b,\"askHeavy\":%b,\"type\":\"%s\"}", i1, i2, n1, n2, leftHeavy, askHeavy, p[2]);
                return buildT(ans, "A", "B", "NONE", q, "comparison_heavyLight", json);
            }
            case 4: { // Delivery Space-Port
                String[][] rects = {
                    {"brick", "Brick", "🧱"},
                    {"lego", "LEGO Block", "🧱"},
                    {"phone", "Smartphone", "📱"},
                    {"tablet", "Tablet Screen", "📱"},
                    {"storybook", "Storybook", "📘"},
                    {"notebook", "Notebook", "📓"}
                };
                String[][] squares = {
                    {"postit", "Square Post-it Note", "🟨"},
                    {"window", "Square Window Pane", "🪟"},
                    {"dice", "Dice", "🎲"},
                    {"tile", "Checkered Tile", "🏁"}
                };
                
                int rectIdx = random.nextInt(rects.length);
                int sq1Idx = random.nextInt(squares.length);
                int sq2Idx;
                do { sq2Idx = random.nextInt(squares.length); } while(sq1Idx == sq2Idx);
                
                String[] rect = rects[rectIdx];
                String[] sq1 = squares[sq1Idx];
                String[] sq2 = squares[sq2Idx];
                
                // Shuffle options
                List<String[]> options = new ArrayList<>();
                options.add(rect); options.add(sq1); options.add(sq2);
                Collections.shuffle(options, random);
                
                String ans = "NONE";
                for(int i=0; i<3; i++){
                    if(options.get(i)[0].equals(rect[0])) {
                       if(i==0) ans = "A"; else if(i==1) ans = "B"; else ans = "C";
                    }
                }
                
                String json = String.format("{\"items\":[{\"id\":\"%s\",\"name\":\"%s\",\"emoji\":\"%s\",\"isRect\":%b},{\"id\":\"%s\",\"name\":\"%s\",\"emoji\":\"%s\",\"isRect\":%b},{\"id\":\"%s\",\"name\":\"%s\",\"emoji\":\"%s\",\"isRect\":%b}]}",
                    options.get(0)[0], options.get(0)[1], options.get(0)[2], options.get(0)[0].equals(rect[0]),
                    options.get(1)[0], options.get(1)[1], options.get(1)[2], options.get(1)[0].equals(rect[0]),
                    options.get(2)[0], options.get(2)[1], options.get(2)[2], options.get(2)[0].equals(rect[0]));
                    
                String q = "Luna needs the LONG boxes where two sides are stretched out extra far! Can you tap the Long Rectangles?";
                return buildT(ans, "A", "B", "C", q, "deliverySpacePort", json);
            }
            case 6: { // Thick vs Thin
                  String[][] pairs = {
                      {"🪵", "🌿", "Trunk", "Twig"},
                      {"🖍️", "✏️", "Crayon", "Pencil"},
                      {"📘", "📰", "Book", "Newspaper"},
                      {"🍔", "🫓", "Burger", "Cracker"},
                      {"🪢", "🧵", "Rope", "Thread"},
                      {"🍞", "🥪", "Loaf", "Slice"},
                      {"🥞", "🫔", "Pancakes", "Crepe"},
                      {"🪵", "🦯", "Log", "Stick"},
                      {"🖊️", "🖋️", "Marker", "Pen"},
                      {"🧥", "👕", "Coat", "Shirt"},
                      {"🔌", "🧶", "Cable", "String"},
                      {"🛏️", "🛌", "Mattress", "Blanket"},
                      {"📚", "✉️", "Encyclopedia", "Letter"},
                      {"🏛️", "💈", "Column", "Pole"},
                      {"🧱", "🀄", "Brick", "Tile"},
                      {"🥒", "🫘", "Cucumber", "Bean"},
                      {"👢", "🧦", "Boots", "Socks"},
                      {"🎂", "🍪", "Cake", "Cookie"},
                      {"📖", "🗞️", "Dictionary", "Magazine"},
                      {"🛋️", "🪑", "Sofa", "Chair"},
                      {"🧱", "🚪", "Wall", "Door"},
                      {"🏕️", "🧣", "Sleeping Bag", "Towel"},
                      {"🧶", "👕", "Sweater", "T-Shirt"},
                      {"📕", "📄", "Book", "Paper"},
                      {"🧊", "❄️", "Ice Block", "Snowflake"},
                      {"🥩", "🥓", "Steak", "Bacon"},
                      {"🪵", "🥢", "Log", "Chopstick"},
                      {"🧀", "🥪", "Cheese Wheel", "Cheese Slice"},
                      {"🌯", "🌮", "Burrito", "Taco"},
                      {"🍠", "🍟", "Sweet Potato", "French Fry"}
                  };
                  int idx = (qNum - 1) % pairs.length;
                  String[] p = pairs[idx];
                  boolean leftThick = r(0,1) == 0;
                  boolean askThick = r(0,1) == 0;
                  String q = askThick ? "Luna needs a strong, THICK branch! Can you tap the THICK one?" : "Which one is THIN?";
                  String ans = (leftThick == askThick) ? "A" : "B";
                  
                  String i1 = leftThick ? p[0] : p[1];
                  String i2 = leftThick ? p[1] : p[0];
                  String n1 = leftThick ? p[2] : p[3];
                  String n2 = leftThick ? p[3] : p[2];

                  String json = String.format("{\"item1\":\"%s\",\"item2\":\"%s\",\"name1\":\"%s\",\"name2\":\"%s\",\"leftThick\":%b,\"askThick\":%b}", i1, i2, n1, n2, leftThick, askThick);
                  return buildT(ans, "A", "B", "NONE", q, "comparison_thickThin", json);
              }
                        case 7: { // Perfect Matches
                  String[][] items = {
                      {"⭐", "Star"}, {"🎈", "Balloon"}, {"💎", "Gem"}, {"🍎", "Apple"}, {"🌸", "Flower"},
                      {"🦋", "Butterfly"}, {"🍄", "Mushroom"}, {"⚽", "Ball"}, {"🔔", "Bell"}, {"🎁", "Gift"},
                      {"🚗", "Car"}, {"🧸", "Teddy"}, {"🍩", "Donut"}, {"🍀", "Clover"}, {"🌙", "Moon"},
                      {"🍉", "Watermelon"}, {"🔑", "Key"}, {"🚀", "Rocket"}, {"🧩", "Puzzle"}, {"🎨", "Palette"},
                      {"🎸", "Guitar"}, {"👑", "Crown"}, {"🍔", "Burger"}, {"🍕", "Pizza"}, {"🍦", "Ice Cream"},
                      {"🍭", "Lollipop"}, {"🧁", "Cupcake"}, {"🍓", "Strawberry"}, {"🥑", "Avocado"}, {"🍍", "Pineapple"}
                  };
                  String[][] shapes = {
                      {"💠", "Diamond"}, {"📦", "Box"}, {"🧿", "Amulet"}, {"🪩", "Disco Ball"}, {"🪨", "Rock"}
                  };
                  int idx = (qNum - 1) % items.length;
                  String tEmoji = items[idx][0];
                  String tName = items[idx][1];
                  
                  int targetHue = r(0, 5) * 60;
                  
                  // Option 1: Same color, wrong size (0.5 or 1.5)
                  double o1Size = r(0,1) == 0 ? 0.5 : 1.5;
                  int o1Hue = targetHue;
                  String o1Emoji = tEmoji;
                  
                  // Option 2: Wrong shape, wrong size
                  String o2Emoji = shapes[r(0, shapes.length-1)][0];
                  double o2Size = r(0,1) == 0 ? 0.6 : 1.4;
                  int o2Hue = r(0, 5) * 60;
                  
                  // Option 3: Same shape, different color, EXACT same size
                  String o3Emoji = tEmoji;
                  double o3Size = 1.0;
                  int o3Hue = (targetHue + 120 + r(0,1)*60) % 360;
                  
                  int correctIdx = r(0, 2);
                  String[] opsEmoji = new String[3];
                  double[] opsSize = new double[3];
                  int[] opsHue = new int[3];
                  
                  if (correctIdx == 0) {
                      opsEmoji[0] = o3Emoji; opsSize[0] = o3Size; opsHue[0] = o3Hue;
                      opsEmoji[1] = o1Emoji; opsSize[1] = o1Size; opsHue[1] = o1Hue;
                      opsEmoji[2] = o2Emoji; opsSize[2] = o2Size; opsHue[2] = o2Hue;
                  } else if (correctIdx == 1) {
                      opsEmoji[1] = o3Emoji; opsSize[1] = o3Size; opsHue[1] = o3Hue;
                      opsEmoji[0] = o1Emoji; opsSize[0] = o1Size; opsHue[0] = o1Hue;
                      opsEmoji[2] = o2Emoji; opsSize[2] = o2Size; opsHue[2] = o2Hue;
                  } else {
                      opsEmoji[2] = o3Emoji; opsSize[2] = o3Size; opsHue[2] = o3Hue;
                      opsEmoji[0] = o1Emoji; opsSize[0] = o1Size; opsHue[0] = o1Hue;
                      opsEmoji[1] = o2Emoji; opsSize[1] = o1Size; opsHue[1] = o2Hue;
                  }
                  
                  String q = "Luna needs a " + tName + " that is the exact same size to power up her ship! Can you find the Perfect Match?";
                  String ans = correctIdx == 0 ? "A" : (correctIdx == 1 ? "B" : "C");
                  
                  String json = String.format("{\"target\":{\"emoji\":\"%s\",\"size\":1.0,\"hue\":%d},\"options\":[{\"emoji\":\"%s\",\"size\":%.1f,\"hue\":%d},{\"emoji\":\"%s\",\"size\":%.1f,\"hue\":%d},{\"emoji\":\"%s\",\"size\":%.1f,\"hue\":%d}],\"correctIndex\":%d}", 
                      tEmoji, targetHue, 
                      opsEmoji[0], opsSize[0], opsHue[0], 
                      opsEmoji[1], opsSize[1], opsHue[1], 
                      opsEmoji[2], opsSize[2], opsHue[2], 
                      correctIdx);
                      
                  return buildT(ans, "A", "B", "C", q, "comparison_matches", json);
              }
                        case 8: { // Ordering Sizes
                  String[][] sets = {
                      {"🧸", "🧸", "🧸", "Baby Bear, Mommy Bear, and Daddy Bear"}, // 0
                      {"🪨", "🪨", "🪨", "Pebble, Rock, and Boulder"}, // 1
                      {"🚲", "🚗", "✈️", "Bicycle, Car, and Airplane"}, // 2
                      {"🌱", "🌿", "🌳", "Sprout, Plant, and Tree"}, // 3
                      {"🐥", "🐔", "🦅", "Chick, Chicken, and Eagle"}, // 4
                      {"⛺", "🏠", "🏢", "Tent, House, and Building"}, // 5
                      {"☄️", "🌕", "🪐", "Meteor, Moon, and Planet"}, // 6
                      {"🍓", "🍎", "🍉", "Strawberry, Apple, and Watermelon"}, // 7
                      {"🛹", "🛵", "🚌", "Skateboard, Scooter, and Bus"}, // 8
                      {"🐭", "🐶", "🐎", "Mouse, Dog, and Horse"}, // 9
                      {"🎈", "🎈", "🎈", "Small, Medium, and Large Balloons"}, // 10
                      {"⭐", "⭐", "⭐", "Tiny, Medium, and Giant Stars"}, // 11
                      {"🎁", "🎁", "🎁", "Small, Medium, and Huge Gifts"}, // 12
                      {"🍔", "🍔", "🍔", "Slider, Burger, and Mega Burger"}, // 13
                      {"🐟", "🐟", "🐟", "Minnow, Fish, and Giant Fish"}, // 14
                      {"🍄", "🍄", "🍄", "Tiny, Medium, and Huge Mushrooms"}, // 15
                      {"🐞", "🐢", "🐘", "Ladybug, Turtle, and Elephant"}, // 16
                      {"📱", "💻", "📺", "Phone, Laptop, and TV"}, // 17
                      {"🐜", "🦋", "🦅", "Ant, Butterfly, and Eagle"}, // 18
                      {"🚪", "🚪", "🚪", "Small, Medium, and Large Doors"}, // 19
                      {"❄️", "❄️", "❄️", "Tiny, Medium, and Giant Snowflakes"}, // 20
                      {"🛸", "🛸", "🛸", "Small, Medium, and Mothership UFOs"}, // 21
                      {"🥁", "🥁", "🥁", "Small, Medium, and Big Drums"}, // 22
                      {"🌲", "🌲", "🌲", "Sapling, Pine, and Giant Redwood"}, // 23
                      {"⚽", "⚽", "⚽", "Small, Medium, and Large Balls"}, // 24
                      {"🍕", "🍕", "🍕", "Slice, Pizza, and Giant Pizza"}, // 25
                      {"💎", "💎", "💎", "Pebble, Gem, and Huge Diamond"}, // 26
                      {"🚤", "⛵", "🚢", "Speedboat, Sailboat, and Cruise Ship"}, // 27
                      {"🧁", "🎂", "🎂", "Cupcake, Cake, and Wedding Cake"}, // 28
                      {"🚁", "🚁", "🚁", "Toy Copter, Helicopter, and Heavy Lifter"} // 29
                  };
                  int idx = (qNum - 1) % sets.length;
                  String[] set = sets[idx];
                  
                  double[] scales = {0.6, 1.0, 1.5};
                  
                  String q = "Luna needs to organize these items from Smallest to Largest! Can you slide them onto the correct podiums?";
                  String json = String.format("{\"theme\":\"%s\", \"items\":[{\"id\":\"obj0\",\"emoji\":\"%s\",\"scale\":%.1f,\"podiumIndex\":0},{\"id\":\"obj1\",\"emoji\":\"%s\",\"scale\":%.1f,\"podiumIndex\":1},{\"id\":\"obj2\",\"emoji\":\"%s\",\"scale\":%.1f,\"podiumIndex\":2}]}", 
                      set[3], set[0], scales[0], set[1], scales[1], set[2], scales[2]);
                      
                  return buildT("1,2,3", "A", "B", "C", q, "ordering_size", json);
              }
            default: return buildN(1, 1, 5, "Error");
        }
    }

    private String[] genLevel4(int topic, int qNum) {
        switch(topic) {
                          case 1: {
                  String[][] circles = {
                      {"🕒", "🚲", "🍩"}, {"⚽", "🍪", "🪙"}, {"🎯", "🧭", "🌕"},
                      {"💿", "🔘", "🎡"}, {"🏀", "⚾", "🎱"}, {"🌍", "🧿", "🥝"},
                      {"🍊", "🥞", "🕒"}, {"🚲", "🍩", "⚽"}, {"🍪", "🪙", "🎯"},
                      {"🧭", "🌕", "💿"}, {"🔘", "🎡", "🏀"}, {"⚾", "🎱", "🌍"},
                      {"🧿", "🥝", "🍊"}, {"🥞", "🕒", "🚲"}, {"🍩", "⚽", "🍪"},
                      {"🪙", "🎯", "🧭"}, {"🌕", "💿", "🔘"}, {"🎡", "🏀", "⚾"},
                      {"🎱", "🌍", "🧿"}, {"🥝", "🍊", "🥞"}, {"🕒", "⚽", "🎯"},
                      {"🚲", "🍪", "🧭"}, {"🍩", "🪙", "🌕"}, {"⚽", "🎯", "💿"},
                      {"🍪", "🧭", "🔘"}, {"🪙", "🌕", "🎡"}, {"🎯", "💿", "🏀"},
                      {"🧭", "🔘", "⚾"}, {"🌕", "🎡", "🎱"}, {"💿", "🏀", "🌍"}
                  };
                  String[][] distractors = {
                      {"🖼️", "🍉"}, {"📐", "🍕"}, {"📱", "📺"}, {"🚪", "🪁"},
                      {"🥪", "📘"}, {"🎁", "🧊"}, {"🧱", "✉️"}, {"🖼️", "📐"},
                      {"🍉", "🍕"}, {"📱", "🚪"}, {"📺", "🪁"}, {"🥪", "🎁"},
                      {"📘", "🧊"}, {"🧱", "🖼️"}, {"✉️", "🍉"}, {"📐", "📱"},
                      {"🍕", "📺"}, {"🚪", "🥪"}, {"🪁", "📘"}, {"🎁", "🧱"},
                      {"🧊", "✉️"}, {"🖼️", "📱"}, {"🍉", "📺"}, {"📐", "🚪"},
                      {"🍕", "🪁"}, {"📱", "🥪"}, {"📺", "📘"}, {"🚪", "🎁"},
                      {"🪁", "🧊"}, {"🥪", "🧱"}
                  };
                  int idx = (qNum - 1) % 30;
                  String[] c = circles[idx];
                  String[] d = distractors[idx];
                  
                  int c0 = (d[0].equals("🍉") || d[0].equals("📐") || d[0].equals("🍕") || d[0].equals("🥪")) ? 3 : 4;
                  int c1 = (d[1].equals("🍉") || d[1].equals("📐") || d[1].equals("🍕") || d[1].equals("🥪")) ? 3 : 4;
                  
                  String q = "Luna needs things that are perfectly round with no corners! Can you tap all the circles to fix her rover?";
                  String json = String.format("{\"items\":[{\"id\":\"c0\",\"emoji\":\"%s\",\"isCircle\":true},{\"id\":\"c1\",\"emoji\":\"%s\",\"isCircle\":true},{\"id\":\"c2\",\"emoji\":\"%s\",\"isCircle\":true},{\"id\":\"d0\",\"emoji\":\"%s\",\"isCircle\":false,\"corners\":%d},{\"id\":\"d1\",\"emoji\":\"%s\",\"isCircle\":false,\"corners\":%d}]}",
                      c[0], c[1], c[2], d[0], c0, d[1], c1);
                      
                  return buildT("1,2,3", "A", "B", "C", q, "shape_scanner_circle", json);
              }
                          case 2: {
                  String[][] squares = {
                      {"🏁", "🍞", "🖼️"}, {"🎁", "🧊", "🔲"}, {"🟩", "🟪", "🟨"},
                      {"🟧", "⬜", "🟥"}, {"🟦", "🟫", "🏁"}, {"🍞", "🖼️", "🎁"},
                      {"🧊", "🔲", "🟩"}, {"🟪", "🟨", "🟧"}, {"⬜", "🟥", "🟦"},
                      {"🟫", "🏁", "🍞"}, {"🖼️", "🎁", "🧊"}, {"🔲", "🟩", "🟪"},
                      {"🟨", "🟧", "⬜"}, {"🟥", "🟦", "🟫"}, {"🏁", "🖼️", "🧊"},
                      {"🍞", "🎁", "🔲"}, {"🟩", "🟨", "⬜"}, {"🟪", "🟧", "🟥"},
                      {"🟦", "🏁", "🖼️"}, {"🟫", "🍞", "🎁"}, {"🧊", "🟩", "🟨"},
                      {"🔲", "🟪", "🟧"}, {"⬜", "🟦", "🏁"}, {"🟥", "🟫", "🍞"},
                      {"🖼️", "🧊", "🟩"}, {"🎁", "🔲", "🟪"}, {"🟨", "⬜", "🟦"},
                      {"🟧", "🟥", "🟫"}, {"🏁", "🧊", "🟨"}, {"🍞", "🔲", "🟧"}
                  };
                  String[][] distractors = {
                      {"🚪", "rectangle", "🪁", "kite"}, {"📱", "rectangle", "💠", "kite"},
                      {"📺", "rectangle", "🔷", "kite"}, {"💳", "rectangle", "🔶", "kite"},
                      {"💵", "rectangle", "🪁", "kite"}, {"🧱", "rectangle", "💠", "kite"},
                      {"🎟️", "rectangle", "🔷", "kite"}, {"🪪", "rectangle", "🔶", "kite"},
                      {"🍫", "rectangle", "🪁", "kite"}, {"🧽", "rectangle", "💠", "kite"},
                      {"🚪", "rectangle", "🔷", "kite"}, {"📱", "rectangle", "🔶", "kite"},
                      {"📺", "rectangle", "🪁", "kite"}, {"💳", "rectangle", "💠", "kite"},
                      {"💵", "rectangle", "🔷", "kite"}, {"🧱", "rectangle", "🔶", "kite"},
                      {"🎟️", "rectangle", "🪁", "kite"}, {"🪪", "rectangle", "💠", "kite"},
                      {"🍫", "rectangle", "🔷", "kite"}, {"🧽", "rectangle", "🔶", "kite"},
                      {"🚪", "rectangle", "📱", "rectangle"}, {"📺", "rectangle", "💳", "rectangle"},
                      {"💵", "rectangle", "🧱", "rectangle"}, {"🎟️", "rectangle", "🪪", "rectangle"},
                      {"🍫", "rectangle", "🧽", "rectangle"}, {"🪁", "kite", "💠", "kite"},
                      {"🔷", "kite", "🔶", "kite"}, {"🚪", "rectangle", "🔶", "kite"},
                      {"📱", "rectangle", "🔷", "kite"}, {"📺", "rectangle", "💠", "kite"}
                  };
                  int idx = (qNum - 1) % 30;
                  String[] sq = squares[idx];
                  String[] di = distractors[idx];
                  
                  String q = "Luna needs cargo boxes that are perfectly equal on all sides! Can you find the Strict Squares?";
                  String json = String.format("{\"items\":[{\"id\":\"s0\",\"emoji\":\"%s\",\"shape\":\"square\"},{\"id\":\"s1\",\"emoji\":\"%s\",\"shape\":\"square\"},{\"id\":\"s2\",\"emoji\":\"%s\",\"shape\":\"square\"},{\"id\":\"d0\",\"emoji\":\"%s\",\"shape\":\"%s\"},{\"id\":\"d1\",\"emoji\":\"%s\",\"shape\":\"%s\"}]}",
                      sq[0], sq[1], sq[2], di[0], di[1], di[2], di[3]);
                      
                  return buildT("1,2,3", "A", "B", "C", q, "shape_strict_square", json);
              }
                          case 3: {
                  String[][] triangles = {
                      {"⛺", "🍕", "⚠️"}, {"🍉", "🏔️", "🧀"}, {"📐", "🏕️", "🌲"},
                      {"⛺", "🍉", "📐"}, {"🍕", "🏔️", "🏕️"}, {"⚠️", "🧀", "🌲"},
                      {"🏔️", "📐", "⚠️"}, {"🏕️", "⛺", "🧀"}, {"🌲", "🍕", "🍉"},
                      {"🧀", "🏕️", "🍕"}, {"⚠️", "🌲", "⛺"}, {"📐", "🍉", "🏔️"},
                      {"⛺", "🏔️", "🌲"}, {"🍕", "🧀", "📐"}, {"⚠️", "🍉", "🏕️"},
                      {"🍉", "⛺", "🧀"}, {"🏔️", "🍕", "⚠️"}, {"🏕️", "🌲", "📐"},
                      {"🌲", "🧀", "🍉"}, {"📐", "⛺", "🏔️"}, {"⚠️", "🏕️", "🍕"},
                      {"🧀", "⚠️", "🌲"}, {"🍕", "🍉", "⛺"}, {"🏕️", "🏔️", "📐"},
                      {"⛺", "🏕️", "⚠️"}, {"🍉", "🌲", "🍕"}, {"🏔️", "🧀", "📐"},
                      {"🌲", "🏔️", "🏕️"}, {"🧀", "⛺", "🍉"}, {"📐", "🍕", "⚠️"}
                  };
                  String[][] distractors = {
                      {"🗺️", "4", "🧭", "0"}, {"🧳", "4", "🪵", "0"},
                      {"📖", "4", "🪙", "0"}, {"🖼️", "4", "🍩", "0"},
                      {"🎫", "4", "🧭", "0"}, {"🗺️", "4", "🪵", "0"},
                      {"🧳", "4", "🪙", "0"}, {"📖", "4", "🍩", "0"},
                      {"🖼️", "4", "🧭", "0"}, {"🎫", "4", "🪵", "0"},
                      {"🗺️", "4", "🪙", "0"}, {"🧳", "4", "🍩", "0"},
                      {"📖", "4", "🧭", "0"}, {"🖼️", "4", "🪵", "0"},
                      {"🎫", "4", "🪙", "0"}, {"🗺️", "4", "🍩", "0"},
                      {"🧳", "4", "🧭", "0"}, {"📖", "4", "🪵", "0"},
                      {"🖼️", "4", "🪙", "0"}, {"🎫", "4", "🍩", "0"},
                      {"🗺️", "4", "🧳", "4"}, {"📖", "4", "🖼️", "4"},
                      {"🎫", "4", "🗺️", "4"}, {"🧭", "0", "🪵", "0"},
                      {"🪙", "0", "🍩", "0"}, {"🧭", "0", "🪙", "0"},
                      {"🪵", "0", "🍩", "0"}, {"🗺️", "4", "🍩", "0"},
                      {"🧳", "4", "🪙", "0"}, {"📖", "4", "🪵", "0"}
                  };
                  int idx = (qNum - 1) % 30;
                  String[] tri = triangles[idx];
                  String[] di = distractors[idx];
                  
                  String q = "Luna needs objects with exactly 3 sharp corners to build a strong shelter! Can you tap the Sharp Triangles?";
                  String json = String.format("{\"items\":[{\"id\":\"t0\",\"emoji\":\"%s\",\"shape\":\"triangle\",\"corners\":3},{\"id\":\"t1\",\"emoji\":\"%s\",\"shape\":\"triangle\",\"corners\":3},{\"id\":\"t2\",\"emoji\":\"%s\",\"shape\":\"triangle\",\"corners\":3},{\"id\":\"d0\",\"emoji\":\"%s\",\"shape\":\"distractor\",\"corners\":%s},{\"id\":\"d1\",\"emoji\":\"%s\",\"shape\":\"distractor\",\"corners\":%s}]}",
                      tri[0], tri[1], tri[2], di[0], di[1], di[2], di[3]);
                      
                  return buildT("1,2,3", "A", "B", "C", q, "shape_sharp_triangle", json);
              }
            case 4: { // Delivery Space-Port
                String[][] rects = {
                    {"phone", "Smartphone", "📱"},
                    {"book", "Storybook", "📘"},
                    {"card", "Credit Card", "💳"},
                    {"money", "Banknote", "💵"},
                    {"ticket", "Ticket", "🎟️"},
                    {"choc", "Chocolate", "🍫"},
                    {"door", "Door", "🚪"},
                    {"video", "Videotape", "📼"},
                    {"env", "Envelope", "✉️"},
                    {"radio", "Radio", "📻"}
                };
                String[][] squares = {
                    {"postit", "Post-it Note", "🟨"},
                    {"gift", "Gift Box", "🎁"},
                    {"dice", "Dice", "🎲"},
                    {"waffle", "Waffle", "🧇"},
                    {"ice", "Ice Cube", "🧊"},
                    {"box", "Package", "📦"},
                    {"red", "Red Tile", "🟥"},
                    {"blue", "Blue Tile", "🟦"},
                    {"green", "Green Tile", "🟩"},
                    {"orange", "Orange Tile", "🟧"}
                };
                
                int rectIdx = (qNum - 1) % 10;
                int sq1Idx = (qNum - 1) % 10;
                int sq2Idx = (qNum - 1 + (qNum % 9) + 1) % 10;
                
                String[] rect = rects[rectIdx];
                String[] sq1 = squares[sq1Idx];
                String[] sq2 = squares[sq2Idx];
                
                // Shuffle options
                List<String[]> options = new ArrayList<>();
                options.add(rect); options.add(sq1); options.add(sq2);
                Collections.shuffle(options, random);
                
                String ans = "NONE";
                for(int i=0; i<3; i++){
                    if(options.get(i)[0].equals(rect[0])) {
                       if(i==0) ans = "A"; else if(i==1) ans = "B"; else ans = "C";
                    }
                }
                
                String json = String.format("{\"items\":[{\"id\":\"%s\",\"name\":\"%s\",\"emoji\":\"%s\",\"isRect\":%b},{\"id\":\"%s\",\"name\":\"%s\",\"emoji\":\"%s\",\"isRect\":%b},{\"id\":\"%s\",\"name\":\"%s\",\"emoji\":\"%s\",\"isRect\":%b}]}",
                    options.get(0)[0], options.get(0)[1], options.get(0)[2], options.get(0)[0].equals(rect[0]),
                    options.get(1)[0], options.get(1)[1], options.get(1)[2], options.get(1)[0].equals(rect[0]),
                    options.get(2)[0], options.get(2)[1], options.get(2)[2], options.get(2)[0].equals(rect[0]));
                    
                String q = "Luna needs the LONG boxes where two sides are stretched out extra far! Can you tap the Long Rectangles?";
                return buildT(ans, "A", "B", "C", q, "deliverySpacePort", json);
            }
            case 5: { // Cosmic Playroom Color Sorting
                String[][] redItems = {
                    {"apple", "Apple", "🍎"}, {"firetruck", "Fire Truck", "🚒"}, {"redstar", "Star", "🔻"}, 
                    {"strawberry", "Strawberry", "🍓"}, {"redcar", "Car", "🚗"}, {"rose", "Rose", "🌹"}, {"backpack", "Backpack", "🎒"}
                };
                String[][] blueItems = {
                    {"droplet", "Droplet", "💧"}, {"blueblock", "Block", "🟦"}, {"whale", "Whale", "🐳"}, 
                    {"jeans", "Jeans", "👖"}, {"bluebook", "Book", "📘"}, {"blueberries", "Berries", "🫐"}, {"bluesuv", "SUV", "🚙"}
                };
                String[][] yellowItems = {
                    {"banana", "Banana", "🍌"}, {"sun", "Sun", "☀️"}, {"duck", "Duck", "🦆"}, 
                    {"sunflower", "Sunflower", "🌻"}, {"cheese", "Cheese", "🧀"}, {"taxi", "Taxi", "🚕"}, {"lemon", "Lemon", "🍋"}
                };
                
                int[][] combos = {
                    {0,1}, {0,2}, {0,3}, {0,4}, {0,5}, {0,6}, {1,2}, {1,3}, {1,4}, {1,5}, {1,6}, 
                    {2,3}, {2,4}, {2,5}, {2,6}, {3,4}, {3,5}, {3,6}, {4,5}, {4,6}, {5,6}
                };
                
                int[] rPair = combos[(qNum - 1) % 21];
                int[] bPair = combos[(qNum - 1 + 4) % 21];
                int[] yPair = combos[(qNum - 1 + 9) % 21];
                
                List<String[]> selectedItems = new ArrayList<>();
                // Red items
                selectedItems.add(new String[]{redItems[rPair[0]][0], redItems[rPair[0]][1], redItems[rPair[0]][2], "RED"});
                selectedItems.add(new String[]{redItems[rPair[1]][0], redItems[rPair[1]][1], redItems[rPair[1]][2], "RED"});
                // Blue items
                selectedItems.add(new String[]{blueItems[bPair[0]][0], blueItems[bPair[0]][1], blueItems[bPair[0]][2], "BLUE"});
                selectedItems.add(new String[]{blueItems[bPair[1]][0], blueItems[bPair[1]][1], blueItems[bPair[1]][2], "BLUE"});
                // Yellow items
                selectedItems.add(new String[]{yellowItems[yPair[0]][0], yellowItems[yPair[0]][1], yellowItems[yPair[0]][2], "YELLOW"});
                selectedItems.add(new String[]{yellowItems[yPair[1]][0], yellowItems[yPair[1]][1], yellowItems[yPair[1]][2], "YELLOW"});
                
                Collections.shuffle(selectedItems, random);
                
                StringBuilder itemsJson = new StringBuilder("[");
                for(int i=0; i<selectedItems.size(); i++) {
                    String[] it = selectedItems.get(i);
                    itemsJson.append(String.format("{\"id\":\"%s\",\"name\":\"%s\",\"emoji\":\"%s\",\"color\":\"%s\"}", it[0], it[1], it[2], it[3]));
                    if(i < selectedItems.size() - 1) itemsJson.append(",");
                }
                itemsJson.append("]");
                
                String json = String.format("{\"bins\":[{\"color\":\"RED\",\"hex\":\"#FF4444\",\"name\":\"Red Bin\"},{\"color\":\"BLUE\",\"hex\":\"#4444FF\",\"name\":\"Blue Bin\"},{\"color\":\"YELLOW\",\"hex\":\"#FFCC00\",\"name\":\"Yellow Bin\"}],\"items\":%s}", itemsJson.toString());
                String q = "Luna's playroom is a mess! Can you put all the items into the bins that match their color?";
                
                return buildT("NONE", "A", "B", "C", q, "cosmic_playroom", json);
            }
            case 6: { // Above or Below Game
                String[][] landmarks = {
                    {"cloud", "purple cloud", "☁️"}, {"island", "floating island", "🏝️"},
                    {"tree", "space tree", "🌳"}, {"saturn", "Saturn ring", "🪐"},
                    {"ufo", "UFO mothership", "🛸"}, {"station", "space station", "🏠"},
                    {"moon", "crescent moon", "🌙"}
                };
                String[][] targets = {
                    {"star", "golden star", "⭐"}, {"rocket", "toy rocket", "🚀"},
                    {"crystal", "blue crystal", "💎"}, {"apple", "red apple", "🍎"},
                    {"soccer", "soccer ball", "⚽"}, {"teddy", "teddy bear", "🧸"},
                    {"balloon", "red balloon", "🎈"}
                };
                
                int lIdx = (qNum - 1) % 7;
                int tIdx = ((qNum - 1) * 3 + 1) % 7;
                String instruction = (qNum % 2 == 0) ? "ABOVE" : "BELOW";
                
                String[] l = landmarks[lIdx];
                String[] t = targets[tIdx];
                
                String json = String.format(
                    "{\"landmark\":{\"id\":\"%s\",\"name\":\"%s\",\"emoji\":\"%s\"},\"target\":{\"id\":\"%s\",\"name\":\"%s\",\"emoji\":\"%s\"},\"instruction\":\"%s\"}",
                    l[0], l[1], l[2], t[0], t[1], t[2], instruction
                );
                
                String q = String.format("Help Luna clear the landing pad! Can you place the %s %s the %s?", t[1], instruction.toLowerCase(), l[1]);
                
                return buildT("NONE", "A", "B", "C", q, "above_below_game", json);
            }
            case 7: { // Front vs Behind Visual Game
                String[][] scenarios = {
                    {"jungle", "🌳", "Tree", "🐒", "Monkey", "🐍", "Snake", "🦜", "Parrot"},
                    {"bedroom", "🏠", "Doghouse", "🐶", "Puppy", "🐱", "Kitten", "🦴", "Bone"},
                    {"ocean", "🪨", "Coral Rock", "🐙", "Octopus", "🦀", "Crab", "🐠", "Fish"},
                    {"space", "🚀", "Rocket", "👽", "Alien", "👨‍🚀", "Astronaut", "🛰️", "Satellite"},
                    {"farm", "🛖", "Barn", "🐄", "Cow", "🐖", "Pig", "🐓", "Rooster"},
                    {"arctic", "🧊", "Iceberg", "🐧", "Penguin", "🐻‍❄️", "Polar Bear", "🦭", "Seal"},
                    {"desert", "🌵", "Cactus", "🐪", "Camel", "🦎", "Lizard", "🦂", "Scorpion"},
                    {"garden", "🌻", "Sunflower", "🐝", "Bee", "🐞", "Ladybug", "🐛", "Caterpillar"},
                    {"forest", "🍄", "Mushroom", "🦊", "Fox", "🦔", "Hedgehog", "🦉", "Owl"},
                    {"city", "🏢", "Building", "🚖", "Taxi", "🚌", "Bus", "🛵", "Scooter"},
                    {"park", "🛝", "Slide", "🧸", "Teddy", "⚽", "Ball", "🪁", "Kite"},
                    {"castle", "🏰", "Castle", "🐉", "Dragon", "🛡️", "Knight", "👑", "Crown"},
                    {"pond", "🪷", "Lilypad", "🐸", "Frog", "🦆", "Duck", "🦢", "Swan"},
                    {"beach", "🏖️", "Umbrella", "🐚", "Shell", "🦞", "Lobster", "🦀", "Crab"},
                    {"mountain", "⛰️", "Mountain", "🐐", "Goat", "🦅", "Eagle", "🐻", "Bear"},
                    {"sky", "☁️", "Cloud", "✈️", "Airplane", "🚁", "Helicopter", "🎈", "Balloon"},
                    {"cave", "🦇", "Bat", "🕷️", "Spider", "💎", "Gem", "🔦", "Flashlight"},
                    {"kitchen", "🥫", "Can", "🍎", "Apple", "🧀", "Cheese", "🥛", "Milk"},
                    {"school", "🏫", "School", "🎒", "Backpack", "📚", "Books", "🚌", "Schoolbus"},
                    {"circus", "🎪", "Tent", "🤡", "Clown", "🐘", "Elephant", "🦁", "Lion"},
                    {"restaurant", "🍽️", "Table", "🍔", "Burger", "🍕", "Pizza", "🌭", "Hotdog"},
                    {"hospital", "🏥", "Hospital", "🚑", "Ambulance", "💊", "Pill", "🩺", "Stethoscope"},
                    {"pirate", "🏴‍☠️", "Ship", "🦜", "Parrot", "⚓", "Anchor", "💰", "Treasure"},
                    {"construction", "🚧", "Barricade", "🚜", "Tractor", "🏗️", "Crane", "🧱", "Bricks"},
                    {"snow", "⛄", "Snowman", "🛷", "Sled", "❄️", "Snowflake", "🧣", "Scarf"},
                    {"halloween", "🎃", "Pumpkin", "👻", "Ghost", "🦇", "Bat", "🕸️", "Web"},
                    {"dino", "🌋", "Volcano", "🦖", "T-Rex", "🦕", "Brontosaurus", "🦴", "Bone"},
                    {"magic", "🔮", "Crystal Ball", "🧙", "Wizard", "🪄", "Wand", "📜", "Scroll"},
                    {"music", "🎹", "Piano", "🎸", "Guitar", "🥁", "Drum", "🎺", "Trumpet"},
                    {"sports", "🥅", "Goal", "⚽", "Soccer Ball", "🏆", "Trophy", "👟", "Cleat"}
                };
                
                int sIdx = (qNum - 1) % 30;
                String[] s = scenarios[sIdx];
                String scene = s[0], lEmoji = s[1], lName = s[2];
                String t1Emoji = s[3], t1Name = s[4];
                String t2Emoji = s[5], t2Name = s[6];
                String dEmoji = s[7], dName = s[8];
                
                boolean askBehind = r(0,1) == 0;
                String targetName = askBehind ? t1Name : t2Name;
                String targetPosition = askBehind ? "behind" : "in front of";
                
                String q = String.format("Can you tap the one that is %s the %s?", targetPosition, lName);
                
                String json = String.format(
                    "{\"scene\":\"%s\",\"landmark\":{\"emoji\":\"%s\",\"name\":\"%s\"},\"targetBehind\":{\"id\":\"tb\",\"emoji\":\"%s\",\"name\":\"%s\"},\"targetFront\":{\"id\":\"tf\",\"emoji\":\"%s\",\"name\":\"%s\"},\"distractor\":{\"id\":\"d\",\"emoji\":\"%s\",\"name\":\"%s\"},\"askBehind\":%b}",
                    scene, lEmoji, lName, t1Emoji, t1Name, t2Emoji, t2Name, dEmoji, dName, askBehind
                );
                
                String correctAns = askBehind ? "tb" : "tf";
                return buildT(correctAns, "tb", "tf", "d", q, "front_behind_game", json);
            }
            case 8: { // Inside vs Outside Visual Game
                String[][] themes = {
                    {"box", "📦", "Box", "🧸", "Teddy"},
                    {"basket", "🧺", "Basket", "🍎", "Apple"},
                    {"nest", "🪹", "Nest", "🥚", "Egg"},
                    {"bowl", "🥣", "Bowl", "🍒", "Cherry"},
                    {"jar", "🫙", "Jar", "🍪", "Cookie"},
                    {"pot", "🍯", "Pot", "🐝", "Bee"},
                    {"tent", "⛺", "Tent", "🎒", "Backpack"},
                    {"bathtub", "🛁", "Bathtub", "🦆", "Duck"},
                    {"toolbox", "🧰", "Toolbox", "🔨", "Hammer"},
                    {"house", "🏠", "House", "🐶", "Dog"},
                    {"castle", "🏰", "Castle", "👑", "Crown"},
                    {"purse", "👛", "Purse", "🪙", "Coin"},
                    {"shell", "🐚", "Shell", "🦀", "Crab"},
                    {"hat", "🎩", "Hat", "🐇", "Rabbit"},
                    {"boat", "⛵", "Boat", "⚓", "Anchor"},
                    {"car", "🚗", "Car", "🐻", "Bear"},
                    {"bus", "🚌", "Bus", "🎒", "Backpack"},
                    {"train", "🚂", "Train", "🧳", "Luggage"},
                    {"rocket", "🚀", "Rocket", "👽", "Alien"},
                    {"envelope", "✉️", "Envelope", "📜", "Letter"},
                    {"gift", "🎁", "Gift", "🎮", "Game"},
                    {"bag", "👜", "Bag", "🕶️", "Glasses"},
                    {"briefcase", "💼", "Briefcase", "📄", "Paper"},
                    {"cabinet", "🗄️", "Cabinet", "📁", "Folder"},
                    {"cup", "☕", "Cup", "🧊", "Ice"},
                    {"cart", "🛒", "Cart", "🍉", "Melon"},
                    {"pouch", "👝", "Pouch", "🔑", "Key"},
                    {"drawer", "🗃️", "Drawer", "🖊️", "Pen"},
                    {"shoe", "👞", "Shoe", "🧦", "Sock"},
                    {"pan", "🍳", "Pan", "🥚", "Egg"}
                };
                
                int sIdx = (qNum - 1) % 30;
                String[] t = themes[sIdx];
                String bType = t[0], bEmoji = t[1], bName = t[2];
                String iEmoji = t[3], iName = t[4];
                
                boolean askInside = r(0,1) == 0;
                String targetPos = askInside ? "inside" : "outside";
                
                String q = String.format("Tap all the %ss that are %s the %s!", iName, targetPos, bName);
                
                int numTarget = 3;
                int numDistractor = 2;
                int numInside = askInside ? numTarget : numDistractor;
                int numOutside = 5 - numInside;
                
                String json = String.format(
                    "{\"boundaryType\":\"%s\",\"boundaryEmoji\":\"%s\",\"boundaryName\":\"%s\",\"itemEmoji\":\"%s\",\"itemName\":\"%s\",\"askInside\":%b,\"numInside\":%d,\"numOutside\":%d}",
                    bType, bEmoji, bName, iEmoji, iName, askInside, numInside, numOutside
                );
                
                return buildT("NONE", "A", "B", "C", q, "inside_outside_game", json);
            }
            default: return buildN(1, 1, 5, "Error");
        }
    }

    private String[] genLevel5(int topic, int qNum) {
        switch(topic) {
            case 1: {
                String[][] themes = {
                    {"fish", "🐟", "Fish"},
                    {"cupcake", "🧁", "Cupcakes"},
                    {"bug", "🐛", "Bugs"},
                    {"apple", "🍎", "Apples"},
                    {"cookie", "🍪", "Cookies"},
                    {"carrot", "🥕", "Carrots"},
                    {"bone", "🦴", "Bones"},
                    {"cheese", "🧀", "Cheese Wedges"},
                    {"donut", "🍩", "Donuts"},
                    {"strawberry", "🍓", "Strawberries"},
                    {"pizza", "🍕", "Pizza Slices"},
                    {"burger", "🍔", "Burgers"},
                    {"candy", "🍬", "Candies"},
                    {"icecream", "🍦", "Ice Creams"},
                    {"cherry", "🍒", "Cherries"},
                    {"peanut", "🥜", "Peanuts"},
                    {"watermelon", "🍉", "Watermelon Slices"},
                    {"hotdog", "🌭", "Hotdogs"},
                    {"taco", "🌮", "Tacos"},
                    {"frenchfry", "🍟", "French Fries"},
                    {"popcorn", "🍿", "Popcorns"},
                    {"chocolate", "🍫", "Chocolates"},
                    {"croissant", "🥐", "Croissants"},
                    {"pancake", "🥞", "Pancakes"},
                    {"pretzel", "🥨", "Pretzels"},
                    {"pie", "🥧", "Pies"},
                    {"lollipop", "🍭", "Lollipops"},
                    {"grape", "🍇", "Grapes"},
                    {"banana", "🍌", "Bananas"},
                    {"pineapple", "🍍", "Pineapples"}
                };
                int idx = (qNum - 1) % 30;
                String[] t = themes[idx];
                int leftCount = r(1, 9);
                int rightCount;
                do { rightCount = r(1, 9); } while (leftCount == rightCount);
                
                boolean askSymbol = qNum > 5;
                String q = askSymbol 
                    ? "Which symbol makes the Gator eat the most " + t[2] + "?"
                    : "The Gator is super hungry! Which group of " + t[2] + " will he want to eat?";
                
                String ans = leftCount > rightCount ? "A" : "B";
                String json = String.format("{\"leftCount\":%d,\"rightCount\":%d,\"itemEmoji\":\"%s\",\"itemName\":\"%s\",\"askSymbol\":%b}", leftCount, rightCount, t[1], t[2], askSymbol);
                return buildT(ans, "A", "B", "NONE", q, "greedy_gator_game", json);
            }
            case 2: {
                String[][] themes = {
                    {"sugar_cubes", "🧊", "Sugar Cubes", "🐜", "Tiny Ant Team", "Ants"},
                    {"gears", "⚙️", "Gears", "🤖", "Mini Robot Team", "Robots"},
                    {"pollen", "🌼", "Pollen Drops", "🐝", "Baby Bee Team", "Bees"},
                    {"cheese_crumbs", "🧀", "Cheese Crumbs", "🐭", "Little Mouse Team", "Mice"}
                };
                int idx = (qNum - 1) % 4;
                String[] t = themes[idx];
                int leftCount = r(1, 9);
                int rightCount;
                do { rightCount = r(1, 9); } while (leftCount == rightCount);
                
                boolean askSymbol = qNum > 5;
                String q = askSymbol 
                    ? "Which symbol makes the " + t[5] + " carry the lighter load?"
                    : "The " + t[4] + " wants a light load! Which group of " + t[2] + " should they carry?";
                
                String ans = leftCount < rightCount ? "A" : "B";
                String json = String.format("{\"leftCount\":%d,\"rightCount\":%d,\"itemEmoji\":\"%s\",\"itemName\":\"%s\",\"teamEmoji\":\"%s\",\"teamName\":\"%s\",\"askSymbol\":%b}", leftCount, rightCount, t[1], t[2], t[3], t[4], askSymbol);
                return buildT(ans, "A", "B", "NONE", q, "tiny_team_game", json);
            }
            case 3: {
                String[][] themes = {
                    {"stars", "⭐", "Shining Stars"}, 
                    {"gems", "💎", "Shiny Gems"}, 
                    {"butterflies", "🦋", "Beautiful Butterflies"}, 
                    {"balloons", "🎈", "Party Balloons"}
                };
                int idx = (qNum - 1) % 4;
                String[] t = themes[idx];
                
                boolean isEqual = r(0,1) == 0;
                int leftCount = r(2, 9);
                int rightCount = isEqual ? leftCount : (leftCount + (r(0,1) == 0 ? 1 : -1));
                if (rightCount < 1) rightCount = 1;
                if (!isEqual && rightCount == leftCount) rightCount++;
                
                String q = "Look at these groups! Are they perfect Twin Sets? Tap the correct sign to link them!";
                String ans = isEqual ? "EQUAL" : "UNEQUAL";
                String json = String.format("{\"leftCount\":%d,\"rightCount\":%d,\"itemEmoji\":\"%s\",\"itemName\":\"%s\",\"isEqual\":%b}", leftCount, rightCount, t[1], t[2], isEqual);
                return buildT(ans, "EQUAL", "UNEQUAL", "NONE", q, "twin_sets_game", json);
            }
            case 4: {
                String[][] themes = {
                    {"rabbits_carrots", "🐰", "Rabbits", "🥕", "Carrots"}, 
                    {"dogs_bones", "🐶", "Dogs", "🦴", "Bones"}, 
                    {"monkeys_bananas", "🐒", "Monkeys", "🍌", "Bananas"}
                };
                int idx = (qNum - 1) % 3;
                String[] t = themes[idx];
                
                boolean leftHasMore = r(0,1) == 0;
                int baseCount = r(2, 6);
                int leftCount = leftHasMore ? baseCount + 1 : baseCount;
                int rightCount = leftHasMore ? baseCount : baseCount + 1;
                
                String q = "Let's feed the " + t[2] + "! Can you draw a line from each " + t[2].substring(0, t[2].length() - 1) + " to a " + t[4].substring(0, t[4].length() - 1) + "?";
                String ans = leftHasMore ? "LEFT" : "RIGHT";
                String json = String.format("{\"leftCount\":%d,\"rightCount\":%d,\"leftEmoji\":\"%s\",\"leftName\":\"%s\",\"rightEmoji\":\"%s\",\"rightName\":\"%s\"}", leftCount, rightCount, t[1], t[2], t[3], t[4]);
                return buildT(ans, "LEFT", "RIGHT", "NONE", q, "finding_leftovers_game", json);
            }
            case 5: {
                int num1 = r(1, 10);
                int num2;
                do { num2 = r(1, 10); } while (num1 == num2);
                
                boolean isTrueFalseMode = r(0,1) == 0;
                boolean askMore = r(0,1) == 0;
                
                String q;
                String ans;
                String modeStr;
                
                if (isTrueFalseMode) {
                    modeStr = "true_false";
                    if (askMore) {
                        q = "Is " + num1 + " more than " + num2 + "?";
                        ans = (num1 > num2) ? "YES" : "NO";
                    } else {
                        q = "Is " + num1 + " less than " + num2 + "?";
                        ans = (num1 < num2) ? "YES" : "NO";
                    }
                    String json = String.format("{\"num1\":%d,\"num2\":%d,\"mode\":\"%s\"}", num1, num2, modeStr);
                    return buildT(ans, "YES", "NO", "NONE", q, "number_comparison_game", json);
                } else {
                    modeStr = "selection";
                    if (askMore) {
                        q = "Which number is larger?";
                        ans = (num1 > num2) ? "LEFT" : "RIGHT";
                    } else {
                        q = "Which number is smaller?";
                        ans = (num1 < num2) ? "LEFT" : "RIGHT";
                    }
                    String json = String.format("{\"num1\":%d,\"num2\":%d,\"mode\":\"%s\"}", num1, num2, modeStr);
                    return buildT(ans, "LEFT", "RIGHT", "NONE", q, "number_comparison_game", json);
                }
            }
            case 6: {
                String[][] themes = {
                    {"monkeys_bananas", "🐒", "Monkeys", "🍌", "Bananas"}, 
                    {"robots_blocks", "🤖", "Robots", "🧱", "Blocks"}, 
                    {"pigs_apples", "🐷", "Pigs", "🍎", "Apples"},
                    {"squirrels_acorns", "🐿️", "Squirrels", "🌰", "Acorns"}
                };
                int idx = (qNum - 1) % 4;
                String[] t = themes[idx];
                
                int leftCount = r(1, 10);
                int rightCount;
                do { rightCount = r(1, 10); } while (leftCount == rightCount);
                
                String q = "Oh no! The " + t[2] + " are upset because their " + t[4] + " are not fair. Can you fix the piles to make them EQUAL?";
                String json = String.format("{\"leftCount\":%d,\"rightCount\":%d,\"itemEmoji\":\"%s\",\"itemName\":\"%s\",\"receiverEmoji\":\"%s\",\"receiverName\":\"%s\"}", leftCount, rightCount, t[3], t[4], t[1], t[2]);
                return buildT("BALANCED", "BALANCED", "UNBALANCED", "NONE", q, "fairness_adjuster_game", json);
            }
            case 7: {
                String[][] themes = {
                    {"candy_jars", "🍬", "Candies"}, 
                    {"jellybean_jars", "🫘", "Jellybeans"}, 
                    {"gumball_jars", "🔵", "Gumballs"}
                };
                int idx = (qNum - 1) % 3;
                String[] t = themes[idx];
                
                int smallCount = r(8, 20);
                int largeCount = r(smallCount * 3, smallCount * 4);
                
                int leftCount, rightCount;
                if (r(0,1) == 0) {
                    leftCount = largeCount;
                    rightCount = smallCount;
                } else {
                    leftCount = smallCount;
                    rightCount = largeCount;
                }
                
                String q = "Look fast! The candy shop is closing! Which jar has MORE " + t[2] + "? Don't count, just guess!";
                String ans = leftCount > rightCount ? "LEFT" : "RIGHT";
                String json = String.format("{\"leftCount\":%d,\"rightCount\":%d,\"itemEmoji\":\"%s\"}", leftCount, rightCount, t[1]);
                
                return buildT(ans, "LEFT", "RIGHT", "NONE", q, "estimation_blitz_game", json);
            }
            case 8: {
                int count = r(1, 10);
                String[] emojis = {"🔴", "⭐", "💎", "🍎", "☀️", "🌙"};
                String itemEmoji = emojis[r(0, emojis.length - 1)];
                
                int wrong1, wrong2;
                do { wrong1 = r(1, 10); } while (wrong1 == count);
                do { wrong2 = r(1, 10); } while (wrong2 == count || wrong2 == wrong1);
                
                String[] options = new String[]{String.valueOf(count), String.valueOf(wrong1), String.valueOf(wrong2)};
                for (int i = options.length - 1; i > 0; i--) {
                    int j = r(0, i);
                    String temp = options[i];
                    options[i] = options[j];
                    options[j] = temp;
                }
                
                String q = "Look at our magic grid! How many dots can you count inside it? Tap the matching card!";
                String json = String.format("{\"count\":%d,\"itemEmoji\":\"%s\"}", count, itemEmoji);
                
                return buildT(String.valueOf(count), options[0], options[1], options[2], q, "ten_frame_game", json);
            }
            default: return buildN(1, 1, 5, "Error");
        }
    }

    private String[] genLevel6(int topic, int qNum) {
        switch(topic) {
            case 1: {
                String[][] themes = {
                    {"crystals", "💎", "Energy Crystals"}, 
                    {"sticks", "🪵", "Wooden Sticks"}, 
                    {"beams", "🏗️", "Steel Beams"},
                    {"wands", "🪄", "Magic Wands"},
                    {"orbs", "🔮", "Energy Orbs"}
                };
                int idx = (qNum - 1) % themes.length;
                String[] t = themes[idx];
                
                String q = "Let's build a Base-10 Power Block! Drop " + t[2] + " until you have 10!";
                String json = String.format("{\"themeId\":\"%s\",\"itemEmoji\":\"%s\",\"itemName\":\"%s\"}", t[0], t[1], t[2]);
                
                return buildT("10", String.valueOf(qNum + 10), String.valueOf(qNum + 40), String.valueOf(qNum + 70), q, "base_10_anchor_game", json);
            }
            case 2: {
                String q = "Agent 11 and Agent 12 are wearing disguises! Can you look inside their bags to see what they are hiding?";
                String json = "{\"target1\":11,\"target2\":12}";
                return buildT("11", "12", "13", "14", q, "number_castle_game", json);
            }
            case 3: {
                int target = r(13,14);
                String q = "Let's build Tower " + target + "! First, load the foundation with a full deck of 10!";
                String json = "{\"target\":" + target + "}";
                return buildT(String.valueOf(target), String.valueOf(target + 10), String.valueOf(target + 20), "19", q, "teen_tower_game", json);
            }
            case 4: {
                String[] bees = {"Benny", "Betty", "Buzz", "Barry", "Bea", "Bumble", "Barnaby", "Bella", "Buster", "Bailey", "Baxter", "Bonnie", "Bobby", "Brody", "Bree"};
                int target = 15 + ((qNum - 1) % 2);
                String beeName = bees[(qNum - 1) % 15];
                String q = "Let's help Worker Bee " + beeName + " store " + target + " drops of honey! First, fill the main hive frame with 10 drops!";
                String json = "{\"target\":" + target + ",\"beeName\":\"" + beeName + "\"}";
                return buildT(String.valueOf(target), String.valueOf(target + 10), String.valueOf(target + 20), "19", q, "honeybee_hive_game", json);
            }
            case 5: {
                String[] missions = {"Apollo", "Artemis", "Voyager", "Cassini", "Hubble", "Galileo", "Kepler", "Pioneer", "Juno", "Orion"};
                int target = 17 + ((qNum - 1) % 3);
                String missionName = missions[((qNum - 1) / 3) % 10];
                String q = "Mission Control needs " + target + " fuel cells to launch the " + missionName + " rocket! First, load the Main Tank with 10 cells!";
                String json = "{\"target\":" + target + ",\"missionName\":\"" + missionName + "\"}";
                return buildT(String.valueOf(target), String.valueOf(target + 10), String.valueOf(target + 20), "19", q, "astromaze_rocket_game", json);
            }
            case 6: {
                String[] potions = {"Dragonfire", "Stardust", "Moondrop", "Elven-tears", "Sun-spark", "Void-essence", "Frost-glint", "Shadow-mist", "Fairy-dust", "Phoenix-ash"};
                int target = 12 + ((qNum - 1) % 3);
                String potionName = potions[((qNum - 1) / 3) % 10];
                String q = "Alchemist! We need to break down the magic matrix of " + target + " into its base components for the " + potionName + " potion! Cast your separation spell!";
                String json = "{\"target\":" + target + ",\"potionName\":\"" + potionName + "\"}";
                return buildT(String.valueOf(target), String.valueOf(target + 10), String.valueOf(target + 20), "19", q, "teen_breakdown_game", json);
            }
            case 7: {
                String[] hats = {"Crimson", "Cobalt", "Violet", "Emerald", "Onyx"};
                int target = ((qNum - 1) % 6) + 1;
                String hatColor = hats[((qNum - 1) / 6) % 5];
                String q = "Quick! The " + hatColor + " hat revealed a pattern! How many dots did you see?";
                
                int w1 = target == 1 ? 2 : target - 1;
                int w2 = target == 6 ? 5 : target + 1;
                if (w1 == w2) w2 = (w1 + 1) % 6 + 1;

                String json = "{\"target\":" + target + ",\"hatColor\":\"" + hatColor + "\"}";
                return buildT(String.valueOf(target), String.valueOf(w1), String.valueOf(w2), "10", q, "dice_flash_game", json);
            }
            case 8: {
                int[][] dominos = {{1,2}, {2,2}, {3,1}, {4,1}, {3,2}, {3,3}, {4,2}, {4,3}, {5,3}, {5,4}};
                String[] sectors = {"Alpha", "Beta", "Gamma"};
                int index = (qNum - 1) % 10;
                int[] domino = dominos[index];
                int left = domino[0];
                int right = domino[1];
                int target = left + right;
                String sector = sectors[((qNum - 1) / 10) % 3];
                
                String q = "Power levels detected in Sector " + sector + "! What was the total matrix weight on that domino card?";
                
                int w1 = target == 3 ? 4 : target - 1;
                int w2 = target == 9 ? 8 : target + 1;
                if (w1 == w2) w2 = target + 2;

                String json = "{\"target\":" + target + ",\"left\":" + left + ",\"right\":" + right + ",\"sector\":\"" + sector + "\"}";
                return buildT(String.valueOf(target), String.valueOf(w1), String.valueOf(w2), "10", q, "dominos_flash_game", json);
            }
            default: return buildN(1, 1, 10, "Error");
        }
    }

    private String[] genLevel7(int topic, int qNum) {
        switch(topic) {
            case 1: {
                String[] colors = {"Crimson", "Midnight", "Forest", "Iron", "Brass"};
                String[] destinations = {"Timber Peak", "Rocky Valley", "Snowcap City", "Crystal Lake", "Echo Canyon", "Sunset Ridge"};
                
                int targetDecade = (((qNum - 1) % 8) + 2) * 10;
                String color = colors[((qNum - 1) / 8) % 5];
                String destination = destinations[qNum % 6];
                
                String q = "Look! There is one lone log left on the platform. Tap it to load the " + color + " Engine heading to " + destination + "!";
                String json = "{\"color\":\"" + color + "\",\"destination\":\"" + destination + "\",\"target\":" + targetDecade + "}";
                
                return buildT(String.valueOf(targetDecade), String.valueOf(targetDecade - 10), String.valueOf(targetDecade + 10), "5", q, "train_station_game", json);
            }
            case 2: { 
                int squads = (((qNum - 1) % 7) + 3); 
                int target = squads * 10;
                String[] colors = {"Blue", "Red", "Green", "Purple", "Gold"};
                String color = colors[(qNum - 1) % 5];
                String q = "Company, march! Send a squad of 10 to the first bridge gate!";
                String json = "{\"color\":\"" + color + "\",\"target\":" + target + "}";
                return buildT(String.valueOf(target), String.valueOf(target - 10), String.valueOf(target + 10), "20", q, "toy_soldier_march", json);
            }
            case 3: { 
                String q = "To warp across the galaxy, our ship needs 100 star cells! Let's load them in packs of 10!";
                String json = "{\"target\":100}";
                return buildT("100", "50", "90", "110", q, "cosmic_star_bridge", json);
            }
            case 4: { 
                int startRow = r(0, 3);
                int startCol = r(1, 10);
                int targetRow = startRow + r(3, 5); 
                int targetCol = r(1, 10);
                if (targetCol == startCol) {
                    targetCol = (startCol % 10) + 1;
                }
                
                int start = startRow * 10 + startCol;
                int target = targetRow * 10 + targetCol;
                
                String q = "Runner! The portal is open at coordinate " + target + ". Use your Jump Thrusters to reach it in the fewest moves possible!";
                String json = "{\"start\":" + start + ",\"target\":" + target + "}";
                return buildT(String.valueOf(target), String.valueOf(target - 1), String.valueOf(target + 1), "10", q, "grid_runner", json);
            }
            case 5: { 
                int n = r(1, 80); 
                int correct = n + 1;
                int wrong1 = n - 1 < 0 ? n + 10 : n - 1; 
                int wrong2 = n + 10;
                int wrong3 = correct + 10;
                
                String q = "Oh no! The bridge is broken! The baby squirrel is stuck on stone " + n + ". Who is " + n + "'s Next Neighbor? Tap the magic number to build the next stone!";
                String json = "{\"squirrelPos\":" + n + ",\"target\":" + correct + ",\"nextPos\":" + (n + 2) + "}";
                return buildT(String.valueOf(correct), String.valueOf(wrong1), String.valueOf(wrong2), String.valueOf(wrong3), q, "forest_path_rescue", json);
            }
            case 6: { 
                int target = r(5, 90);
                int correct = target - 1;
                int wrong1 = target + 1; 
                int wrong2 = (target % 10) * 10 + (target / 10); 
                if (wrong2 == correct || wrong2 == wrong1) wrong2 = target - 10;
                if (wrong2 <= 0) wrong2 = target + 10;
                int wrong3 = wrong2 + 2;
                
                String q = "Systems check! The ignition lock is stuck at " + target + ". Quick, enter " + target + "'s Prior Neighbor to unlock the main fuel valves!";
                String json = "{\"target\":" + target + "}";
                return buildT(String.valueOf(correct), String.valueOf(wrong1), String.valueOf(wrong2), String.valueOf(wrong3), q, "retro_rocket_game", json);
            }
            case 7: { 
                int prev = r(1, 90);
                int target = prev + 1;
                int next = prev + 2;
                
                int correct = target;
                int wrong1 = prev - 1; 
                if (wrong1 <= 0) wrong1 = next + 10;
                int wrong2 = next + 1; 
                int wrong3 = (target % 10) * 10 + (target / 10); 
                if (wrong3 == correct || wrong3 == wrong1 || wrong3 == wrong2) wrong3 = target + 10;
                
                String q = "Runner! The cosmic energy path has a missing gap! We have " + prev + " on the left and " + next + " on the right. What magic number belongs between them to complete the bridge?";
                String json = "{\"prev\":" + prev + ",\"next\":" + next + ",\"target\":" + target + "}";
                return buildT(String.valueOf(correct), String.valueOf(wrong1), String.valueOf(wrong2), String.valueOf(wrong3), q, "cosmic_bridge_repair", json);
            }
            case 8: { 
                int target = r(6, 20);
                String q = "We need to track our firewood bundles before the sun sets! Tap the screen to draw a tally mark for each log!";
                String json = "{\"target\":" + target + "}";
                return buildT("NONE", "A", "B", "C", q, "island_castaway_game", json);
            }
            default: return buildN(1, 1, 10, "Error");
        }
    }

    private String[] genLevel8(int topic, int qNum) {
        String[] shapes3d = {"SPHERE", "CUBE", "CYLINDER", "CONE", "PYRAMID", "PRISM"};
        String[] types = {"FLAT", "SOLID", "LINE", "CURVE", "POINT"};
        String[] faces = {"SQUARE", "CIRCLE", "TRIANGLE", "RECTANGLE", "STAR", "OVAL"};
        switch(topic) {
            case 1: { 
                String[] colors = {"red", "blue", "green", "purple", "orange"};
                String[] colorHexes = {"#ef4444", "#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"};
                int sIdx = r(0, 4);
                int cIdx = r(0, 4);
                if (sIdx == cIdx) cIdx = (cIdx + 1) % 5;
                
                String sphereColor = colorHexes[sIdx];
                String cubeColor = colorHexes[cIdx];
                String spherePos = r(0, 1) == 0 ? "left" : "right";
                
                String[] correctShapes = {"sphere", "wheel", "ring", "ball", "marble"};
                String[] wrongShapes = {"cube", "pyramid", "prism", "box", "die"};
                String correctShape = correctShapes[r(0, 4)];
                String wrongShape = wrongShapes[r(0, 4)];
                
                String[] voiceovers = {
                    "Astronaut! We need to activate the docking bridge switch at the bottom of the ramp. Pick the magic shape that can roll!",
                    "Explorer! The bridge is locked. Test the shapes on the gravity ramp and find the one that rolls smoothly!",
                    "Captain! Which shape will slide smoothly down the ramp to hit the button? Drag it to the drop zone!"
                };
                String q = voiceovers[r(0, 2)];
                
                String json = "{\"sphereColor\":\"" + sphereColor + "\",\"cubeColor\":\"" + cubeColor + "\",\"spherePos\":\"" + spherePos + "\",\"correctShape\":\"" + correctShape + "\",\"wrongShape\":\"" + wrongShape + "\"}";
                return buildT("NONE", "A", "B", "C", q, "cosmic_bowling_game", json);
            }
            case 2: { 
                int imageIdx = ((qNum - 1) % 10) + 1;
                int hueIdx = (qNum - 1) / 3;
                int hueRotate = hueIdx * 40;
                
                String cartonImage = "/images/cartons/carton" + imageIdx + ".png";
                String sphereImage = "/images/cartons/sphere.png";
                
                boolean layoutReverse = r(0, 1) == 1;
                
                String[] voiceovers = {
                    "Architect! We need to construct a stable communication tower. Pick the shape that stacks safely!",
                    "Builder! Help us build a tall tower without it collapsing. Which shape stacks best?",
                    "Engineer! The spaceship is waiting. Stack three stable blocks on the foundation!"
                };
                String q = voiceovers[r(0, 2)];
                
                String json = "{\"cartonImage\":\"" + cartonImage + "\",\"sphereImage\":\"" + sphereImage + "\",\"layoutReverse\":" + layoutReverse + ",\"hueRotate\":" + hueRotate + "}";
                return buildT("NONE", "A", "B", "C", q, "cosmic_tower_builder", json);
            }
            case 3: {
                String[] brands = {"Cherry Fizz", "Grape Galaxy", "Lemon Nova", "Cosmic Cola", "Star Spritz", "Meteor Melon", "Orbit Orange", "Lunar Lime", "Astro Berry", "Nebula Nectar"};
                String[] colors = {"#ef4444", "#8b5cf6", "#eab308", "#1f2937", "#ec4899", "#f43f5e", "#f97316", "#84cc16", "#3b82f6", "#d946ef"};
                String brand = brands[(qNum - 1) % 10];
                String color = colors[(qNum - 1) % 10];
                String q = "Alchemist! We have a delivery of smooth storage cylinders. We need to stack them in the elevator and roll them down the ramp. Master both moves!";
                String json = "{\"brand\":\"" + brand + "\",\"color\":\"" + color + "\"}";
                return buildT("NONE", "A", "B", "C", q, "soda_can_factory", json);
            }
            case 4: return buildS("CONE", shapes3d, "Party Cone");
            case 5: return buildS(types[r(0,1)], new String[]{"FLAT", "SOLID", "LINE", "POINT", "CURVE"}, "Flat vs Solid?");
            case 6: return buildN(r(0,8), 0, 10, "Corner Counting");
            case 7: return buildS(faces[r(0,2)], new String[]{"SQUARE", "CIRCLE", "TRIANGLE", "RECTANGLE", "STAR", "OVAL"}, "Face Matching");
            case 8: return buildS("SHAPE", new String[]{"SHAPE", "BROKEN", "FLAT", "MESSY", "OPEN", "LINE"}, "Shape Building");
            default: return buildN(1, 1, 5, "Error");
        }
    }

    private String[] genLevel9(int topic) {
        switch(topic) {
            case 1: { int a = r(1,3), b = r(1,2); return buildN(a+b, 1, 6, "Join " + a + " and " + b); }
            case 2: return buildS("PLUS", new String[]{"PLUS", "MINUS", "EQUAL", "TIMES", "DIVIDE"}, "What sign is this?");
            case 3: return buildS("EQUAL", new String[]{"EQUAL", "PLUS", "MINUS", "TIMES", "DIVIDE"}, "What sign is this?");
            case 4: { int a = r(1,8); return buildN(a+1, 1, 10, a + " + 1 = ?"); }
            case 5: { int a = r(1,7); return buildN(a+2, 1, 10, a + " + 2 = ?"); }
            case 6: { int a = r(1,2), b = r(1,2); return buildN(a+b, 1, 5, "Picture Math: " + a + " + " + b); }
            case 7: { int a = r(1,2), b = r(1,2); return buildN(a+b, 1, 5, "Story: " + a + " birds, " + b + " more arrive."); }
            case 8: { int a = r(1,3), b = r(1,2); return buildN(a+b, 1, 5, "Mental Math: " + a + " + " + b); }
            default: return buildN(1, 1, 5, "Error");
        }
    }

    private String[] genLevel10(int topic) {
        switch(topic) {
            case 1: { int a = r(3,5), b = r(1,2); return buildN(a-b, 1, 5, "Take away " + b + " from " + a); }
            case 2: return buildS("MINUS", new String[]{"MINUS", "PLUS", "EQUAL", "TIMES", "DIVIDE"}, "What sign is this?");
            case 3: { int a = r(3,5), b = r(1,2); return buildN(a-b, 1, 5, "Pop " + b + " bubbles out of " + a); }
            case 4: { int a = r(2,10); return buildN(a-1, 1, 10, a + " - 1 = ?"); }
            case 5: { int a = r(3,10); return buildN(a-2, 1, 10, a + " - 2 = ?"); }
            case 6: { int a = r(1,5); return buildN(a, 1, 6, a + " - 0 = ?"); }
            case 7: { int a = r(3,5), b = r(1,2); return buildN(a-b, 1, 5, "Action Story: " + a + " apples, eat " + b); }
            case 8: { int a = r(2,5), b = r(1,a-1); return buildN(a-b, 1, 5, "Mental Math: " + a + " - " + b); }
            default: return buildN(1, 1, 5, "Error");
        }
    }

    private String[] genLevel11(int topic) {
        switch(topic) {
            case 1: { int a = r(1,9); return buildN(10-a, 1, 9, "10-Bond: 10 - " + a + " = ?"); }
            case 2: { int a = r(1,4), b = r(1,4); return buildN(a+b, 2, 8, a + "+" + b + " is the same as " + b + "+?"); }
            case 3: { int a = r(1,5); return buildN(a+a, 2, 10, "Double Trouble: " + a + " + " + a); }
            case 4: { 
                if(r(0,1)==0) { int a = r(1,5), b = r(1,5); return buildN(a+b, 2, 10, a + " + " + b); }
                else { int a = r(6,10), b = r(1,5); return buildN(a-b, 1, 9, a + " - " + b); }
            }
            case 5: return buildS("RED", new String[]{"RED", "BLUE", "GREEN"}, "AB Pattern: RED, BLUE, RED, ?");
            case 6: return buildS("SQUARE", new String[]{"SQUARE", "CIRCLE", "STAR"}, "AABB: SQ, SQ, CIRC, CIRC, SQ, ?");
            case 7: return buildN(r(1,5), 1, 5, "Missing Pattern Piece");
            case 8: return buildN(r(1,10), 1, 10, "Master Challenge!");
            default: return buildN(1, 1, 5, "Error");
        }
    }
}
