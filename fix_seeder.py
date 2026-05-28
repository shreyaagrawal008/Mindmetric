import re

with open('D:\\Mindmetric\\backend\\src\\main\\java\\com\\mindmetric\\api\\numbercomet\\DataSeeder.java', 'r', encoding='utf-8') as f:
    code = f.read()

# Find the Delivery Space-Port block
pattern_spaceport = re.compile(r'(case 4: \{ // Delivery Space-Port.*?return buildT\(ans, "A", "B", "C", q, "deliverySpacePort", json\);\n\s+\})', re.DOTALL)
match = pattern_spaceport.search(code)

if match:
    spaceport_block = match.group(1)
    
    # 1. Remove it from genLevel3 and put a placeholder for case 5 (since it replaced case 5 originally)
    code = code.replace(spaceport_block, 'case 5: return buildN(1, 1, 5, "More vs Less dummy");')
    
    # 2. Swap case 5 Heavy vs Light back to case 4
    code = code.replace('case 5: { // Heavy vs Light', 'case 4: { // Heavy vs Light')
    
    # 3. Replace case 4 in genLevel4 with the spaceport block
    # We find "case 4: return buildS("RECTANGLE", shapes, "Find the Long Rectangle");"
    genLevel4_case4 = 'case 4: return buildS("RECTANGLE", shapes, "Find the Long Rectangle");'
    if genLevel4_case4 in code:
        code = code.replace(genLevel4_case4, spaceport_block)
        
        with open('D:\\Mindmetric\\backend\\src\\main\\java\\com\\mindmetric\\api\\numbercomet\\DataSeeder.java', 'w', encoding='utf-8') as f:
            f.write(code)
        print("Success!")
    else:
        print("Could not find genLevel4 case 4")
else:
    print("Could not find Delivery Space-Port block")
