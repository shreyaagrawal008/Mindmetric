import re

with open('src/SodaCanFactoryGame.css', 'r') as f:
    css = f.read()

def replacer(match):
    val = float(match.group(1))
    # Don't scale small borders or 1px things
    if val <= 2:
        return match.group(0)
    new_val = round(val * 0.7)
    return f"{new_val}px"

new_css = re.sub(r'(-?\d+(?:\.\d+)?)px', replacer, css)

with open('src/SodaCanFactoryGame.css', 'w') as f:
    f.write(new_css)
