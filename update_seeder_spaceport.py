import re

with open('D:\\Mindmetric\\backend\\src\\main\\java\\com\\mindmetric\\api\\numbercomet\\DataSeeder.java', 'r', encoding='utf-8') as f:
    code = f.read()

replacement = """            case 5: { // Delivery Space-Port
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
                
                String json = String.format("{\\"items\\":[{\\"id\\":\\"%s\\",\\"name\\":\\"%s\\",\\"emoji\\":\\"%s\\",\\"isRect\\":%b},{\\"id\\":\\"%s\\",\\"name\\":\\"%s\\",\\"emoji\\":\\"%s\\",\\"isRect\\":%b},{\\"id\\":\\"%s\\",\\"name\\":\\"%s\\",\\"emoji\\":\\"%s\\",\\"isRect\\":%b}]}",
                    options.get(0)[0], options.get(0)[1], options.get(0)[2], options.get(0)[0].equals(rect[0]),
                    options.get(1)[0], options.get(1)[1], options.get(1)[2], options.get(1)[0].equals(rect[0]),
                    options.get(2)[0], options.get(2)[1], options.get(2)[2], options.get(2)[0].equals(rect[0]));
                    
                String q = "Luna needs the LONG boxes where two sides are stretched out extra far! Can you tap the Long Rectangles?";
                return buildT(ans, "A", "B", "C", q, "deliverySpacePort", json);
            }"""

# We want to replace case 5: { // More vs Less ... } up to case 6:
pattern = re.compile(r'(case 5: \{.*?)(case 6: \{)', re.DOTALL)
new_code = pattern.sub(replacement + '\n            \\2', code)

with open('D:\\Mindmetric\\backend\\src\\main\\java\\com\\mindmetric\\api\\numbercomet\\DataSeeder.java', 'w', encoding='utf-8') as f:
    f.write(new_code)
print('Done updating DataSeeder.java!')
