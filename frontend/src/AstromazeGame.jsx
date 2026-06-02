import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Pause, Play, RotateCcw, Sparkles, Volume2, VolumeX } from "lucide-react";
import { grade1AstromazeQuestions } from "./grade1AstromazeQuestions.js";

const ICON = "/assets/icon.jpeg";
const MASCOT = "/assets/monkey-mascot.png";
const MUSIC_GAIN_MIN = 0.04;
const MUSIC_GAIN_RANGE = 0.28;

const briefing =
  "Oh no, space explorer! Mindmetric was zooming toward a golden banana picnic when the rocket backpack went bumpy-bump and scattered every crystal across Astromaze. The banana gate will only open after the crystals are safe again. Help Mindmetric hurry through the glowing paths, solve the letter locks, scoop up the lost crystals, and reach the banana before snack time floats away.";

const briefingDisplay =
  "Oh no, space explorer! 🚀 Mindmetric was zooming toward a golden banana picnic 🍌 when the rocket backpack went bumpy-bump and scattered every crystal across Astromaze 💎. The banana gate will only open after the crystals are safe again. Help Mindmetric hurry through the glowing paths ✨, solve the letter locks 🔐, scoop up the lost crystals, and reach the picnic before snack time floats away!";

const victory =
  "Mission complete! Mindmetric saved every shiny crystal, unlocked the letter gates, and made it to the golden banana picnic. The maze is sparkling again!";

const gradeQuestionBank = {
  "1": {
    cycleName: "Grade 1 Discovery Quest",
    questions: grade1AstromazeQuestions
  },
  "2": {
    cycleName: "Healthy Habits: Food And Body",
    questions: [
      { id: "g2-01", difficulty: "easy", question: "Which food is an everyday food?", answer: "Apple", options: ["Apple", "Candy", "Cake"], lesson: "Fruit is a healthy everyday food." },
      { id: "g2-02", difficulty: "easy", question: "Which body part helps you see?", answer: "Eyes", options: ["Eyes", "Elbows", "Knees"], lesson: "Eyes help us see." },
      { id: "g2-03", difficulty: "easy", question: "Which food is a sometimes food?", answer: "Sweets", options: ["Sweets", "Carrots", "Rice"], lesson: "Sweets are sometimes foods." },
      { id: "g2-04", difficulty: "easy", question: "Which body part helps you hear?", answer: "Ears", options: ["Ears", "Feet", "Hands"], lesson: "Ears help us hear sounds." },
      { id: "g2-05", difficulty: "easy", question: "Which drink is best for every day?", answer: "Water", options: ["Water", "Soda", "Milkshake"], lesson: "Water is a healthy daily drink." },
      { id: "g2-06", difficulty: "easy", question: "Which body part helps you chew food?", answer: "Teeth", options: ["Teeth", "Toes", "Shoulders"], lesson: "Teeth help us chew food." },
      { id: "g2-07", difficulty: "medium", question: "Pick the everyday snack.", answer: "Banana", options: ["Banana", "Cookie", "Lollipop"], lesson: "Bananas are everyday foods." },
      { id: "g2-08", difficulty: "medium", question: "Which body parts help you run?", answer: "Legs", options: ["Legs", "Eyes", "Ears"], lesson: "Legs help us walk and run." },
      { id: "g2-09", difficulty: "medium", question: "Which plate is healthiest?", answer: "Rice, beans, vegetables", options: ["Rice, beans, vegetables", "Candy, cake, soda", "Chips, sweets, cola"], lesson: "A healthy plate has everyday foods." },
      { id: "g2-10", difficulty: "medium", question: "Which body part pumps blood?", answer: "Heart", options: ["Heart", "Hair", "Nose"], lesson: "The heart pumps blood around the body." },
      { id: "g2-11", difficulty: "medium", question: "Which is a sometimes food?", answer: "Ice cream", options: ["Ice cream", "Dal", "Orange"], lesson: "Ice cream is a sometimes food." },
      { id: "g2-12", difficulty: "medium", question: "Which body part helps you smell?", answer: "Nose", options: ["Nose", "Knee", "Wrist"], lesson: "The nose helps us smell." },
      { id: "g2-13", difficulty: "medium", question: "Which food group helps your body grow?", answer: "Protein foods", options: ["Protein foods", "Candy foods", "Soda drinks"], lesson: "Protein foods help the body grow strong." },
      { id: "g2-14", difficulty: "medium", question: "Which body part bends in the middle of your arm?", answer: "Elbow", options: ["Elbow", "Ankle", "Neck"], lesson: "Your elbow bends your arm." },
      { id: "g2-15", difficulty: "hard", question: "Sort this food: carrot.", answer: "Everyday food", options: ["Everyday food", "Sometimes food", "Body part"], lesson: "Carrots are vegetables and everyday foods." },
      { id: "g2-16", difficulty: "hard", question: "Which habit keeps teeth healthy?", answer: "Brush twice a day", options: ["Brush twice a day", "Drink soda all day", "Skip water"], lesson: "Brushing helps keep teeth healthy." },
      { id: "g2-17", difficulty: "hard", question: "Which pair is correct?", answer: "Lungs help breathing", options: ["Lungs help breathing", "Eyes help chewing", "Feet help hearing"], lesson: "Lungs help us breathe." },
      { id: "g2-18", difficulty: "hard", question: "Which list has only everyday foods?", answer: "Egg, rice, apple", options: ["Egg, rice, apple", "Cake, candy, soda", "Chips, lollipop, ice cream"], lesson: "Egg, rice, and apple can be everyday foods." },
      { id: "g2-19", difficulty: "hard", question: "You played outside and feel thirsty. What should you choose first?", answer: "Water", options: ["Water", "Candy", "Cola"], lesson: "Water is the best first choice when thirsty." },
      { id: "g2-20", difficulty: "hard", question: "Which answer sorts both correctly?", answer: "Fruit: everyday, cake: sometimes", options: ["Fruit: everyday, cake: sometimes", "Fruit: sometimes, cake: everyday", "Fruit: body part, cake: drink"], lesson: "Fruit is everyday; cake is for sometimes." }
    ]
  },
  "3": {
    cycleName: "Solar System: Planet Order",
    questions: [
      { id: "g3-01", difficulty: "easy", question: "Which planet is closest to the Sun?", answer: "Mercury", options: ["Mercury", "Earth", "Mars"], lesson: "Mercury is closest to the Sun." },
      { id: "g3-02", difficulty: "easy", question: "Which planet do we live on?", answer: "Earth", options: ["Earth", "Venus", "Jupiter"], lesson: "We live on Earth." },
      { id: "g3-03", difficulty: "easy", question: "Which planet is called the Red Planet?", answer: "Mars", options: ["Mars", "Saturn", "Neptune"], lesson: "Mars is called the Red Planet." },
      { id: "g3-04", difficulty: "easy", question: "Which planet comes after Mercury?", answer: "Venus", options: ["Venus", "Mars", "Earth"], lesson: "Venus is second from the Sun." },
      { id: "g3-05", difficulty: "easy", question: "Which planet has bright rings?", answer: "Saturn", options: ["Saturn", "Mercury", "Mars"], lesson: "Saturn is famous for its rings." },
      { id: "g3-06", difficulty: "easy", question: "Which is a star?", answer: "Sun", options: ["Sun", "Moon", "Earth"], lesson: "The Sun is a star." },
      { id: "g3-07", difficulty: "medium", question: "What is the third planet from the Sun?", answer: "Earth", options: ["Earth", "Venus", "Mars"], lesson: "Earth is third from the Sun." },
      { id: "g3-08", difficulty: "medium", question: "Which planet comes after Earth?", answer: "Mars", options: ["Mars", "Venus", "Mercury"], lesson: "Mars is fourth from the Sun." },
      { id: "g3-09", difficulty: "medium", question: "Which order is correct?", answer: "Mercury, Venus, Earth", options: ["Mercury, Venus, Earth", "Earth, Mercury, Venus", "Venus, Earth, Mercury"], lesson: "The first three planets are Mercury, Venus, Earth." },
      { id: "g3-10", difficulty: "medium", question: "Which planet is fifth from the Sun?", answer: "Jupiter", options: ["Jupiter", "Saturn", "Mars"], lesson: "Jupiter is fifth from the Sun." },
      { id: "g3-11", difficulty: "medium", question: "Which planet comes before Saturn?", answer: "Jupiter", options: ["Jupiter", "Uranus", "Neptune"], lesson: "Jupiter comes before Saturn." },
      { id: "g3-12", difficulty: "medium", question: "Which planet comes after Saturn?", answer: "Uranus", options: ["Uranus", "Mars", "Venus"], lesson: "Uranus comes after Saturn." },
      { id: "g3-13", difficulty: "medium", question: "Which order is correct?", answer: "Jupiter, Saturn, Uranus", options: ["Jupiter, Saturn, Uranus", "Saturn, Jupiter, Uranus", "Uranus, Saturn, Jupiter"], lesson: "The order is Jupiter, Saturn, Uranus." },
      { id: "g3-14", difficulty: "medium", question: "Which planet is farthest from the Sun?", answer: "Neptune", options: ["Neptune", "Mercury", "Earth"], lesson: "Neptune is the farthest planet from the Sun." },
      { id: "g3-15", difficulty: "hard", question: "Which full order is correct?", answer: "Mercury, Venus, Earth, Mars", options: ["Mercury, Venus, Earth, Mars", "Venus, Mercury, Mars, Earth", "Earth, Mars, Venus, Mercury"], lesson: "The first four planets are Mercury, Venus, Earth, Mars." },
      { id: "g3-16", difficulty: "hard", question: "Which planet is between Mars and Saturn?", answer: "Jupiter", options: ["Jupiter", "Earth", "Neptune"], lesson: "Jupiter is between Mars and Saturn." },
      { id: "g3-17", difficulty: "hard", question: "Which planet is seventh from the Sun?", answer: "Uranus", options: ["Uranus", "Saturn", "Neptune"], lesson: "Uranus is seventh from the Sun." },
      { id: "g3-18", difficulty: "hard", question: "Which pair are neighbors?", answer: "Uranus and Neptune", options: ["Uranus and Neptune", "Mercury and Mars", "Earth and Jupiter"], lesson: "Uranus and Neptune are next to each other in order." },
      { id: "g3-19", difficulty: "hard", question: "Choose the correct path after Jupiter.", answer: "Saturn, Uranus, Neptune", options: ["Saturn, Uranus, Neptune", "Mars, Earth, Venus", "Neptune, Uranus, Saturn"], lesson: "After Jupiter come Saturn, Uranus, and Neptune." },
      { id: "g3-20", difficulty: "hard", question: "Which planet is fourth from the Sun and before Jupiter?", answer: "Mars", options: ["Mars", "Venus", "Saturn"], lesson: "Mars is fourth, right before Jupiter." }
    ]
  },
  "4": {
    cycleName: "Life Cycles: Change Over Time",
    questions: [
      { id: "g4-01", difficulty: "easy", question: "What comes first in a butterfly life cycle?", answer: "Egg", options: ["Egg", "Adult butterfly", "Chrysalis"], lesson: "A butterfly life cycle starts with an egg." },
      { id: "g4-02", difficulty: "easy", question: "A caterpillar changes into a...", answer: "Butterfly", options: ["Butterfly", "Tadpole", "Seed"], lesson: "A caterpillar becomes a butterfly." },
      { id: "g4-03", difficulty: "easy", question: "What hatches from a frog egg?", answer: "Tadpole", options: ["Tadpole", "Caterpillar", "Chick"], lesson: "A tadpole hatches from a frog egg." },
      { id: "g4-04", difficulty: "easy", question: "Which is an adult stage?", answer: "Frog", options: ["Frog", "Egg", "Tadpole"], lesson: "A frog is the adult stage." },
      { id: "g4-05", difficulty: "easy", question: "Which stage eats leaves?", answer: "Caterpillar", options: ["Caterpillar", "Egg", "Adult frog"], lesson: "Caterpillars often eat leaves." },
      { id: "g4-06", difficulty: "easy", question: "Which stage has a tail and lives in water?", answer: "Tadpole", options: ["Tadpole", "Butterfly", "Chrysalis"], lesson: "Tadpoles live in water and have tails." },
      { id: "g4-07", difficulty: "medium", question: "Pick the correct butterfly order.", answer: "Egg, caterpillar, chrysalis, butterfly", options: ["Egg, caterpillar, chrysalis, butterfly", "Butterfly, egg, chrysalis, caterpillar", "Caterpillar, egg, butterfly, chrysalis"], lesson: "That is the correct butterfly life cycle." },
      { id: "g4-08", difficulty: "medium", question: "What comes after caterpillar?", answer: "Chrysalis", options: ["Chrysalis", "Egg", "Tadpole"], lesson: "A caterpillar becomes a chrysalis." },
      { id: "g4-09", difficulty: "medium", question: "Pick the correct frog order.", answer: "Egg, tadpole, froglet, frog", options: ["Egg, tadpole, froglet, frog", "Frog, egg, froglet, tadpole", "Tadpole, egg, frog, froglet"], lesson: "That is the correct frog life cycle." },
      { id: "g4-10", difficulty: "medium", question: "What comes after tadpole?", answer: "Froglet", options: ["Froglet", "Egg", "Butterfly"], lesson: "A tadpole grows into a froglet." },
      { id: "g4-11", difficulty: "medium", question: "Which stage belongs to butterflies, not frogs?", answer: "Chrysalis", options: ["Chrysalis", "Tadpole", "Froglet"], lesson: "Chrysalis is part of the butterfly life cycle." },
      { id: "g4-12", difficulty: "medium", question: "Which stage belongs to frogs, not butterflies?", answer: "Tadpole", options: ["Tadpole", "Caterpillar", "Chrysalis"], lesson: "Tadpole is part of the frog life cycle." },
      { id: "g4-13", difficulty: "medium", question: "What does metamorphosis mean?", answer: "A big body change", options: ["A big body change", "Staying the same", "Eating a snack"], lesson: "Metamorphosis means an animal changes form." },
      { id: "g4-14", difficulty: "medium", question: "Which animal goes through egg, caterpillar, chrysalis, adult?", answer: "Butterfly", options: ["Butterfly", "Frog", "Dog"], lesson: "That is a butterfly life cycle." },
      { id: "g4-15", difficulty: "hard", question: "Which sequence is out of order?", answer: "Egg, butterfly, caterpillar, chrysalis", options: ["Egg, butterfly, caterpillar, chrysalis", "Egg, tadpole, froglet, frog", "Egg, caterpillar, chrysalis, butterfly"], lesson: "A butterfly does not come before the caterpillar stage." },
      { id: "g4-16", difficulty: "hard", question: "A tadpole grows legs and loses its tail. What is it becoming?", answer: "Frog", options: ["Frog", "Butterfly", "Caterpillar"], lesson: "A tadpole changes into a frog." },
      { id: "g4-17", difficulty: "hard", question: "Which two stages are young stages?", answer: "Caterpillar and tadpole", options: ["Caterpillar and tadpole", "Butterfly and frog", "Egg and leaf"], lesson: "Caterpillar and tadpole are young stages." },
      { id: "g4-18", difficulty: "hard", question: "What is missing: egg, caterpillar, __, butterfly?", answer: "Chrysalis", options: ["Chrysalis", "Tadpole", "Froglet"], lesson: "Chrysalis comes before butterfly." },
      { id: "g4-19", difficulty: "hard", question: "What is missing: egg, tadpole, __, frog?", answer: "Froglet", options: ["Froglet", "Chrysalis", "Caterpillar"], lesson: "Froglet comes before adult frog." },
      { id: "g4-20", difficulty: "hard", question: "Which comparison is correct?", answer: "Both butterflies and frogs start as eggs", options: ["Both butterflies and frogs start as eggs", "Both have a chrysalis", "Both become tadpoles"], lesson: "Butterflies and frogs both begin as eggs." }
    ]
  },
  "5": {
    cycleName: "Human Systems: Body Tracks",
    questions: [
      { id: "g5-01", difficulty: "easy", question: "Which system helps digest food?", answer: "Digestive system", options: ["Digestive system", "Circulatory system", "Skeletal system"], lesson: "The digestive system breaks down food." },
      { id: "g5-02", difficulty: "easy", question: "Which organ pumps blood?", answer: "Heart", options: ["Heart", "Stomach", "Lung"], lesson: "The heart pumps blood." },
      { id: "g5-03", difficulty: "easy", question: "Where does food go after you swallow?", answer: "Esophagus", options: ["Esophagus", "Heart", "Brain"], lesson: "The esophagus carries food to the stomach." },
      { id: "g5-04", difficulty: "easy", question: "Which organ helps you breathe?", answer: "Lungs", options: ["Lungs", "Stomach", "Intestine"], lesson: "Lungs help the body breathe." },
      { id: "g5-05", difficulty: "easy", question: "Which carries blood around the body?", answer: "Blood vessels", options: ["Blood vessels", "Teeth", "Tongue"], lesson: "Blood vessels carry blood." },
      { id: "g5-06", difficulty: "easy", question: "Which organ churns food?", answer: "Stomach", options: ["Stomach", "Heart", "Rib"], lesson: "The stomach churns food." },
      { id: "g5-07", difficulty: "medium", question: "Pick the digestive path.", answer: "Mouth, esophagus, stomach", options: ["Mouth, esophagus, stomach", "Heart, lungs, stomach", "Brain, heart, mouth"], lesson: "Food travels from mouth to esophagus to stomach." },
      { id: "g5-08", difficulty: "medium", question: "What does the small intestine do?", answer: "Takes nutrients from food", options: ["Takes nutrients from food", "Pumps blood", "Stores memories"], lesson: "The small intestine absorbs nutrients." },
      { id: "g5-09", difficulty: "medium", question: "Which path belongs to blood flow?", answer: "Heart and blood vessels", options: ["Heart and blood vessels", "Mouth and stomach", "Teeth and tongue"], lesson: "The circulatory system uses the heart and blood vessels." },
      { id: "g5-10", difficulty: "medium", question: "What do red blood cells carry?", answer: "Oxygen", options: ["Oxygen", "Food chunks", "Bones"], lesson: "Red blood cells carry oxygen." },
      { id: "g5-11", difficulty: "medium", question: "Which organ removes water from leftover food?", answer: "Large intestine", options: ["Large intestine", "Heart", "Lung"], lesson: "The large intestine absorbs water." },
      { id: "g5-12", difficulty: "medium", question: "Which system includes arteries and veins?", answer: "Circulatory system", options: ["Circulatory system", "Digestive system", "Nervous system"], lesson: "Arteries and veins are blood vessels." },
      { id: "g5-13", difficulty: "medium", question: "Which organ adds juices to help digestion?", answer: "Stomach", options: ["Stomach", "Heart", "Skin"], lesson: "The stomach uses juices to help digest food." },
      { id: "g5-14", difficulty: "medium", question: "What is pulse connected to?", answer: "Heartbeat", options: ["Heartbeat", "Chewing", "Blinking"], lesson: "Pulse is connected to the heartbeat." },
      { id: "g5-15", difficulty: "hard", question: "Choose the correct full digestive order.", answer: "Mouth, esophagus, stomach, small intestine", options: ["Mouth, esophagus, stomach, small intestine", "Stomach, mouth, heart, intestine", "Heart, lungs, mouth, stomach"], lesson: "That is the correct digestive track order." },
      { id: "g5-16", difficulty: "hard", question: "Which system delivers oxygen to body cells?", answer: "Circulatory system", options: ["Circulatory system", "Digestive system", "Integumentary system"], lesson: "Blood carries oxygen through the circulatory system." },
      { id: "g5-17", difficulty: "hard", question: "Food gives nutrients. Which system moves those nutrients around?", answer: "Circulatory system", options: ["Circulatory system", "Digestive system only", "Skeletal system"], lesson: "Blood can carry nutrients around the body." },
      { id: "g5-18", difficulty: "hard", question: "Which pair is correct?", answer: "Stomach digests, heart pumps", options: ["Stomach digests, heart pumps", "Heart digests, stomach pumps", "Lungs digest, teeth pump"], lesson: "The stomach digests and the heart pumps blood." },
      { id: "g5-19", difficulty: "hard", question: "A maze path says mouth to esophagus to stomach. Which track is it?", answer: "Digestive track", options: ["Digestive track", "Circulatory track", "Planet track"], lesson: "That path follows digestion." },
      { id: "g5-20", difficulty: "hard", question: "A maze path says heart to arteries to capillaries to veins. Which system is it?", answer: "Circulatory system", options: ["Circulatory system", "Digestive system", "Respiratory system"], lesson: "That path follows blood circulation." }
    ]
  },
  "6": {
    cycleName: "World Geography: Flags And Capitals",
    questions: [
      { id: "g6-01", difficulty: "easy", question: "What is the capital of India?", answer: "New Delhi", options: ["New Delhi", "Mumbai", "Jaipur"], lesson: "New Delhi is the capital of India." },
      { id: "g6-02", difficulty: "easy", question: "What is the capital of France?", answer: "Paris", options: ["Paris", "Rome", "Madrid"], lesson: "Paris is the capital of France." },
      { id: "g6-03", difficulty: "easy", question: "Which country has the maple leaf flag?", answer: "Canada", options: ["Canada", "Japan", "Brazil"], lesson: "Canada's flag has a maple leaf." },
      { id: "g6-04", difficulty: "easy", question: "What is the capital of Japan?", answer: "Tokyo", options: ["Tokyo", "Seoul", "Beijing"], lesson: "Tokyo is the capital of Japan." },
      { id: "g6-05", difficulty: "easy", question: "Which country has a red circle on a white flag?", answer: "Japan", options: ["Japan", "India", "Mexico"], lesson: "Japan's flag has a red circle." },
      { id: "g6-06", difficulty: "easy", question: "What is the capital of the United Kingdom?", answer: "London", options: ["London", "Dublin", "Sydney"], lesson: "London is the capital of the United Kingdom." },
      { id: "g6-07", difficulty: "medium", question: "What is the capital of Australia?", answer: "Canberra", options: ["Canberra", "Sydney", "Melbourne"], lesson: "Canberra is Australia's capital." },
      { id: "g6-08", difficulty: "medium", question: "Which country uses a green flag with a yellow diamond and blue globe?", answer: "Brazil", options: ["Brazil", "Canada", "Italy"], lesson: "Brazil's flag has a yellow diamond and blue globe." },
      { id: "g6-09", difficulty: "medium", question: "What is the capital of Egypt?", answer: "Cairo", options: ["Cairo", "Nairobi", "Rabat"], lesson: "Cairo is the capital of Egypt." },
      { id: "g6-10", difficulty: "medium", question: "What is the capital of Italy?", answer: "Rome", options: ["Rome", "Paris", "Berlin"], lesson: "Rome is the capital of Italy." },
      { id: "g6-11", difficulty: "medium", question: "Which flag is green, white, and orange vertical stripes?", answer: "Ireland", options: ["Ireland", "Japan", "Brazil"], lesson: "Ireland's flag has green, white, and orange stripes." },
      { id: "g6-12", difficulty: "medium", question: "What is the capital of China?", answer: "Beijing", options: ["Beijing", "Shanghai", "Tokyo"], lesson: "Beijing is the capital of China." },
      { id: "g6-13", difficulty: "medium", question: "Which country has stars and stripes on its flag?", answer: "United States", options: ["United States", "France", "Nepal"], lesson: "The United States flag has stars and stripes." },
      { id: "g6-14", difficulty: "medium", question: "What is the capital of Germany?", answer: "Berlin", options: ["Berlin", "Munich", "Vienna"], lesson: "Berlin is the capital of Germany." },
      { id: "g6-15", difficulty: "hard", question: "What is the capital of Brazil?", answer: "Brasilia", options: ["Brasilia", "Rio de Janeiro", "Sao Paulo"], lesson: "Brasilia is the capital of Brazil." },
      { id: "g6-16", difficulty: "hard", question: "Which country has a non-rectangular flag?", answer: "Nepal", options: ["Nepal", "Canada", "France"], lesson: "Nepal has a unique non-rectangular flag." },
      { id: "g6-17", difficulty: "hard", question: "What is the capital of South Africa?", answer: "Pretoria", options: ["Pretoria", "Cape Town only", "Johannesburg"], lesson: "Pretoria is South Africa's administrative capital." },
      { id: "g6-18", difficulty: "hard", question: "Which capital and country pair is correct?", answer: "Kenya and Nairobi", options: ["Kenya and Nairobi", "Kenya and Cairo", "Kenya and Tokyo"], lesson: "Nairobi is the capital of Kenya." },
      { id: "g6-19", difficulty: "hard", question: "Which pair is mismatched?", answer: "France and Berlin", options: ["France and Berlin", "Japan and Tokyo", "Italy and Rome"], lesson: "France's capital is Paris, not Berlin." },
      { id: "g6-20", difficulty: "hard", question: "Which country is matched to the Union Jack flag?", answer: "United Kingdom", options: ["United Kingdom", "Brazil", "India"], lesson: "The Union Jack is the flag of the United Kingdom." }
    ]
  }
};

const mazeRuns = [
  { name: "Rainbow Run", difficulty: "easy", exitY: 9, gates: [[7, 3], [11, 7]], crystals: [[3, 1], [5, 3], [8, 5], [10, 9]], rows: ["011111111111111", "000000100000001", "101110101111101", "101000001000101", "101011111010101", "100010000010001", "111010111110111", "100010100000001", "101110101111101", "1000000000000E0", "111111111111111"] },
  { name: "Comet Curl", difficulty: "easy", exitY: 9, gates: [[8, 3], [10, 7]], crystals: [[2, 1], [5, 3], [9, 5], [12, 9]], rows: ["011111111111111", "000000001000001", "101111101011101", "100000100010001", "111010111110101", "100010000000101", "101111101110101", "100000101000001", "101110101011111", "1000100000000E0", "111111111111111"] },
  { name: "Bubble Bridge", difficulty: "easy", exitY: 9, gates: [[7, 3], [9, 7]], crystals: [[3, 1], [6, 5], [10, 7], [12, 9]], rows: ["011111111111111", "000010000000001", "101010111111101", "101000100000101", "101111101110101", "100000001010001", "111111101011101", "100000001000001", "101111111110101", "1000000000000E0", "111111111111111"] },
  { name: "Neon Noodle", difficulty: "medium", exitY: 9, gates: [[9, 3], [12, 5]], crystals: [[3, 1], [5, 5], [9, 7], [11, 9], [10, 9]], rows: ["011111111111111", "000000000010001", "101111111010101", "101000001000101", "101011101111101", "101010100000001", "101010111011111", "100010001000001", "111111101111101", "1000000000000E0", "111111111111111"] },
  { name: "Star Steps", difficulty: "medium", exitY: 9, gates: [[5, 3], [9, 5]], crystals: [[4, 1], [4, 3], [8, 5], [11, 7], [12, 9]], rows: ["011111111111111", "000000100000001", "111110101111101", "100000100000101", "101111111110101", "100000000010001", "101111101011111", "101000101000001", "101010101111101", "1000100000000E0", "111111111111111"] },
  { name: "Galaxy Garden", difficulty: "medium", exitY: 9, gates: [[8, 3], [10, 7]], crystals: [[2, 1], [5, 3], [7, 5], [11, 7], [12, 9]], rows: ["011111111111111", "000000001000001", "101111101111101", "101000000000101", "101011111110101", "100010000000001", "111010111111101", "100010100000001", "101110101111101", "1000000000000E0", "111111111111111"] },
  { name: "Planet Path", difficulty: "medium", exitY: 9, gates: [[7, 3], [9, 7]], crystals: [[3, 1], [5, 3], [8, 5], [10, 7], [12, 9]], rows: ["011111111111111", "000000000000001", "101111111110101", "100000100000101", "111110101111101", "100010000010001", "101011111010111", "101000001000001", "101111101111101", "1000000000000E0", "111111111111111"] },
  { name: "Rocket Route", difficulty: "hard", exitY: 9, gates: [[6, 3], [11, 7]], crystals: [[3, 1], [5, 3], [7, 5], [9, 7], [12, 9], [11, 9]], rows: ["011111111111111", "000010000000001", "101010111011111", "101010001000001", "101011101111101", "100000100000101", "111110111110101", "100000001000101", "101111101011101", "1000000000000E0", "111111111111111"] },
  { name: "Crystal Canyon", difficulty: "hard", exitY: 9, gates: [[7, 3], [10, 7]], crystals: [[3, 1], [5, 3], [5, 5], [8, 7], [11, 9], [12, 9]], rows: ["011111111111111", "000000000010001", "111111101010101", "100000101000101", "101110101111101", "101000100000001", "101011111011111", "100010000000001", "101110111111101", "1000000000000E0", "111111111111111"] },
  { name: "Banana Belt", difficulty: "hard", exitY: 9, gates: [[8, 3], [9, 5]], crystals: [[2, 1], [5, 3], [7, 5], [9, 7], [12, 9], [11, 9]], rows: ["011111111111111", "000000000000001", "101111101111101", "101000100000101", "101010111110101", "100010000010001", "111111101011101", "100000001000001", "101111111110101", "1000000000000E0", "111111111111111"] }
];

const difficultyCycle = mazeRuns.map((maze) => maze.difficulty);

function storageKey(userId, gradeLevel) {
  const userPart = String(userId || "guest").replace(/[^a-z0-9-]/gi, "_");
  const gradePart = String(gradeLevel || "default").replace(/[^a-z0-9-]/gi, "_");
  return `${userPart}_${gradePart}`;
}

function savedMazeIndex(userId, gradeLevel) {
  const stored = Number(localStorage.getItem(`mindmetric_astromaze_index_${storageKey(userId, gradeLevel)}`) || "0");
  return Number.isFinite(stored) ? stored % mazeRuns.length : 0;
}

function gradeKey(gradeLevel) {
  return gradeQuestionBank[String(gradeLevel)] ? String(gradeLevel) : "1";
}

function cycleForGrade(gradeLevel) {
  const grade = gradeKey(gradeLevel);
  const bank = gradeQuestionBank[grade];
  return {
    cycleName: bank.cycleName,
    grade,
    weeks: 2,
    totalMazes: 10,
    questions: bank.questions,
    mazes: difficultyCycle.map((difficulty, index) => {
      const groupIndex = difficultyCycle.slice(0, index).filter((item) => item === difficulty).length;
      const questions = bank.questions.filter((item) => item.difficulty === difficulty).slice(groupIndex * 2, groupIndex * 2 + 2);
      return { mazeNumber: index + 1, difficulty, questions };
    })
  };
}

function useImage(src) {
  const [image, setImage] = useState(null);
  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => setImage(img);
  }, [src]);
  return image;
}

function useTypewriter(text, enabled, speed = 24) {
  const [shown, setShown] = useState("");
  useEffect(() => {
    if (!enabled) return setShown("");
    setShown("");
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setShown(text.slice(0, index));
      if (index >= text.length) window.clearInterval(timer);
    }, speed);
    return () => window.clearInterval(timer);
  }, [enabled, speed, text]);
  return shown;
}

export default function AstromazeGame({ gradeLevel = "Pre-K", userId, onExit }) {
  const canvasRef = useRef(null);
  const keysRef = useRef({});
  const simulateKey = (key, isDown) => {
    if (keysRef.current) {
      keysRef.current[key] = isDown;
    }
  };
  const handleDPadTouch = (e) => {
    // Prevent default to stop scrolling/zooming and mouse event emulation
    if (e.cancelable) e.preventDefault();
    const activeKeys = new Set();
    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      const element = document.elementFromPoint(touch.clientX, touch.clientY);
      if (element) {
        const button = element.closest('button[data-key]');
        if (button) {
          activeKeys.add(button.getAttribute('data-key'));
        }
      }
    }
    ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].forEach(key => {
      simulateKey(key, activeKeys.has(key));
    });
  };

  const DPadButton = ({ keyName, icon }) => (
    <button 
      data-key={keyName}
      className="neon-btn cyan h-16 w-16 p-0 flex items-center justify-center rounded-2xl touch-none select-none text-2xl font-black bg-black/50 backdrop-blur"
      onPointerDown={(e) => { if (e.pointerType !== 'touch') simulateKey(keyName, true); }}
      onPointerUp={(e) => { if (e.pointerType !== 'touch') simulateKey(keyName, false); }}
      onPointerLeave={(e) => { if (e.pointerType !== 'touch') simulateKey(keyName, false); }}
      onContextMenu={(e) => e.preventDefault()}
      aria-label={`Move ${keyName}`}
    >
      {icon}
    </button>
  );
  const openedGatesRef = useRef(new Set());
  const completedRef = useRef(false);
  const autoVoiceStartedRef = useRef(false);
  const audioRef = useRef({ context: null, gain: null, musicTimer: null, step: 0 });
  const elevenLabsAudioRef = useRef(null);
  const popupsRef = useRef([]);
  const [mazeIndex, setMazeIndex] = useState(() => savedMazeIndex(userId, gradeLevel));
  const [phase, setPhase] = useState("briefing");
  const [activeGate, setActiveGate] = useState(null);
  const [openedGates, setOpenedGates] = useState([]);
  const [collectedCrystals, setCollectedCrystals] = useState([]);
  const [message, setMessage] = useState("Mindmetric's crystals are scattered. Gather them before the banana picnic drifts away.");
  const [score, setScore] = useState(0);
  const prevScoreRef = useRef(0);
  useEffect(() => {
    if (score > prevScoreRef.current && userId) {
      const delta = score - prevScoreRef.current;
      const key = `mindmetric_global_score_${userId}`;
      const currentGlobal = parseInt(localStorage.getItem(key) || '0', 10);
      localStorage.setItem(key, String(currentGlobal + delta));
    }
    prevScoreRef.current = score;
  }, [score, userId]);

  const [musicOn, setMusicOn] = useState(false);
  const [voiceState, setVoiceState] = useState("idle");
  const [volume, setVolume] = useState(0.8);
  const [volumeOpen, setVolumeOpen] = useState(false);
  const mascot = useImage(MASCOT);
  const briefingText = useTypewriter(briefingDisplay, phase === "briefing", 12);
  const victoryText = useTypewriter(victory, phase === "victory");
  const cycle = useMemo(() => cycleForGrade(gradeLevel), [gradeLevel]);
  const maze = mazeRuns[mazeIndex];
  const cycleMaze = cycle.mazes?.[mazeIndex] || cycleForGrade(gradeLevel).mazes[mazeIndex];
  const gates = useMemo(() => (cycleMaze.questions || []).map((question, index) => ({
    ...question,
    x: maze.gates[index][0],
    y: maze.gates[index][1],
    glow: index === 0 ? "#00E5FF" : "#A7FF3C"
  })), [cycleMaze, maze]);
  const allGatesOpen = openedGates.length === gates.length;
  const playerRef = useRef({ x: -0.55, y: 1.5 });

  useEffect(() => {
    setMazeIndex(savedMazeIndex(userId, gradeLevel));
  }, [userId, gradeLevel]);

  useEffect(() => {
    resetMaze(false);
  }, [gradeLevel, mazeIndex]);

  useEffect(() => {
    if (phase !== "briefing") {
      autoVoiceStartedRef.current = false;
      return;
    }
    if (autoVoiceStartedRef.current) return;
    autoVoiceStartedRef.current = true;
    const timer = window.setTimeout(() => playBriefingVoice(), 350);
    return () => window.clearTimeout(timer);
  }, [phase, gradeLevel, mazeIndex]);

  useEffect(() => {
    const down = (event) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d"].includes(event.key)) {
        event.preventDefault();
        keysRef.current[event.key] = true;
      }
    };
    const up = (event) => {
      keysRef.current[event.key] = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useEffect(() => () => stopMusic(), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationId;
    let last = performance.now();

    function resize() {
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.floor(window.innerWidth * ratio);
      canvas.height = Math.floor(window.innerHeight * ratio);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    function tileAt(x, y) {
      const cellX = Math.floor(x);
      const cellY = Math.floor(y);
      return maze.rows[cellY]?.[cellX];
    }

    function canMove(x, y) {
      const cellX = Math.floor(x);
      const cellY = Math.floor(y);
      const inStartLane = x >= -0.8 && x < 1.05 && y >= 1 && y < 2;
      const inExitLane = x >= 13 && x <= 15.95 && y >= maze.exitY && y < maze.exitY + 1;
      if (!inStartLane && !inExitLane) {
        const tile = tileAt(x, y);
        if (!tile || tile === "1") return false;
      }
      const lockedGate = gates.find((gate) => !openedGatesRef.current.has(gate.id) && cellX === gate.x && cellY === gate.y);
      if (lockedGate) {
        setActiveGate(lockedGate);
        setPhase("question");
        setMessage(lockedGate.question);
        return false;
      }
      return true;
    }

    function loop(now) {
      const delta = Math.min(0.035, (now - last) / 1000);
      last = now;
      if (phase === "game") {
        const player = playerRef.current;
        const speed = 3.2;
        let dx = 0;
        let dy = 0;
        if (keysRef.current.ArrowLeft || keysRef.current.a) dx -= speed * delta;
        if (keysRef.current.ArrowRight || keysRef.current.d) dx += speed * delta;
        if (keysRef.current.ArrowUp || keysRef.current.w) dy -= speed * delta;
        if (keysRef.current.ArrowDown || keysRef.current.s) dy += speed * delta;
        if (dx && canMove(player.x + dx, player.y)) player.x += dx;
        if (dy && canMove(player.x, player.y + dy)) player.y += dy;

        maze.crystals.forEach((crystal, index) => {
          if (collectedCrystals.includes(index)) return;
          if (Math.hypot(player.x - (crystal[0] + 0.5), player.y - (crystal[1] + 0.5)) < 0.42) {
            setCollectedCrystals((current) => [...current, index]);
            setScore((current) => current + 50);
            popupsRef.current.push({ x: crystal[0] + 0.5, y: crystal[1] + 0.5, text: "+50", color: "#FF2BD6", startTime: now });
            playCrystal();
          }
        });

        const banana = [15.45, maze.exitY + 0.5];
        if (allGatesOpen && Math.hypot(player.x - banana[0], player.y - banana[1]) < 0.55 && !completedRef.current) {
          completedRef.current = true;
          const nextIndex = (mazeIndex + 1) % mazeRuns.length;
          localStorage.setItem(`mindmetric_astromaze_index_${storageKey(userId, gradeLevel)}`, String(nextIndex));
          if (nextIndex === 0) localStorage.removeItem(`mindmetric_astromaze_index_${storageKey(userId, gradeLevel)}`);
          setScore((current) => current + 100);
          setPhase("victory");
          setMessage("You found the banana! Maze complete.");
          playCorrect();
        }
      }
      draw(ctx, mascot, phase, activeGate, maze, gates, openedGatesRef.current, collectedCrystals, playerRef.current, now, popupsRef.current);
      animationId = requestAnimationFrame(loop);
    }

    resize();
    window.addEventListener("resize", resize);
    animationId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, [activeGate, allGatesOpen, collectedCrystals, gates, userId, gradeLevel, mascot, maze, mazeIndex, phase]);

  function chooseGateAnswer(choice) {
    if (!activeGate) return;
    if (String(choice).toLowerCase() !== String(activeGate.answer).toLowerCase()) {
      setScore((current) => Math.max(0, current - 5));
      setMessage(`Not quite. Hint: ${activeGate.lesson} Look for the answer that matches that clue.`);
      playBuzzer();
      return;
    }
    openedGatesRef.current.add(activeGate.id);
    setOpenedGates(Array.from(openedGatesRef.current));
    setScore((current) => current + 100);
    popupsRef.current.push({ x: activeGate.x + 0.5, y: activeGate.y + 0.5, text: "+100", color: "#A7FF3C", startTime: performance.now() });
    setMessage(`Correct. ${activeGate.lesson} The gate disappears so Mindmetric can keep going.`);
    setActiveGate(null);
    setPhase("game");
    playCorrect();
  }

  useEffect(() => {
    const audio = audioRef.current;
    if (audio.gain) audio.gain.gain.value = MUSIC_GAIN_MIN + volume * MUSIC_GAIN_RANGE;
  }, [volume]);

  function ensureAudio() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    const audio = audioRef.current;
    if (!audio.context) audio.context = new AudioContext();
    if (!audio.gain) {
      audio.gain = audio.context.createGain();
      audio.gain.gain.value = MUSIC_GAIN_MIN + volume * MUSIC_GAIN_RANGE;
      audio.gain.connect(audio.context.destination);
    }
    audio.context.resume();
    return audio;
  }

  async function playBriefingVoice() {
    window.speechSynthesis?.cancel();
    if (elevenLabsAudioRef.current) {
      elevenLabsAudioRef.current.pause();
    }
    setVoiceState("playing");

    try {
      // Use ElevenLabs Elli voice (young, enthusiastic American female)
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/MF3mGyEYCl7XYWbV9V6O`, {
        method: 'POST',
        headers: {
          'xi-api-key': 'sk_81d44401e49447f6d3babf4963a1d56d59067cf07580c016',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: briefing,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.35,
            similarity_boost: 0.85
          }
        })
      });
      
      if (!response.ok) throw new Error("ElevenLabs API failed");
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.volume = volume;
      elevenLabsAudioRef.current = audio;
      
      audio.onend = () => setVoiceState("idle");
      audio.onerror = () => setVoiceState("idle");
      
      await audio.play();
    } catch (err) {
      console.error(err);
      setVoiceState("idle");
    }
  }

  function toggleVoice() {
    if (voiceState === "playing") {
      if (elevenLabsAudioRef.current) elevenLabsAudioRef.current.pause();
      window.speechSynthesis?.pause();
      setVoiceState("paused");
      return;
    }
    if (voiceState === "paused") {
      if (elevenLabsAudioRef.current) elevenLabsAudioRef.current.play();
      window.speechSynthesis?.resume();
      setVoiceState("playing");
      return;
    }
    playBriefingVoice();
  }

  function changeVolume(event) {
    const nextVolume = Number(event.target.value);
    setVolume(nextVolume);
  }

  function playBuzzer() {
    const audio = ensureAudio();
    if (!audio) return;
    const now = audio.context.currentTime;
    const osc = audio.context.createOscillator();
    const gain = audio.context.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.linearRampToValueAtTime(100, now + 0.3);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.1, now + 0.05);
    gain.gain.linearRampToValueAtTime(0.0001, now + 0.4);
    osc.connect(gain).connect(audio.gain);
    osc.start(now);
    osc.stop(now + 0.45);
  }

  function playCorrect() {
    const audio = ensureAudio();
    if (!audio) return;
    const now = audio.context.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.50];
    freqs.forEach((freq, i) => {
      const osc = audio.context.createOscillator();
      const gain = audio.context.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + i * 0.1);
      gain.gain.setValueAtTime(0.0001, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.1, now + i * 0.1 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.1 + 0.4);
      osc.connect(gain).connect(audio.gain);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.45);
    });
  }

  function playCrystal() {
    const audio = ensureAudio();
    if (!audio) return;
    const now = audio.context.currentTime;
    const freqs = [1046.50, 1318.51];
    freqs.forEach((freq, i) => {
      const osc = audio.context.createOscillator();
      const gain = audio.context.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      gain.gain.setValueAtTime(0.0001, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.06, now + i * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.25);
      osc.connect(gain).connect(audio.gain);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.3);
    });
  }

  function startMusic() {
    const audio = ensureAudio();
    if (!audio) return;
    if (audio.musicTimer) return setMusicOn(true);
    const melody = [523.25, 659.25, 783.99, 1046.5, 880, 783.99, 659.25, 587.33];
    const bass = [130.81, 196, 164.81, 220];
    const playTone = (type, frequency, start, length, max, destination = audio.gain) => {
      const osc = audio.context.createOscillator();
      const gain = audio.context.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(max, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
      osc.connect(gain).connect(destination);
      osc.start(start);
      osc.stop(start + length + 0.05);
    };
    const playBeat = () => {
      const now = audio.context.currentTime;
      playTone("square", melody[audio.step % melody.length], now, 0.16, 0.075);
      playTone("triangle", melody[(audio.step + 2) % melody.length] * 0.5, now + 0.18, 0.18, 0.045);
      playTone("sawtooth", bass[Math.floor(audio.step / 2) % bass.length], now, 0.34, 0.055);
      if (audio.step % 2 === 0) playTone("square", 98, now + 0.34, 0.07, 0.035);
      audio.step += 1;
    };
    playBeat();
    audio.musicTimer = window.setInterval(playBeat, 420);
    setMusicOn(true);
  }

  function stopMusic() {
    const audio = audioRef.current;
    if (audio.musicTimer) {
      window.clearInterval(audio.musicTimer);
      audio.musicTimer = null;
    }
    setMusicOn(false);
  }

  function startMission() {
    if (elevenLabsAudioRef.current) elevenLabsAudioRef.current.pause();
    window.speechSynthesis?.cancel();
    setVoiceState("idle");
    startMusic();
    setPhase("game");
  }

  function leaveGame() {
    if (elevenLabsAudioRef.current) elevenLabsAudioRef.current.pause();
    window.speechSynthesis?.cancel();
    setVoiceState("idle");
    stopMusic();
    onExit?.();
  }

  function resetMaze(showBriefing = true) {
    playerRef.current = { x: -0.55, y: 1.5 };
    openedGatesRef.current = new Set();
    completedRef.current = false;
    setOpenedGates([]);
    setCollectedCrystals([]);
    setActiveGate(null);
    setScore(0);
    setMessage("Mindmetric's crystals are scattered. Gather them before the banana picnic drifts away.");
    if (elevenLabsAudioRef.current) elevenLabsAudioRef.current.pause();
    window.speechSynthesis?.cancel();
    setVoiceState("idle");
    if (showBriefing) setPhase("briefing");
  }

  function restart() {
    setMazeIndex(savedMazeIndex(userId, gradeLevel));
    resetMaze(false);
    startMission();
  }

  return (
    <main className="relative h-[100dvh] w-screen overflow-hidden bg-space text-white">
      <canvas ref={canvasRef} className="absolute inset-0" aria-label="Astromaze colorful maze game world" />
      <div className="absolute left-5 top-5 z-10 flex items-center gap-2 scale-75 origin-top-left md:scale-100 md:gap-3">
        {onExit && (
          <button className="neon-btn cyan min-h-12 px-4 py-2" onClick={leaveGame} aria-label="Back to Brain-Base Dashboard">
            <ArrowLeft /> Back
          </button>
        )}
        <img src={ICON} alt="Mindmetric mascot icon" className="block h-16 w-16 rounded-2xl object-cover drop-shadow-[0_0_18px_rgba(0,229,255,.45)]" />
      </div>
      <div className="absolute right-5 top-5 z-10 grid gap-1 rounded-2xl border border-limeGlow/40 bg-black/55 px-3 py-2 shadow-lime backdrop-blur scale-75 origin-top-right md:scale-100 md:px-4 md:py-3 md:gap-2">
        <p className="text-xs font-black uppercase text-limeGlow">Crystals</p>
        <p className="text-2xl font-black">{collectedCrystals.length}/{maze.crystals.length}</p>
        <p className="text-xs font-black uppercase text-cyanGlow">Gates {openedGates.length}/{gates.length}</p>
        <p className="text-sm font-black text-cyanGlow">Score {score}</p>
        <p className="text-xs font-bold capitalize text-slate-200">Maze {mazeIndex + 1}/10 - {maze.difficulty}</p>
        <button className="neon-btn cyan min-h-10 px-3 py-1 text-sm" onClick={musicOn ? stopMusic : startMusic}>
          {musicOn ? <Volume2 /> : <VolumeX />} Music
        </button>
      </div>

      {phase === "briefing" && (
        <Overlay>
          <div className="absolute right-4 top-4 z-30 flex items-start gap-2">
            <button className="neon-btn cyan min-h-11 w-11 justify-center p-0" onClick={toggleVoice} aria-label={voiceState === "playing" ? "Pause voice" : "Play voice"}>
              {voiceState === "playing" ? <Pause /> : <Play />}
            </button>
            <div className="relative">
              <button className="neon-btn lime min-h-11 w-11 justify-center p-0" onClick={() => setVolumeOpen((open) => !open)} aria-label="Open volume control">
                <Volume2 />
              </button>
              {volumeOpen && (
                <label className="absolute right-0 top-14 grid w-56 gap-2 rounded-2xl border border-limeGlow/40 bg-black/80 p-3 text-xs font-black text-limeGlow shadow-lime backdrop-blur">
                  <span>{Math.round(volume * 100)}%</span>
                  <input type="range" min="0" max="1" step="0.05" value={volume} onChange={changeVolume} aria-label="Voice and music volume" className="h-2 w-full appearance-none rounded-lg outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#A7FF3C] [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#A7FF3C] [&::-moz-range-thumb]:border-none" style={{ background: `linear-gradient(to right, #A7FF3C ${volume * 100}%, rgba(255,255,255,0.2) ${volume * 100}%)` }} />
                </label>
              )}
            </div>
          </div>
          {onExit && <button className="neon-btn cyan absolute left-4 top-4 min-h-11 w-11 justify-center p-0" onClick={leaveGame} aria-label="Back to Brain-Base"><ArrowLeft /></button>}
          <motion.img animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }} src={MASCOT} alt="Mindmetric mascot" className="mx-auto h-[clamp(86px,18vh,150px)] rounded-3xl object-contain drop-shadow-[0_0_32px_rgba(0,229,255,.8)]" />
          <p className="eyebrow mt-2">Cycle 1 - Weeks 1-2</p>
          <h1 className="mt-1 text-[clamp(2.25rem,6vh,4rem)] font-black leading-none">Astromaze</h1>
          <p className="mt-2 text-sm font-black capitalize text-cyanGlow">{cycle.cycleName} - {maze.name}</p>
          <p className="mx-auto mt-3 min-h-[7.5rem] max-w-3xl text-[clamp(1rem,2.4vh,1.35rem)] font-semibold leading-relaxed text-slate-100">{briefingText}</p>
          <div className="mx-auto mt-4 flex max-w-xl justify-center">
            <button className="neon-btn lime justify-center" onClick={startMission}><Play /> Start Mission</button>
          </div>
        </Overlay>
      )}

      {phase === "question" && activeGate && (
        <Overlay compact>
          <div className="grid gap-5 md:grid-cols-[160px_1fr] md:items-center">
            <motion.img animate={{ y: [0, -10, 0] }} transition={{ duration: 2.8, repeat: Infinity }} src={MASCOT} alt="Mindmetric mascot" className="mx-auto max-h-44 rounded-3xl object-contain" />
            <div>
              <p className="eyebrow">Crystal Gate</p>
              <div className="mt-3 rounded-3xl rounded-tl-sm border border-cyanGlow/40 bg-cyanGlow/10 p-5 text-xl shadow-cyan">{message}</div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {(activeGate.options || []).map((option) => (
                  <button key={option} className="neon-btn cyan min-h-20 justify-center text-2xl" onClick={() => chooseGateAnswer(option)}>
                    <Sparkles /> {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Overlay>
      )}

      {phase === "victory" && (
        <Overlay>
          <p className="eyebrow">Victory Story</p>
          <h1 className="mt-2 text-5xl font-black text-limeGlow">Banana Found</h1>
          <p className="mt-3 text-3xl font-black text-cyanGlow">Score: {score}</p>
          <p className="mx-auto mt-4 max-w-3xl text-lg leading-relaxed text-slate-100">{victoryText}</p>
          <div className="relative mx-auto mt-5 h-52 w-full max-w-3xl overflow-visible rounded-3xl border border-limeGlow/30 bg-black/40 shadow-lime">
            <div className="absolute bottom-4 left-1/2 h-24 w-8 -translate-x-1/2 rounded-t-full bg-limeGlow/50" />
            <div className="absolute bottom-24 left-1/2 h-20 w-1 -translate-x-1/2 bg-limeGlow/80" />
            <div className="absolute left-1/2 top-6 h-24 w-36 -translate-x-1/2"><BananaSvg /></div>
          </div>
          <div className="sticky bottom-0 mt-5 flex flex-wrap justify-center gap-3 bg-black/70 py-3 backdrop-blur">
            <button className="neon-btn pink justify-center" onClick={restart}><RotateCcw /> Play Next Maze</button>
            {onExit && <button className="neon-btn cyan justify-center" onClick={leaveGame}><ArrowLeft /> Back to Dashboard</button>}
          </div>
        </Overlay>
      )}

      {phase === "game" && (
        <div className="hidden lg:block absolute left-5 top-28 z-10 w-[min(310px,calc(100vw-2rem))] rounded-2xl border border-cyanGlow/30 bg-black/60 p-4 text-left shadow-cyan backdrop-blur">
          <p className="text-xs font-black uppercase text-limeGlow">How to Play</p>
          <p className="mt-2 font-black text-cyanGlow">Use arrow keys or W A S D.</p>
          <p className="mt-2 text-sm text-slate-100">Rescue the scattered crystals, crack the two letter locks, and lead Mindmetric to the banana picnic.</p>
          <p className="mt-1 text-sm text-slate-200">{message}</p>
        </div>
      )}

      {/* Mobile D-Pad */}
      {phase === "game" && (
        <div 
          className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 lg:hidden z-20 touch-none pointer-events-auto"
          onTouchStart={handleDPadTouch}
          onTouchMove={handleDPadTouch}
          onTouchEnd={handleDPadTouch}
          onTouchCancel={handleDPadTouch}
        >
          <DPadButton keyName="ArrowUp" icon="▲" />
          <div className="flex gap-2">
            <DPadButton keyName="ArrowLeft" icon="◀" />
            <DPadButton keyName="ArrowDown" icon="▼" />
            <DPadButton keyName="ArrowRight" icon="▶" />
          </div>
        </div>
      )}
    </main>
  );
}

function Overlay({ children, compact = false }) {
  return (
    <div className="absolute inset-0 z-20 grid place-items-center overflow-hidden bg-space/82 p-3 backdrop-blur-md">
      <div className={`relative max-h-[calc(100dvh-1.5rem)] w-[min(920px,100%)] overflow-hidden rounded-3xl border border-cyanGlow/40 bg-black/70 p-4 text-center shadow-cyan ${compact ? "" : "md:p-6"}`}>
        {children}
      </div>
    </div>
  );
}

function BananaSvg() {
  return (
    <svg viewBox="0 0 180 90" role="img" aria-label="Banana reward" className="h-full w-full drop-shadow-[0_0_18px_rgba(253,224,71,.5)]">
      <path d="M24 34 C50 78 124 78 158 22 C134 47 72 54 36 23 Z" fill="#FFD84A" stroke="#8A5A00" strokeWidth="5" />
      <path d="M36 23 C72 54 134 47 158 22 C118 36 72 35 44 12 Z" fill="#FFE98A" opacity="0.9" />
      <path d="M22 34 L38 18" stroke="#6B3F00" strokeWidth="8" strokeLinecap="round" />
      <path d="M154 24 L168 12" stroke="#6B3F00" strokeWidth="7" strokeLinecap="round" />
    </svg>
  );
}

function draw(ctx, mascot, phase, activeGate, maze, gates, openedGates, collectedCrystals, player, time, popups = []) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  ctx.clearRect(0, 0, width, height);
  drawSpace(ctx, width, height, time);

  const rows = maze.rows.length;
  const cols = maze.rows[0].length;
  const leftReserve = width >= 980 ? 310 : 20;
  const rightReserve = width >= 980 ? 210 : 20;
  const tile = Math.min((width - leftReserve - rightReserve) / (cols + 2.4), height / (rows + 2.4));
  const offsetX = leftReserve + ((width - leftReserve - rightReserve) - cols * tile) / 2;
  const offsetY = (height - rows * tile) / 2 + 20;

  drawMaze(ctx, maze, tile, offsetX, offsetY, time);
  drawCrystals(ctx, maze, collectedCrystals, tile, offsetX, offsetY, time);
  drawGates(ctx, gates, openedGates, tile, offsetX, offsetY, time);
  drawBanana(ctx, offsetX + 15.45 * tile, offsetY + (maze.exitY + 0.5) * tile, tile * 1.55);
  drawMascot(ctx, mascot, player, tile, offsetX, offsetY, time);

  for (let i = popups.length - 1; i >= 0; i--) {
    const pop = popups[i];
    const elapsed = time - pop.startTime;
    if (elapsed > 1000) {
      popups.splice(i, 1);
      continue;
    }
    const progress = elapsed / 1000;
    const alpha = 1 - Math.pow(progress, 3);
    const px = offsetX + pop.x * tile;
    const py = offsetY + pop.y * tile;
    const renderY = py - (progress * tile * 0.8);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = `900 ${tile * 0.6}px "Inter", sans-serif`;
    ctx.fillStyle = pop.color;
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = tile * 0.1;
    ctx.lineJoin = "round";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.strokeText(pop.text, px, renderY);
    ctx.fillText(pop.text, px, renderY);
    ctx.restore();
  }

  if (activeGate && phase === "question") {
    drawSpeech(ctx, offsetX + player.x * tile + tile * 0.7, offsetY + player.y * tile - tile * 0.9, "Answer the Crystal Gate!");
  }
}

function drawMaze(ctx, maze, tile, offsetX, offsetY, time) {
  const colors = ["#00E5FF", "#FF2BD6", "#A7FF3C", "#FFD84A", "#8B5CF6"];
  for (let y = 0; y < maze.rows.length; y += 1) {
    for (let x = 0; x < maze.rows[y].length; x += 1) {
      const px = offsetX + x * tile;
      const py = offsetY + y * tile;
      const cell = maze.rows[y][x];
      if (cell === "1") {
        const color = colors[(x + y + Math.floor(time / 900)) % colors.length];
        ctx.save();
        ctx.fillStyle = `${color}30`;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        roundRect(ctx, px + 2, py + 2, tile - 4, tile - 4, 8);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      } else {
        ctx.fillStyle = "rgba(255,255,255,0.04)";
        ctx.fillRect(px + 3, py + 3, tile - 6, tile - 6);
      }
    }
  }
  ctx.save();
  ctx.strokeStyle = "#A7FF3C";
  ctx.lineWidth = 4;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(offsetX - tile * 0.8, offsetY + tile * 1.5);
  ctx.lineTo(offsetX + tile * 1.1, offsetY + tile * 1.5);
  ctx.moveTo(offsetX + tile * 13.5, offsetY + tile * (maze.exitY + 0.5));
  ctx.lineTo(offsetX + tile * 15.55, offsetY + tile * (maze.exitY + 0.5));
  ctx.stroke();
  ctx.restore();
}

function drawCrystals(ctx, maze, collectedCrystals, tile, offsetX, offsetY, time) {
  maze.crystals.forEach(([x, y], index) => {
    if (collectedCrystals.includes(index)) return;
    const px = offsetX + (x + 0.5) * tile;
    const py = offsetY + (y + 0.5) * tile + Math.sin(time / 260 + index) * tile * 0.06;
    ctx.save();
    ctx.translate(px, py);
    ctx.shadowBlur = 20;
    ctx.shadowColor = index % 2 ? "#FF2BD6" : "#00E5FF";
    ctx.fillStyle = index % 2 ? "#FF2BD6" : "#00E5FF";
    ctx.strokeStyle = "#F8FBFF";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -tile * 0.22);
    ctx.lineTo(tile * 0.18, 0);
    ctx.lineTo(0, tile * 0.24);
    ctx.lineTo(-tile * 0.18, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  });
}

function drawGates(ctx, gates, openedGates, tile, offsetX, offsetY, time) {
  gates.forEach((gate, index) => {
    if (openedGates.has(gate.id)) return;
    const px = offsetX + (gate.x + 0.5) * tile;
    const py = offsetY + (gate.y + 0.5) * tile;
    ctx.save();
    const pulse = 1 + Math.sin(time / 220 + index) * 0.08;
    ctx.translate(px, py);
    ctx.scale(pulse, pulse);
    ctx.shadowBlur = 24;
    ctx.shadowColor = gate.glow;
    ctx.strokeStyle = gate.glow;
    ctx.fillStyle = "rgba(255,255,255,.1)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, -tile * 0.34);
    ctx.lineTo(tile * 0.28, 0);
    ctx.lineTo(0, tile * 0.34);
    ctx.lineTo(-tile * 0.28, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#F8FBFF";
    ctx.font = `900 ${Math.max(13, tile * 0.27)}px Inter, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(index + 1), 0, 1);
    ctx.restore();
  });
}

function drawBanana(ctx, x, y, size) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.14);
  ctx.shadowBlur = 18;
  ctx.shadowColor = "rgba(253,224,71,.8)";
  ctx.beginPath();
  ctx.moveTo(-size * 0.46, -size * 0.08);
  ctx.bezierCurveTo(-size * 0.18, size * 0.48, size * 0.42, size * 0.34, size * 0.56, -size * 0.28);
  ctx.bezierCurveTo(size * 0.20, size * 0.10, -size * 0.18, size * 0.08, -size * 0.36, -size * 0.32);
  ctx.closePath();
  ctx.fillStyle = "#FFD84A";
  ctx.strokeStyle = "#7A4C00";
  ctx.lineWidth = Math.max(3, size * 0.045);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawMascot(ctx, mascot, player, tile, offsetX, offsetY, time) {
  const px = offsetX + player.x * tile;
  const py = offsetY + player.y * tile + Math.sin(time / 280) * 2;
  ctx.save();
  ctx.shadowBlur = 24;
  ctx.shadowColor = "#FF2BD6";
  ctx.beginPath();
  ctx.arc(px, py, tile * 0.34, 0, Math.PI * 2);
  ctx.fillStyle = "#FF2BD6";
  ctx.fill();
  ctx.clip();
  if (mascot) ctx.drawImage(mascot, px - tile * 0.33, py - tile * 0.38, tile * 0.66, tile * 0.76);
  ctx.restore();
}

function drawSpace(ctx, width, height, time) {
  const gradient = ctx.createRadialGradient(width * 0.5, height * 0.5, 80, width * 0.5, height * 0.5, Math.max(width, height));
  gradient.addColorStop(0, "#151A46");
  gradient.addColorStop(1, "#0B0E26");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "rgba(255,255,255,0.65)";
  for (let i = 0; i < 90; i += 1) {
    const x = (i * 137.5) % width;
    const y = (i * 83.25) % height;
    ctx.globalAlpha = 0.35 + Math.abs(Math.sin(time / 600 + i)) * 0.65;
    ctx.fillRect(x, y, i % 5 === 0 ? 2 : 1, i % 5 === 0 ? 2 : 1);
  }
  ctx.globalAlpha = 1;
}

function drawSpeech(ctx, x, y, text) {
  ctx.save();
  ctx.font = "700 16px Inter, sans-serif";
  const width = ctx.measureText(text).width + 34;
  ctx.fillStyle = "rgba(0,0,0,0.72)";
  ctx.strokeStyle = "#00E5FF";
  ctx.shadowBlur = 18;
  ctx.shadowColor = "#00E5FF";
  roundRect(ctx, x, y, width, 46, 16);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#F8FBFF";
  ctx.fillText(text, x + 17, y + 29);
  ctx.restore();
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}
