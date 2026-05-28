import re

with open('D:\\Mindmetric\\backend\\src\\main\\java\\com\\mindmetric\\api\\numbercomet\\DataSeeder.java', 'r', encoding='utf-8') as f:
    code = f.read()

replacement = """            case 1: { // Big vs Small Real-World
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
                String json = String.format(java.util.Locale.US, "{\\"item1\\":\\"%s\\",\\"item2\\":\\"%s\\",\\"name1\\":\\"%s\\",\\"name2\\":\\"%s\\",\\"leftBig\\":%b,\\"askBig\\":%b}", item1, item2, name1, name2, leftBig, askBig);
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
                String json = String.format("{\\"item1\\":\\"%s\\",\\"item2\\":\\"%s\\",\\"leftTall\\":%b,\\"askTall\\":%b,\\"type\\":\\"%s\\"}", i1, i2, leftTall, askTall, p[2]);
                return buildT(ans, "A", "B", "NONE", q, "comparison_tallShortRealWorld", json);
            }
            case 3: { // Long vs Short Real-World (Bridge Builder)
                String[][] pairs = {
                    {"🚂", "🛹", "vehicles", "Train", "Skateboard"},
                    {"🥒", "🌶️", "food", "Cucumber", "Chili Pepper"},
                    {"🧹", "🖌️", "tools", "Broom", "Paintbrush"},
                    {"🐍", "🐛", "animals", "Snake", "Caterpillar"},
                    {"🥖", "🥐", "food", "Baguette", "Croissant"},
                    {"📏", "📎", "tools", "Ruler", "Paperclip"},
                    {"🛶", "🛟", "objects", "Canoe", "Life Ring"},
                    {"🗡️", "🔪", "objects", "Sword", "Knife"},
                    {"🧣", "🎀", "clothes", "Scarf", "Ribbon"},
                    {"🪢", "🧵", "objects", "Rope", "Thread"},
                    {"🚌", "🚗", "vehicles", "Bus", "Car"},
                    {"🎸", "🪈", "instruments", "Guitar", "Flute"},
                    {"🐊", "🐸", "animals", "Crocodile", "Frog"},
                    {"🛶", "🥏", "objects", "Canoe", "Frisbee"},
                    {"🛹", "🛼", "vehicles", "Skateboard", "Rollerskates"},
                    {"🦯", "🥢", "tools", "Cane", "Chopsticks"},
                    {"🥖", "🌭", "food", "Baguette", "Hotdog"},
                    {"🐉", "🦎", "animals", "Dragon", "Lizard"},
                    {"🚊", "🚕", "vehicles", "Tram", "Taxi"},
                    {"🛶", "⛵", "vehicles", "Canoe", "Sailboat"},
                    {"🏏", "🏓", "sports", "Cricket Bat", "Ping Pong Paddle"},
                    {"🎻", "🪇", "instruments", "Violin", "Maracas"},
                    {"🎿", "⛸️", "sports", "Skis", "Ice Skate"},
                    {"📏", "✏️", "tools", "Ruler", "Pencil"},
                    {"🪱", "🐌", "animals", "Earthworm", "Snail"},
                    {"🛋️", "🪑", "furniture", "Sofa", "Chair"},
                    {"🦦", "🐹", "animals", "Otter", "Hamster"},
                    {"🚎", "🚙", "vehicles", "Trolley", "SUV"},
                    {"🥖", "🥟", "food", "Baguette", "Dumpling"},
                    {"⛴️", "🚤", "vehicles", "Ferry", "Speedboat"}
                };
                int idx = (qNum - 1) % pairs.length;
                String[] p = pairs[idx];
                boolean leftLong = r(0,1) == 0;
                boolean askLong = r(0,1) == 0;
                String q = askLong ? "Which object is LONGER to help build our bridge?" : "Which object is SHORTER to help build our bridge?";
                String ans = (leftLong == askLong) ? "A" : "B";
                String i1 = leftLong ? p[0] : p[1];
                String i2 = leftLong ? p[1] : p[0];
                String json = String.format("{\\"item1\\":\\"%s\\",\\"item2\\":\\"%s\\",\\"leftLong\\":%b,\\"askLong\\":%b,\\"type\\":\\"%s\\"}", i1, i2, leftLong, askLong, p[2]);
                return buildT(ans, "A", "B", "NONE", q, "comparison_longShortRealWorld", json);
            }"""

pattern = re.compile(r'(case 1: \{.*?)(case 4: \{)', re.DOTALL)
new_code = pattern.sub(replacement + '\\n            \\2', code)

with open('D:\\Mindmetric\\backend\\src\\main\\java\\com\\mindmetric\\api\\numbercomet\\DataSeeder.java', 'w', encoding='utf-8') as f:
    f.write(new_code)
print('Done!')
