const fs = require('fs').promises;
const path = require('path');

const STORIES_DIR = path.join(__dirname, '../data/stories');

function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);
}

function pick(arr, idx) {
  return arr[idx % arr.length];
}

// Generate full chapter content based on theme and chapter number
function generateChapterContent(theme, chapterNum, chapterTitle) {
  const contentTemplates = {
    memory: [
      {
        title: "The First Signal",
        content: `The old journal lay open on her desk, its pages yellowed with time. Elena traced her finger along the handwriting—her grandmother's handwriting—feeling the indentations left by years of ink and pressure.\n\n"The past doesn't leave us," she read aloud, her voice barely a whisper in the quiet study. "It nests in our minds like birds returning to the same tree every spring."\n\nElena closed her eyes and tried to remember the last time she had seen her grandmother. The memory came in fragments: the smell of lavender in her garden, the way sunlight filtered through the kitchen window, the sound of her laugh—a sound Elena hadn't heard in fifteen years.\n\nShe turned the page and found a pressed flower, its purple petals brittle but still recognizable. A small note in the margin read: "For Elena, when you're ready to remember."\n\nElena's heart clenched. Ready to remember what? The question hung in the air like dust motes in the afternoon light. She had spent years trying to forget the pain of loss, but here, in this quiet room, the memories came flooding back—not as a burden, but as a gift she hadn't known she needed.\n\nHer grandmother had always said that memories were not about holding on, but about understanding. "We remember," she had written on another page, "not to relive the past, but to honor the moments that shaped us."\n\nElena pulled out a fresh sheet of paper and began to write. She would preserve these memories, not as relics of the past, but as living stories that would continue to shape her future.`
      },
      {
        title: "The Hidden Thread",
        content: `Weeks passed, and Elena found herself returning to the journal every morning. What had started as curiosity had become a ritual, a way of connecting with a woman she had barely known in adulthood.\n\nAs she read deeper, patterns emerged. Her grandmother wrote about the same oak tree in the backyard—how it had survived storms, how its branches had held a swing that generations had used, how it seemed to watch over the family like a silent guardian.\n\n"It's strange," Elena thought, "how we can see the same things and remember them differently." Her grandmother's oak tree was a symbol of resilience and continuity. But when Elena tried to recall it, all she remembered was a vague shape in the distance, something she had taken for granted.\n\nShe decided to visit the old house. The new owners had been kind enough to let her walk the property. When she stood under the oak tree, touching its rough bark, something shifted inside her. Memories she didn't know she had came rushing forward: sitting in its shade while her grandmother read stories, making daisy chains, feeling safe and loved.\n\nThe tree had been there all along, holding memories in its rings, waiting for her to return. "Memory is a thread," her grandmother had written, "that connects us to everything we've been, everything we are, and everything we might become."\n\nElena understood now. The journal wasn't just a record of the past—it was a map of connections, showing her how her grandmother's memories could become her own, how stories passed down could bridge the gap between generations.\n\nShe began to see her own life differently. Every moment was a potential memory, every choice a thread in the larger tapestry of her family's story. The responsibility felt heavy, but also beautiful. She was the keeper of these memories now, and she would honor them by living fully, by creating new memories that would someday be cherished by those who came after.`
      },
      {
        title: "The Exit That Looks Like an Entrance",
        content: `A year later, Elena sat in the same study, but everything had changed. The journal now rested beside her own notebook—a new one she had filled with her own thoughts, her own memories, her own stories.\n\nShe had discovered that memory wasn't just about the past; it was about presence. When she fully engaged with her memories, when she allowed herself to feel the emotions they carried, she found that she could bring her grandmother's wisdom into her daily life.\n\nThe oak tree had become a touchstone for her. Whenever she felt lost or uncertain, she would close her eyes and remember sitting under its branches, feeling the solid ground beneath her, knowing she was part of something larger than herself.\n\nBut here was the real insight: memory wasn't meant to trap her in the past. It was meant to inform her present, to guide her future. Her grandmother's stories weren't just stories—they were lessons, warnings, celebrations, invitations to live more fully.\n\n"The exit that looks like an entrance," Elena wrote in her own journal, "is the realization that we don't move forward by forgetting, but by remembering with intention. We honor the past not by staying there, but by carrying its best parts into every new moment."\n\nShe closed both journals, feeling a sense of completion and new beginning. The memories were hers now—not as a burden, but as a foundation. She would build upon them, add her own chapters, and someday, someone else might discover her words and find the same comfort, the same connection, the same sense of belonging.\n\nMemory, she understood, was circular. It gave her roots to grow from and wings to fly with. And in that paradox lay its greatest gift: the past and the future met in every present moment, making each one richer, deeper, more meaningful.\n\nAs she stood to leave the study, Elena paused at the window. The oak tree was still there, still standing, still holding all the memories in its silent witness. She smiled. Some things remained constant, and that constancy was a comfort—a memory made present, a past made alive.`
      }
    ],
    identity: [
      {
        title: "The First Signal",
        content: `Miriam had spent her entire life trying to be someone else—someone her parents would approve of, someone her teachers would praise, someone her friends would admire. She had collected identities like costumes, switching them on and off depending on who was watching.\n\nBut on this Tuesday afternoon, standing in front of her bathroom mirror, something broke. She looked at her reflection and saw a stranger staring back. "Who am I?" she whispered, and the question echoed in the small space, unanswered.\n\nThe realization came like a slow dawn: she had been so busy performing versions of herself for others that she had lost track of who she actually was when no one was looking. The person in the mirror was a collection of expectations, but beneath all those layers, who was the real Miriam?\n\nShe had always been good at adapting. In high school, she had been the quiet bookworm around her literary friends, the outgoing party-goer with her social circle, the studious achiever with her academic peers. Each version felt authentic in the moment, but together they created a dissonance that left her feeling empty.\n\n"Maybe," she thought, wiping away tears she hadn't noticed falling, "identity isn't something we discover. Maybe it's something we choose, something we build, something we claim."\n\nShe sat on the edge of her bathtub and pulled out her phone. Opening her notes app, she began to list things she knew for certain: she loved rainy mornings with coffee, she cried during sad movies, she had a secret talent for making the perfect scrambled eggs, she felt most herself when she was alone with a good book.\n\nThese small truths felt like anchors in a sea of uncertainty. They were her, undeniably, unchangeably, authentically her. And maybe that was enough—maybe that was everything.`
      },
      {
        title: "The Hidden Thread",
        content: `Over the next month, Miriam began an experiment. She decided to stop performing and start observing. In every situation, she would ask herself: "What do I actually want here? Not what should I want, not what would make others happy, but what do I genuinely want?"\n\nThe answers surprised her. At work, she discovered she enjoyed the collaborative projects more than the solo achievements everyone expected her to prefer. With friends, she found she preferred deep one-on-one conversations over large group gatherings. In her personal time, she realized she didn't actually like the TV shows she had been watching "because everyone else was"—she preferred documentaries and quiet evenings.\n\nBut here was the fascinating part: as she aligned her actions with her authentic preferences, she didn't lose friends or opportunities. Instead, she attracted people who appreciated the real her. Her relationships became deeper because they were built on honesty rather than performance.\n\n"The thread that runs through all my masks," she wrote in her journal one evening, "is my desire for connection. But I've been going about it backwards. I thought I had to become what others wanted to connect with me, when really, connection happens when we show up as ourselves."\n\nShe began to see her various "versions" not as false identities, but as different facets of a whole person. She could be quiet in one context and outgoing in another without being inauthentic—as long as both expressions came from a genuine place within her, not from fear or obligation.\n\nThe hidden thread, she realized, was her core values: authenticity, curiosity, kindness, growth. These remained constant no matter which "version" of herself she was expressing. They were the compass that guided her, the foundation upon which her identity was built.\n\nMiriam started making small changes. She stopped pretending to enjoy things she didn't. She started saying "no" without elaborate excuses. She allowed herself to be uncertain, to be learning, to be in process. And with each authentic choice, she felt more solid, more real, more like herself.`
      },
      {
        title: "The Exit That Looks Like an Entrance",
        content: `Six months later, Miriam looked in the same bathroom mirror and saw someone entirely different. Not because her appearance had changed dramatically, but because she recognized the person looking back at her.\n\nShe had learned that identity wasn't a destination you arrived at, but a practice you engaged in every day. It wasn't about finding your "true self" buried under layers of conditioning—it was about choosing, moment by moment, who you wanted to be.\n\n"The exit," she thought, "is actually the entrance to something real." For so long, she had been trying to exit her various roles and masks, thinking that underneath them all she would find her "real" identity. But that search itself had been another form of performance—the performance of authenticity.\n\nThe breakthrough came when she stopped looking for who she was supposed to be and started asking who she wanted to become. Identity, she realized, was forward-looking. It was about growth, evolution, intentional becoming.\n\nShe had built her identity on a foundation of core values, and now she could explore freely within that framework. She could be complex—introverted in some situations, extroverted in others. She could be serious about her work and playful with her friends. She could change her mind, learn new things, outgrow old preferences—and all of it would be authentically her because it came from genuine experience, not from fear of judgment.\n\nMiriam had discovered that the exit from performance was actually the entrance to possibility. By letting go of who she thought she should be, she had opened up space for who she could become. Her identity was no longer a prison of expectations but a playground of potential.\n\nShe closed her journal with a sense of peace. The question "Who am I?" no longer felt like a crisis. It felt like an invitation—an ongoing conversation with herself, a practice of awareness and choice, a commitment to living authentically in each moment.\n\nAs she left the bathroom, Miriam felt lighter. She wasn't "finding herself"—she was creating herself, one authentic choice at a time. And that felt like the most honest thing she had ever done.`
      }
    ]
  };

  // For themes not in templates, generate generic but meaningful content
  const themes = {
    choice: ["decisions", "consequences", "freedom"],
    time: ["moments", "passage", "presence"],
    silence: ["quiet", "listening", "stillness"],
    promise: ["commitment", "trust", "dedication"],
    truth: ["honesty", "reality", "authenticity"],
    doubt: ["uncertainty", "questioning", "faith"],
    courage: ["bravery", "fear", "action"],
    habit: ["patterns", "consistency", "change"],
    loss: ["grief", "acceptance", "transformation"],
    hope: ["optimism", "possibility", "future"],
    attention: ["focus", "awareness", "mindfulness"],
    pattern: ["repetition", "recognition", "meaning"],
    meaning: ["purpose", "significance", "value"]
  };

  const themeWords = themes[theme] || ["journey", "discovery", "understanding"];
  
  if (contentTemplates[theme] && contentTemplates[theme][chapterNum - 1]) {
    return contentTemplates[theme][chapterNum - 1].content;
  }

  // Generate content for other themes
  const chapterTemplates = {
    1: `The morning light filtered through the curtains as ${chapterTitle.toLowerCase().replace(/the /g, '')} began. It wasn't a dramatic moment—just an ordinary Tuesday—but sometimes the most significant shifts happen in the quiet spaces between one breath and the next.\n\nShe had been grappling with ${themeWords[0]} for weeks, maybe months. The question had started as a whisper in the back of her mind, but now it had grown into something that demanded attention. Every ${themeWords[0]} she made seemed to carry more weight than it should, and she found herself second-guessing decisions that had once felt straightforward.\n\nThe real challenge wasn't making the choice itself—it was understanding what she truly wanted. For so long, she had been operating on autopilot, following patterns laid down by others, living according to expectations that weren't her own.\n\nBut today felt different. Today, as she sat with her coffee cooling on the table beside her, she felt a clarity she hadn't experienced in a long time. It wasn't that the answer was suddenly obvious, but rather that she was finally ready to ask the right questions.\n\n"${theme.charAt(0).toUpperCase() + theme.slice(1)}," she thought, "isn't about finding the perfect solution. It's about understanding what matters most, and having the courage to choose accordingly."\n\nShe picked up her pen and began to write, not knowing where the words would take her, but trusting that the process itself would reveal what she needed to know.`,
    
    2: `Weeks had passed since that morning, and the initial clarity had given way to something more complex. She was learning that ${themeWords[1]} wasn't a linear path but a spiral—returning to the same questions but from a slightly different angle each time.\n\nThe pattern she had noticed in her life wasn't just about ${themeWords[0]}—it was about ${themeWords[1]}. Every decision she made created ripples, affecting not just her immediate circumstances but the way she saw herself and her place in the world.\n\nShe had started keeping a journal, recording not just what she chose but why she chose it. The exercise was revealing. She saw themes emerging—values she held without fully realizing, priorities that guided her even when she thought she was being random.\n\n"There's a thread," she wrote one evening, "that connects all my ${themeWords[0]}. It's not always visible, but when I look back, I can see it—a consistent pattern that reflects who I'm becoming."\n\nUnderstanding this thread didn't make decision-making easier, exactly, but it made it more meaningful. She wasn't just choosing between options; she was choosing who to be, what kind of life to build, what values to honor.\n\nThe ${themeWords[1]} became clearer: every choice was a vote for the person she wanted to become. And with that realization came both freedom and responsibility—freedom to choose intentionally, responsibility to choose wisely.\n\nShe began to see that the choices that felt hardest were often the most important. They forced her to examine her values, to clarify what truly mattered to her, to align her actions with her deepest sense of self.`,
    
    3: `Now, months later, she could see the full picture. The journey through ${themeWords[0]} and ${themeWords[1]} had led her here—to a place of ${themeWords[2]}.\n\nBut here was the unexpected part: the exit looked like an entrance. What she had thought was the end of her struggle was actually the beginning of a new way of being. She had been looking for a destination, a final answer, a point where everything would make sense and all her questions would be resolved.\n\nInstead, she had found a practice—a way of engaging with ${themeWords[0]} that was ongoing, dynamic, alive. There would always be new decisions to make, new patterns to recognize, new understandings to reach. And that wasn't a failure; it was the nature of growth.\n\nThe ${themeWords[2]} she had been seeking wasn't a conclusion but a context. It was the framework within which all her choices made sense, the perspective that allowed her to see her journey as coherent even when individual moments felt chaotic.\n\n"I thought I was looking for answers," she reflected, "but I was really learning how to live with questions. And that's made all the difference."\n\nShe had discovered that ${themeWords[0]} wasn't about finding the perfect path but about walking with awareness. Each step was an opportunity to learn, to grow, to become more fully herself.\n\nThe exit from confusion was the entrance to curiosity. The exit from uncertainty was the entrance to possibility. The exit from seeking was the entrance to presence.\n\nAs she closed her journal, she felt a sense of completion that wasn't finality but integration. She had woven the threads of ${themeWords[0]}, ${themeWords[1]}, and ${themeWords[2]} into a tapestry that told the story of who she was becoming—not as a finished product, but as a work in progress, beautiful in its incompleteness, meaningful in its ongoing creation.`
  };

  return chapterTemplates[chapterNum] || chapterTemplates[1];
}

function makeQuestions(storyId, chapterNum, theme, content) {
  // Generate questions based on actual content and theme
  const questionSets = {
    memory: {
      1: [
        { question: "What object does Elena find in her grandmother's journal that triggers her memories?", answer: "a pressed flower" },
        { question: "What does Elena's grandmother say memories are for?", answer: "understanding" },
        { question: "What feeling does Elena experience when memories flood back?", answer: "gift" }
      ],
      2: [
        { question: "What natural object does Elena's grandmother write about repeatedly?", answer: "oak tree" },
        { question: "What does Elena realize connects her to her grandmother's memories?", answer: "thread" },
        { question: "What emotion does Elena feel when she returns to the oak tree?", answer: "safe" }
      ],
      3: [
        { question: "What does Elena discover memory is meant to inform?", answer: "present" },
        { question: "How does Elena describe memory - as a burden or foundation?", answer: "foundation" },
        { question: "What does Elena realize connects past and future?", answer: "present moment" }
      ]
    },
    identity: {
      1: [
        { question: "What does Miriam see when she looks in the mirror?", answer: "stranger" },
        { question: "What does Miriam list to anchor herself in her true identity?", answer: "small truths" },
        { question: "What does Miriam realize identity might be?", answer: "choice" }
      ],
      2: [
        { question: "What question does Miriam ask herself in every situation?", answer: "what do i want" },
        { question: "What remains constant across all of Miriam's different versions?", answer: "core values" },
        { question: "What does Miriam discover about connection?", answer: "authenticity" }
      ],
      3: [
        { question: "What does Miriam realize identity is not?", answer: "destination" },
        { question: "What does the exit from performance become?", answer: "entrance to possibility" },
        { question: "How does Miriam now see the question 'Who am I?'", answer: "invitation" }
      ]
    }
  };

  if (questionSets[theme] && questionSets[theme][chapterNum]) {
    return questionSets[theme][chapterNum].map((q, idx) => ({
      id: `${storyId}-c${chapterNum}-q${idx + 1}`,
      question: q.question,
      type: 'text',
      answer: q.answer.toLowerCase()
    }));
  }

  // Generic questions based on theme
  const genericQuestions = [
    {
      id: `${storyId}-c${chapterNum}-q1`,
      question: `What is the central theme the character is exploring?`,
      type: 'text',
      answer: theme.toLowerCase()
    },
    {
      id: `${storyId}-c${chapterNum}-q2`,
      question: `What does the character begin to understand about ${theme}?`,
      type: 'text',
      answer: 'practice'
    },
    {
      id: `${storyId}-c${chapterNum}-q3`,
      question: `What realization does the character have at the end?`,
      type: 'text',
      answer: 'growth'
    }
  ];

  return genericQuestions;
}

function makeChapter(storyId, chapterNum, title, theme) {
  const content = generateChapterContent(theme, chapterNum, title);
  
  return {
    chapter: chapterNum,
    title,
    content,
    questions: makeQuestions(storyId, chapterNum, theme, content)
  };
}

function makeStory(i) {
  const n = String(i + 1).padStart(3, '0');

  const topics = [
    'memory',
    'identity',
    'choice',
    'time',
    'silence',
    'promise',
    'truth',
    'doubt',
    'courage',
    'habit',
    'loss',
    'hope',
    'attention',
    'pattern',
    'meaning'
  ];

  const palettes = [
    'Quiet Classics',
    'Modern Reflections',
    'Short Lessons',
    'Fables & Parables',
    'Mind & Method'
  ];

  const chapterTitles = [
    ['The First Signal', 'The Hidden Thread', 'The Exit That Looks Like an Entrance'],
    ['The Beginning', 'The Middle', 'The Understanding'],
    ['Discovery', 'Exploration', 'Integration'],
    ['Awakening', 'Realization', 'Transformation'],
    ['Question', 'Search', 'Answer']
  ];

  const theme = pick(topics, i);
  const shelf = pick(palettes, i);
  const titles = pick(chapterTitles, i);

  const title = `${shelf} • Book ${n}: ${theme[0].toUpperCase() + theme.slice(1)}`;
  const id = `book-${n}-${slugify(theme)}`;
  const difficulty = pick(['easy', 'medium', 'hard'], i);

  const chapters = [
    makeChapter(id, 1, titles[0], theme),
    makeChapter(id, 2, titles[1], theme),
    makeChapter(id, 3, titles[2], theme)
  ];

  return {
    id,
    title,
    description: `A thoughtful exploration of ${theme}: a story about discovering what matters and finding meaning in everyday moments.`,
    difficulty,
    coverImage: '',
    chapters
  };
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  await fs.mkdir(STORIES_DIR, { recursive: true });

  const COUNT = 100;
  let created = 0;
  let skipped = 0;
  let updated = 0;

  console.log('Generating books with full content...');

  for (let i = 0; i < COUNT; i++) {
    const story = makeStory(i);
    const outPath = path.join(STORIES_DIR, `${story.id}.json`);
    
    // Check if file exists and has content
    if (await exists(outPath)) {
      try {
        const existing = JSON.parse(await fs.readFile(outPath, 'utf8'));
        // Check if content is just placeholder
        const firstChapterContent = existing.chapters?.[0]?.content || '';
        if (firstChapterContent.includes('A reader arrives at a quiet turning point') || 
            firstChapterContent.length < 200) {
          // Update existing file with full content
          await fs.writeFile(outPath, JSON.stringify(story, null, 2), 'utf8');
          updated++;
          console.log(`Updated: ${story.id}`);
        } else {
          skipped++;
        }
      } catch (error) {
        // If error reading, recreate the file
        await fs.writeFile(outPath, JSON.stringify(story, null, 2), 'utf8');
        updated++;
        console.log(`Recreated: ${story.id}`);
      }
    } else {
      await fs.writeFile(outPath, JSON.stringify(story, null, 2), 'utf8');
      created++;
      console.log(`Created: ${story.id}`);
    }
  }

  console.log(`\nDone. Created: ${created}, Updated: ${updated}, Skipped: ${skipped}, target_dir: ${STORIES_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
