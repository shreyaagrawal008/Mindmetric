CREATE TABLE IF NOT EXISTS word_nebula_questions (
  id VARCHAR(32) PRIMARY KEY,
  day_of_week VARCHAR(16) NOT NULL,
  topic VARCHAR(80) NOT NULL,
  pool_key VARCHAR(80) NOT NULL DEFAULT 'WORD_NEBULA_FOUNDATIONS',
  engine_key VARCHAR(40) NOT NULL,
  prompt_type VARCHAR(40) NOT NULL,
  prompt_text VARCHAR(255) NOT NULL,
  audio_cue VARCHAR(255) NULL,
  image_cue VARCHAR(255) NULL,
  question_image_url VARCHAR(255) NOT NULL DEFAULT '',
  answer VARCHAR(80) NOT NULL,
  options_json JSON NOT NULL,
  payload_json JSON NOT NULL,
  difficulty INT NOT NULL DEFAULT 1,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_wn_pool_active (pool_key, active),
  INDEX idx_wn_topic_active (topic, active),
  INDEX idx_wn_engine_active (engine_key, active),
  INDEX idx_wn_day_engine (day_of_week, engine_key)
);

CREATE TABLE IF NOT EXISTS word_nebula_sessions (
  id VARCHAR(96) PRIMARY KEY,
  user_id VARCHAR(80) NOT NULL,
  topic VARCHAR(80) NOT NULL,
  engine_key VARCHAR(40) NOT NULL,
  active_question_ids_json JSON NOT NULL,
  consumed_question_ids_json JSON NOT NULL,
  current_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_wn_user_topic (user_id, topic),
  INDEX idx_wn_session_user (user_id)
);

DELETE FROM word_nebula_questions WHERE id LIKE 'WN-%';

INSERT INTO word_nebula_questions
(id, day_of_week, topic, pool_key, engine_key, prompt_type, prompt_text, audio_cue, image_cue, answer, options_json, payload_json, difficulty, active)
VALUES
('WN-001','MONDAY','Letter Sounds (A-F)','WORD_NEBULA_FOUNDATIONS','TALKING_ALIEN','audio_match','Tap the letter that says /a/.','phonics/a-short',NULL,'A','["A","B","F"]','{"target":"A","phoneme":"/a/","alienMood":"curious"}',1,TRUE),
('WN-002','MONDAY','Letter Sounds (A-F)','WORD_NEBULA_FOUNDATIONS','TALKING_ALIEN','audio_match','Tap the letter that says /b/.','phonics/b',NULL,'B','["D","B","E"]','{"target":"B","phoneme":"/b/","alienMood":"happy"}',1,TRUE),
('WN-003','MONDAY','Letter Sounds (A-F)','WORD_NEBULA_FOUNDATIONS','TALKING_ALIEN','audio_match','Tap the letter that says /c/.','phonics/c-hard',NULL,'C','["C","A","F"]','{"target":"C","phoneme":"/c/","alienMood":"focused"}',1,TRUE),
('WN-004','MONDAY','Letter Sounds (A-F)','WORD_NEBULA_FOUNDATIONS','TALKING_ALIEN','audio_match','Tap the letter that says /d/.','phonics/d',NULL,'D','["B","D","C"]','{"target":"D","phoneme":"/d/","alienMood":"excited"}',1,TRUE),
('WN-005','MONDAY','Letter Sounds (A-F)','WORD_NEBULA_FOUNDATIONS','TALKING_ALIEN','audio_match','Tap the letter that says /e/.','phonics/e-short',NULL,'E','["F","E","A"]','{"target":"E","phoneme":"/e/","alienMood":"gentle"}',2,TRUE),
('WN-006','MONDAY','Letter Sounds (A-F)','WORD_NEBULA_FOUNDATIONS','TALKING_ALIEN','audio_match','Tap the letter that says /f/.','phonics/f',NULL,'F','["E","C","F"]','{"target":"F","phoneme":"/f/","alienMood":"proud"}',2,TRUE),
('WN-007','MONDAY','Letter Sounds (A-F)','WORD_NEBULA_FOUNDATIONS','TALKING_ALIEN','audio_match','Which letter begins the sound in apple?','words/apple',NULL,'A','["A","E","D"]','{"word":"apple","phoneme":"/a/","target":"A"}',2,TRUE),

('WN-008','TUESDAY','Capital & Small Letters','WORD_NEBULA_FOUNDATIONS','ROCKET_MATCH_MAZE','case_match','Match uppercase A to its small letter.',NULL,NULL,'a','["a","b","d"]','{"uppercase":"A","lowercase":"a","grid":["A","a","B","d"]}',1,TRUE),
('WN-009','TUESDAY','Capital & Small Letters','WORD_NEBULA_FOUNDATIONS','ROCKET_MATCH_MAZE','case_match','Match uppercase B to its small letter.',NULL,NULL,'b','["d","b","p"]','{"uppercase":"B","lowercase":"b","grid":["B","d","b","p"]}',1,TRUE),
('WN-010','TUESDAY','Capital & Small Letters','WORD_NEBULA_FOUNDATIONS','ROCKET_MATCH_MAZE','case_match','Match uppercase C to its small letter.',NULL,NULL,'c','["c","o","s"]','{"uppercase":"C","lowercase":"c","grid":["C","o","c","s"]}',1,TRUE),
('WN-011','TUESDAY','Capital & Small Letters','WORD_NEBULA_FOUNDATIONS','ROCKET_MATCH_MAZE','case_match','Match uppercase D to its small letter.',NULL,NULL,'d','["b","d","a"]','{"uppercase":"D","lowercase":"d","grid":["D","b","d","a"]}',1,TRUE),
('WN-012','TUESDAY','Capital & Small Letters','WORD_NEBULA_FOUNDATIONS','ROCKET_MATCH_MAZE','case_match','Match uppercase E to its small letter.',NULL,NULL,'e','["e","c","f"]','{"uppercase":"E","lowercase":"e","grid":["E","e","c","f"]}',2,TRUE),
('WN-013','TUESDAY','Capital & Small Letters','WORD_NEBULA_FOUNDATIONS','ROCKET_MATCH_MAZE','case_match','Match uppercase F to its small letter.',NULL,NULL,'f','["t","f","r"]','{"uppercase":"F","lowercase":"f","grid":["F","t","f","r"]}',2,TRUE),
('WN-014','TUESDAY','Capital & Small Letters','WORD_NEBULA_FOUNDATIONS','ROCKET_MATCH_MAZE','case_match','Choose the matching pair for G.',NULL,NULL,'G g','["G g","G q","C g"]','{"uppercase":"G","lowercase":"g","grid":["G","q","g","C"]}',2,TRUE),

('WN-015','WEDNESDAY','Picture to Word Match','WORD_NEBULA_FOUNDATIONS','SPACE_FLASH_CARDS','image_word','Flip the card and choose the word for the picture.',NULL,'assets/word-nebula/apple.png','apple','["apple","ant","axe"]','{"noun":"apple","category":"food","cardColor":"red"}',1,TRUE),
('WN-016','WEDNESDAY','Picture to Word Match','WORD_NEBULA_FOUNDATIONS','SPACE_FLASH_CARDS','image_word','Flip the card and choose the word for the picture.',NULL,'assets/word-nebula/ball.png','ball','["bag","ball","bell"]','{"noun":"ball","category":"toy","cardColor":"blue"}',1,TRUE),
('WN-017','WEDNESDAY','Picture to Word Match','WORD_NEBULA_FOUNDATIONS','SPACE_FLASH_CARDS','image_word','Flip the card and choose the word for the picture.',NULL,'assets/word-nebula/cat.png','cat','["cat","cap","cup"]','{"noun":"cat","category":"animal","cardColor":"orange"}',1,TRUE),
('WN-018','WEDNESDAY','Picture to Word Match','WORD_NEBULA_FOUNDATIONS','SPACE_FLASH_CARDS','image_word','Flip the card and choose the word for the picture.',NULL,'assets/word-nebula/dog.png','dog','["dot","dog","dig"]','{"noun":"dog","category":"animal","cardColor":"brown"}',1,TRUE),
('WN-019','WEDNESDAY','Picture to Word Match','WORD_NEBULA_FOUNDATIONS','SPACE_FLASH_CARDS','image_word','Flip the card and choose the word for the picture.',NULL,'assets/word-nebula/egg.png','egg','["egg","elk","end"]','{"noun":"egg","category":"food","cardColor":"cream"}',2,TRUE),
('WN-020','WEDNESDAY','Picture to Word Match','WORD_NEBULA_FOUNDATIONS','SPACE_FLASH_CARDS','image_word','Flip the card and choose the word for the picture.',NULL,'assets/word-nebula/fish.png','fish','["fan","fish","fox"]','{"noun":"fish","category":"animal","cardColor":"teal"}',2,TRUE),
('WN-021','WEDNESDAY','Picture to Word Match','WORD_NEBULA_FOUNDATIONS','SPACE_FLASH_CARDS','image_word','Flip the card and choose the word for the picture.',NULL,'assets/word-nebula/sun.png','sun','["sun","sit","sip"]','{"noun":"sun","category":"sky","cardColor":"gold"}',2,TRUE),

('WN-022','THURSDAY','Rhyming Words','WORD_NEBULA_FOUNDATIONS','CATCH_RHYMING_STARS','rhyme_catch','Catch the word that rhymes with cat.',NULL,NULL,'hat','["hat","dog","fish"]','{"anchor":"cat","rime":"at","fallSpeed":1}',1,TRUE),
('WN-023','THURSDAY','Rhyming Words','WORD_NEBULA_FOUNDATIONS','CATCH_RHYMING_STARS','rhyme_catch','Catch the word that rhymes with bag.',NULL,NULL,'tag','["sun","tag","bed"]','{"anchor":"bag","rime":"ag","fallSpeed":1}',1,TRUE),
('WN-024','THURSDAY','Rhyming Words','WORD_NEBULA_FOUNDATIONS','CATCH_RHYMING_STARS','rhyme_catch','Catch the word that rhymes with pin.',NULL,NULL,'win','["win","map","fox"]','{"anchor":"pin","rime":"in","fallSpeed":1}',1,TRUE),
('WN-025','THURSDAY','Rhyming Words','WORD_NEBULA_FOUNDATIONS','CATCH_RHYMING_STARS','rhyme_catch','Catch the word that rhymes with hop.',NULL,NULL,'top','["tap","top","ten"]','{"anchor":"hop","rime":"op","fallSpeed":2}',2,TRUE),
('WN-026','THURSDAY','Rhyming Words','WORD_NEBULA_FOUNDATIONS','CATCH_RHYMING_STARS','rhyme_catch','Catch the word that rhymes with bed.',NULL,NULL,'red','["red","rod","run"]','{"anchor":"bed","rime":"ed","fallSpeed":2}',2,TRUE),
('WN-027','THURSDAY','Rhyming Words','WORD_NEBULA_FOUNDATIONS','CATCH_RHYMING_STARS','rhyme_catch','Catch the word that rhymes with duck.',NULL,NULL,'truck','["truck","track","trick"]','{"anchor":"duck","rime":"uck","fallSpeed":2}',2,TRUE),
('WN-028','THURSDAY','Rhyming Words','WORD_NEBULA_FOUNDATIONS','CATCH_RHYMING_STARS','rhyme_catch','Catch the word that rhymes with moon.',NULL,NULL,'spoon','["spoon","spin","span"]','{"anchor":"moon","rime":"oon","fallSpeed":3}',3,TRUE),

('WN-029','FRIDAY','Beginning Sounds','WORD_NEBULA_FOUNDATIONS','SOUND_MONSTER','initial_sound','Feed the monster the item that starts with /m/.','phonics/m',NULL,'moon','["moon","sun","fish"]','{"phoneme":"/m/","monster":"Munch","targetWord":"moon"}',1,TRUE),
('WN-030','FRIDAY','Beginning Sounds','WORD_NEBULA_FOUNDATIONS','SOUND_MONSTER','initial_sound','Feed the monster the item that starts with /s/.','phonics/s',NULL,'sock','["apple","sock","net"]','{"phoneme":"/s/","monster":"Sizzle","targetWord":"sock"}',1,TRUE),
('WN-031','FRIDAY','Beginning Sounds','WORD_NEBULA_FOUNDATIONS','SOUND_MONSTER','initial_sound','Feed the monster the item that starts with /t/.','phonics/t',NULL,'top','["top","cup","dog"]','{"phoneme":"/t/","monster":"Tango","targetWord":"top"}',1,TRUE),
('WN-032','FRIDAY','Beginning Sounds','WORD_NEBULA_FOUNDATIONS','SOUND_MONSTER','initial_sound','Feed the monster the item that starts with /p/.','phonics/p',NULL,'pan','["fan","pan","van"]','{"phoneme":"/p/","monster":"Pip","targetWord":"pan"}',1,TRUE),
('WN-033','FRIDAY','Beginning Sounds','WORD_NEBULA_FOUNDATIONS','SOUND_MONSTER','initial_sound','Feed the monster the item that starts with /r/.','phonics/r',NULL,'ring','["wing","ring","king"]','{"phoneme":"/r/","monster":"Rolo","targetWord":"ring"}',2,TRUE),
('WN-034','FRIDAY','Beginning Sounds','WORD_NEBULA_FOUNDATIONS','SOUND_MONSTER','initial_sound','Feed the monster the item that starts with /l/.','phonics/l',NULL,'leaf','["leaf","beak","seal"]','{"phoneme":"/l/","monster":"Luma","targetWord":"leaf"}',2,TRUE),
('WN-035','FRIDAY','Beginning Sounds','WORD_NEBULA_FOUNDATIONS','SOUND_MONSTER','initial_sound','Feed the monster the item that starts with /n/.','phonics/n',NULL,'nest','["vest","nest","best"]','{"phoneme":"/n/","monster":"Nim","targetWord":"nest"}',2,TRUE),

('WN-036','SATURDAY','Simple 2-Letter Words','WORD_NEBULA_FOUNDATIONS','BUILD_ROCKET','token_order','Build the word AN.',NULL,NULL,'AN','["AN","IN","UP"]','{"tokens":["AN","IN","UP"],"targetWord":"AN","slots":1}',1,TRUE),
('WN-037','SATURDAY','Simple 2-Letter Words','WORD_NEBULA_FOUNDATIONS','BUILD_ROCKET','token_order','Build the word IN.',NULL,NULL,'IN','["AN","IN","NO"]','{"tokens":["AN","IN","NO"],"targetWord":"IN","slots":1}',1,TRUE),
('WN-038','SATURDAY','Simple 2-Letter Words','WORD_NEBULA_FOUNDATIONS','BUILD_ROCKET','token_order','Build the word GO.',NULL,NULL,'GO','["GO","TO","ME"]','{"tokens":["GO","TO","ME"],"targetWord":"GO","slots":1}',1,TRUE),
('WN-039','SATURDAY','Simple 2-Letter Words','WORD_NEBULA_FOUNDATIONS','BUILD_ROCKET','token_order','Build the word TO.',NULL,NULL,'TO','["GO","TO","UP"]','{"tokens":["GO","TO","UP"],"targetWord":"TO","slots":1}',1,TRUE),
('WN-040','SATURDAY','Simple 2-Letter Words','WORD_NEBULA_FOUNDATIONS','BUILD_ROCKET','token_order','Build the word AS.',NULL,NULL,'AS','["AS","AN","ME"]','{"tokens":["AS","AN","ME"],"targetWord":"AS","slots":1}',2,TRUE),
('WN-041','SATURDAY','Simple 2-Letter Words','WORD_NEBULA_FOUNDATIONS','BUILD_ROCKET','token_order','Build the word UP.',NULL,NULL,'UP','["UP","IN","TO"]','{"tokens":["UP","IN","TO"],"targetWord":"UP","slots":1}',2,TRUE),
('WN-042','SATURDAY','Simple 2-Letter Words','WORD_NEBULA_FOUNDATIONS','BUILD_ROCKET','token_order','Build the word ME.',NULL,NULL,'ME','["ME","GO","NO"]','{"tokens":["ME","GO","NO"],"targetWord":"ME","slots":1}',2,TRUE),

('WN-043','SUNDAY','Revision Adventure','WORD_NEBULA_FOUNDATIONS','TREASURE_MAZE','mixed_checkpoint','Treasure gate: Which letter says /f/?','phonics/f',NULL,'F','["F","E","A"]','{"checkpoint":"letter_sound","engineKey":"TREASURE_MAZE"}',1,TRUE),
('WN-044','SUNDAY','Revision Adventure','WORD_NEBULA_FOUNDATIONS','TREASURE_MAZE','mixed_checkpoint','Treasure gate: Match M to its small letter.',NULL,NULL,'m','["m","n","w"]','{"checkpoint":"case_match","uppercase":"M"}',1,TRUE),
('WN-045','SUNDAY','Revision Adventure','WORD_NEBULA_FOUNDATIONS','TREASURE_MAZE','mixed_checkpoint','Treasure gate: Choose the word for the picture.',NULL,'assets/word-nebula/ship.png','ship','["shop","ship","shell"]','{"checkpoint":"picture_word","noun":"ship"}',2,TRUE),
('WN-046','SUNDAY','Revision Adventure','WORD_NEBULA_FOUNDATIONS','TREASURE_MAZE','mixed_checkpoint','Treasure gate: Pick the rhyme for star.',NULL,NULL,'car','["car","cat","cup"]','{"checkpoint":"rhyme","anchor":"star","rime":"ar"}',2,TRUE),
('WN-047','SUNDAY','Revision Adventure','WORD_NEBULA_FOUNDATIONS','TREASURE_MAZE','mixed_checkpoint','Treasure gate: Which starts with /b/?','phonics/b',NULL,'bus','["sun","bus","fan"]','{"checkpoint":"initial_sound","phoneme":"/b/"}',2,TRUE),
('WN-048','SUNDAY','Revision Adventure','WORD_NEBULA_FOUNDATIONS','TREASURE_MAZE','mixed_checkpoint','Treasure gate: Arrange the tokens to make NO.',NULL,NULL,'NO','["NO","GO","TO"]','{"checkpoint":"token_order","tokens":["NO","GO","TO"],"targetWord":"NO"}',2,TRUE),
('WN-049','SUNDAY','Revision Adventure','WORD_NEBULA_FOUNDATIONS','TREASURE_MAZE','mixed_checkpoint','Treasure gate: Which word rhymes with light?',NULL,NULL,'kite','["kite","kit","cat"]','{"checkpoint":"rhyme","anchor":"light","rime":"ite"}',3,TRUE),
('WN-050','SUNDAY','Revision Adventure','WORD_NEBULA_FOUNDATIONS','TREASURE_MAZE','mixed_checkpoint','Treasure gate: Match uppercase R to lowercase.',NULL,NULL,'r','["r","n","h"]','{"checkpoint":"case_match","uppercase":"R"}',3,TRUE);

UPDATE word_nebula_questions
SET question_image_url = CASE
  WHEN image_cue IS NOT NULL AND image_cue <> '' THEN CONCAT(
    '/assets/images/word-nebula/cosmic-',
    TRIM(BOTH '-' FROM REGEXP_REPLACE(LOWER(SUBSTRING_INDEX(SUBSTRING_INDEX(image_cue, '/', -1), '.', 1)), '[^a-z0-9]+', '-')),
    '.svg'
  )
  ELSE CONCAT(
    '/assets/images/word-nebula/cosmic-',
    TRIM(BOTH '-' FROM REGEXP_REPLACE(LOWER(REPLACE(answer, '&', ' and ')), '[^a-z0-9]+', '-')),
    '.svg'
  )
END
WHERE id LIKE 'WN-%';
