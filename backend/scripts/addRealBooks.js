const fs = require('fs').promises;
const path = require('path');

const STORIES_DIR = path.join(__dirname, '../data/stories');

// Popular real books with summaries and chapters
const REAL_BOOKS = [
  {
    id: '1984',
    title: '1984',
    author: 'George Orwell',
    description: 'In a totalitarian future society, Winston Smith works at the Ministry of Truth rewriting history. He secretly rebels against the oppressive regime led by Big Brother, falling in love and questioning reality itself.',
    difficulty: 'hard',
    coverImage: '',
    chapters: [
      {
        chapter: 1,
        title: 'The Ministry of Truth',
        content: 'Winston Smith works at the Ministry of Truth in Oceania, one of three superstates constantly at war. His job is to rewrite historical documents to match the Party\'s current version of truth. Winston lives in a world where the government, led by Big Brother, watches everyone through telescreens. He secretly hates the Party and begins writing forbidden thoughts in a diary, which is an act of rebellion punishable by death. Winston knows that thoughtcrime does not entail death: thoughtcrime IS death.',
        questions: [
          { id: 'q1-1', question: 'Where does Winston Smith work?', type: 'text', answer: 'Ministry of Truth' },
          { id: 'q1-2', question: 'What is Winston\'s job?', type: 'text', answer: 'to rewrite historical documents' },
          { id: 'q1-3', question: 'Who is the leader of the Party?', type: 'text', answer: 'Big Brother' },
          { id: 'q1-4', question: 'What forbidden act does Winston commit?', type: 'text', answer: 'writing in a diary' }
        ]
      },
      {
        chapter: 2,
        title: 'Julia',
        content: 'Winston meets Julia, a fellow worker. At first, he thinks she is a spy for the Thought Police. However, Julia secretly passes him a note saying "I love you." They begin a forbidden love affair. Julia is more practical than Winston; she rebels against the Party by indulging in personal pleasures rather than intellectual resistance. They rent a room above Mr. Charrington\'s antique shop as a hideaway. Winston believes that love and personal relationships are the ultimate rebellion against the Party.',
        questions: [
          { id: 'q2-1', question: 'Who passes Winston a note?', type: 'text', answer: 'Julia' },
          { id: 'q2-2', question: 'What does Julia\'s note say?', type: 'text', answer: 'I love you' },
          { id: 'q2-3', question: 'Where do Winston and Julia meet secretly?', type: 'text', answer: 'a room above Mr. Charrington\'s antique shop' },
          { id: 'q2-4', question: 'How does Julia rebel against the Party?', type: 'text', answer: 'by indulging in personal pleasures' }
        ]
      },
      {
        chapter: 3,
        title: 'O\'Brien and the Brotherhood',
        content: 'Winston believes that O\'Brien, an Inner Party member, is secretly against the Party. O\'Brien invites Winston to his home and introduces him to the Brotherhood, a legendary resistance group. O\'Brien gives Winston a book written by Emmanuel Goldstein, the supposed enemy of the state. Winston and Julia read the book, which explains how the Party maintains power through perpetual war, manipulation of language (Newspeak), and control of the past.',
        questions: [
          { id: 'q3-1', question: 'Who invites Winston to his home?', type: 'text', answer: 'O\'Brien' },
          { id: 'q3-2', question: 'What is the Brotherhood?', type: 'text', answer: 'a legendary resistance group' },
          { id: 'q3-3', question: 'Who wrote the book O\'Brien gives Winston?', type: 'text', answer: 'Emmanuel Goldstein' },
          { id: 'q3-4', question: 'What does Newspeak do?', type: 'text', answer: 'manipulates language to control thought' }
        ]
      },
      {
        chapter: 4,
        title: 'The Betrayal',
        content: 'Winston and Julia are arrested by the Thought Police. It turns out that Mr. Charrington, the shop owner, is a member of the Thought Police, and their hideaway was under surveillance the entire time. O\'Brien was never a member of the Brotherhood—he was testing Winston all along. Winston is taken to the Ministry of Love, where he is tortured and brainwashed. O\'Brien personally oversees Winston\'s re-education, using physical pain and psychological manipulation.',
        questions: [
          { id: 'q4-1', question: 'Who arrests Winston and Julia?', type: 'text', answer: 'the Thought Police' },
          { id: 'q4-2', question: 'What is Mr. Charrington\'s real identity?', type: 'text', answer: 'a member of the Thought Police' },
          { id: 'q4-3', question: 'Was O\'Brien really in the Brotherhood?', type: 'text', answer: 'no' },
          { id: 'q4-4', question: 'Where is Winston taken?', type: 'text', answer: 'the Ministry of Love' }
        ]
      },
      {
        chapter: 5,
        title: 'Room 101',
        content: 'Winston is taken to Room 101, where prisoners face their worst fear. For Winston, it is rats. O\'Brien places a cage of starving rats on Winston\'s face. In terror, Winston begs them to torture Julia instead. This final betrayal breaks Winston completely. He is released, a shell of his former self. In the end, Winston sits in a café, loving Big Brother. He has been fully converted. The Party has won.',
        questions: [
          { id: 'q5-1', question: 'What is Room 101?', type: 'text', answer: 'a place where prisoners face their worst fear' },
          { id: 'q5-2', question: 'What is Winston\'s worst fear?', type: 'text', answer: 'rats' },
          { id: 'q5-3', question: 'Who does Winston betray?', type: 'text', answer: 'Julia' },
          { id: 'q5-4', question: 'How does the book end?', type: 'text', answer: 'Winston loves Big Brother' },
          { id: 'q5-5', question: 'Who wins in the end?', type: 'text', answer: 'the Party' }
        ]
      }
    ]
  },
  {
    id: 'to-kill-a-mockingbird',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    description: 'Scout Finch grows up in Depression-era Alabama as her father, attorney Atticus Finch, defends a black man falsely accused of rape. A powerful story about justice, prejudice, and moral courage.',
    difficulty: 'medium',
    coverImage: '',
    chapters: [
      {
        chapter: 1,
        title: 'Scout and Jem',
        content: 'Scout Finch lives in the small town of Maycomb, Alabama, with her older brother Jem and their father Atticus, a lawyer. Their mother died when Scout was young. The children are fascinated by their mysterious neighbor, Boo Radley, who never leaves his house. The neighborhood children dare each other to approach the Radley house. Scout, Jem, and their friend Dill spend their summer creating stories about Boo and trying to catch a glimpse of him.',
        questions: [
          { id: 'q1-1', question: 'Where does Scout live?', type: 'text', answer: 'Maycomb, Alabama' },
          { id: 'q1-2', question: 'What is Scout\'s father\'s profession?', type: 'text', answer: 'lawyer' },
          { id: 'q1-3', question: 'Who is the mysterious neighbor?', type: 'text', answer: 'Boo Radley' },
          { id: 'q1-4', question: 'What is Scout\'s brother\'s name?', type: 'text', answer: 'Jem' }
        ]
      },
      {
        chapter: 2,
        title: 'The Trial',
        content: 'Atticus is appointed to defend Tom Robinson, a black man accused of raping Mayella Ewell, a white woman. Despite the evidence proving Tom\'s innocence, the all-white jury finds him guilty because of racial prejudice. Atticus demonstrates Tom\'s disability that would have made the crime impossible, and exposes the Ewells\' lies. The children watch from the colored balcony and witness injustice firsthand. Atticus teaches them that real courage is fighting for what\'s right even when you know you\'ll lose.',
        questions: [
          { id: 'q2-1', question: 'Who is Atticus defending?', type: 'text', answer: 'Tom Robinson' },
          { id: 'q2-2', question: 'What is Tom accused of?', type: 'text', answer: 'raping Mayella Ewell' },
          { id: 'q2-3', question: 'What is the verdict?', type: 'text', answer: 'guilty' },
          { id: 'q2-4', question: 'What does Atticus teach about courage?', type: 'text', answer: 'fighting for what\'s right even when you know you\'ll lose' }
        ]
      },
      {
        chapter: 3,
        title: 'Bob Ewell\'s Revenge',
        content: 'Bob Ewell, Mayella\'s father, is humiliated by Atticus in court. He threatens Atticus and spits in his face. Atticus remains dignified, but Ewell seeks revenge. Tom Robinson is killed while trying to escape prison. On Halloween night, Ewell attacks Scout and Jem as they walk home from a school pageant. In the darkness, someone rescues the children. Jem\'s arm is broken in the struggle.',
        questions: [
          { id: 'q3-1', question: 'Who threatens Atticus?', type: 'text', answer: 'Bob Ewell' },
          { id: 'q3-2', question: 'What happens to Tom Robinson?', type: 'text', answer: 'he is killed while trying to escape prison' },
          { id: 'q3-3', question: 'When does Ewell attack the children?', type: 'text', answer: 'Halloween night' },
          { id: 'q3-4', question: 'What injury does Jem suffer?', type: 'text', answer: 'broken arm' }
        ]
      },
      {
        chapter: 4,
        title: 'Boo Radley Emerges',
        content: 'The person who rescued Scout and Jem was Boo Radley. In the struggle, Boo killed Bob Ewell to protect the children. Sheriff Tate decides to report that Ewell fell on his own knife, protecting Boo from unwanted attention. Scout finally meets Boo and walks him home. Standing on the Radley porch, Scout sees the neighborhood from Boo\'s perspective, understanding at last what Atticus meant about walking in someone else\'s shoes.',
        questions: [
          { id: 'q4-1', question: 'Who rescued the children?', type: 'text', answer: 'Boo Radley' },
          { id: 'q4-2', question: 'What happened to Bob Ewell?', type: 'text', answer: 'Boo killed him' },
          { id: 'q4-3', question: 'What does Sheriff Tate report?', type: 'text', answer: 'that Ewell fell on his own knife' },
          { id: 'q4-4', question: 'What does Scout understand at the end?', type: 'text', answer: 'walking in someone else\'s shoes' }
        ]
      },
      {
        chapter: 5,
        title: 'Lessons Learned',
        content: 'Scout reflects on the events of the past years. She has learned that most people are good once you get to know them, but that prejudice and fear can make people do terrible things. Atticus taught her to stand up for justice even when it\'s unpopular. She learned that Boo Radley was a kind, protective person, not the monster the children imagined. Scout has grown from a naive child into someone who understands the complexity of human nature and the importance of compassion.',
        questions: [
          { id: 'q5-1', question: 'What has Scout learned about people?', type: 'text', answer: 'most people are good once you get to know them' },
          { id: 'q5-2', question: 'What did Atticus teach Scout?', type: 'text', answer: 'to stand up for justice even when it\'s unpopular' },
          { id: 'q5-3', question: 'What kind of person was Boo Radley?', type: 'text', answer: 'kind and protective' },
          { id: 'q5-4', question: 'What does Scout understand about human nature?', type: 'text', answer: 'its complexity' },
          { id: 'q5-5', question: 'What important value does the book teach?', type: 'text', answer: 'compassion' }
        ]
      }
    ]
  },
  {
    id: 'the-catcher-in-the-rye',
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    description: 'Holden Caulfield, a teenager expelled from prep school, spends three days in New York City questioning phoniness, searching for authenticity, and struggling with growing up.',
    difficulty: 'medium',
    coverImage: '',
    chapters: [
      {
        chapter: 1,
        title: 'Expelled from Pencey',
        content: 'Holden Caulfield, a sixteen-year-old, has been expelled from Pencey Prep, his fourth school. He stands alone on a hill watching a football game, feeling disconnected from his peers. Holden is cynical and critical of the "phony" world around him. He visits his history teacher, Mr. Spencer, who lectures him about his poor performance. Holden respects him but can\'t stand the lecture. He mentions his younger brother Allie, who died of leukemia and was the smartest and nicest person Holden ever knew.',
        questions: [
          { id: 'q1-1', question: 'Why was Holden expelled from Pencey?', type: 'text', answer: 'poor academic performance' },
          { id: 'q1-2', question: 'How many schools has Holden been expelled from?', type: 'text', answer: 'four' },
          { id: 'q1-3', question: 'What word does Holden use to describe people he doesn\'t like?', type: 'text', answer: 'phony' },
          { id: 'q1-4', question: 'What happened to Holden\'s brother Allie?', type: 'text', answer: 'he died of leukemia' }
        ]
      },
      {
        chapter: 2,
        title: 'Leaving Pencey',
        content: 'Holden returns to his dorm where his obnoxious roommate Stradlater asks him to write an English composition. Stradlater is going on a date with Jane Gallagher, a girl Holden knows and cares about. Holden becomes upset thinking about Stradlater with Jane. He writes the composition about Allie\'s baseball glove, which had poems written on it. Stradlater criticizes the essay for being off-topic. They fight, and Holden gets a bloody nose. Feeling dejected, Holden decides to leave Pencey that night instead of waiting until Christmas break.',
        questions: [
          { id: 'q2-1', question: 'Who is Holden\'s roommate?', type: 'text', answer: 'Stradlater' },
          { id: 'q2-2', question: 'Who is Stradlater going on a date with?', type: 'text', answer: 'Jane Gallagher' },
          { id: 'q2-3', question: 'What does Holden write about in his composition?', type: 'text', answer: 'Allie\'s baseball glove' },
          { id: 'q2-4', question: 'When does Holden decide to leave?', type: 'text', answer: 'that night' }
        ]
      },
      {
        chapter: 3,
        title: 'New York City',
        content: 'Holden takes a train to New York City but doesn\'t want to go home yet. He checks into a hotel and observes the "perverts" in other rooms. He goes to a nightclub and dances with some tourists. He calls an old friend, Sally Hayes, and makes a date. Holden feels lonely and depressed. He agrees to have a prostitute sent to his room but then doesn\'t want to go through with it. The pimp, Maurice, beats him up and takes extra money. Holden fantasizes about being shot.',
        questions: [
          { id: 'q3-1', question: 'Where does Holden go after leaving Pencey?', type: 'text', answer: 'New York City' },
          { id: 'q3-2', question: 'Who does Holden call and make a date with?', type: 'text', answer: 'Sally Hayes' },
          { id: 'q3-3', question: 'What does Holden agree to but then backs out of?', type: 'text', answer: 'seeing a prostitute' },
          { id: 'q3-4', question: 'Who beats Holden up?', type: 'text', answer: 'Maurice the pimp' }
        ]
      },
      {
        chapter: 4,
        title: 'Phoebe',
        content: 'Holden sneaks into his parents\' apartment to see his little sister Phoebe, whom he adores. Phoebe realizes he\'s been expelled again and gets upset. Holden tells her about his dream of being "the catcher in the rye"—standing in a field of rye catching children before they fall off a cliff, saving them from losing their innocence. Phoebe gives Holden her Christmas money. Holden decides to run away out West, but Phoebe insists on coming with him. Holden can\'t let her throw her life away.',
        questions: [
          { id: 'q4-1', question: 'Who is Phoebe?', type: 'text', answer: 'Holden\'s little sister' },
          { id: 'q4-2', question: 'What does Holden dream of being?', type: 'text', answer: 'the catcher in the rye' },
          { id: 'q4-3', question: 'What does Phoebe give Holden?', type: 'text', answer: 'her Christmas money' },
          { id: 'q4-4', question: 'Where does Holden plan to run away to?', type: 'text', answer: 'out West' }
        ]
      },
      {
        chapter: 5,
        title: 'The Carousel',
        content: 'Holden takes Phoebe to the zoo and watches her ride the carousel. She reaches for the gold ring, and Holden resists the urge to stop her, realizing kids need to reach for things themselves, even if they might fall. Watching Phoebe happy on the carousel, Holden feels overwhelmed with happiness. It starts raining, but he doesn\'t care. He decides not to run away. The story ends with Holden in some kind of rest home or hospital, telling us this story. He says he misses everybody, even the people he complained about, and hints he might do better when he returns to school.',
        questions: [
          { id: 'q5-1', question: 'Where does Holden take Phoebe?', type: 'text', answer: 'the zoo' },
          { id: 'q5-2', question: 'What does Phoebe ride?', type: 'text', answer: 'the carousel' },
          { id: 'q5-3', question: 'What does Holden realize about kids?', type: 'text', answer: 'they need to reach for things themselves, even if they might fall' },
          { id: 'q5-4', question: 'Does Holden run away?', type: 'text', answer: 'no' },
          { id: 'q5-5', question: 'Where is Holden when he tells this story?', type: 'text', answer: 'in a rest home or hospital' }
        ]
      }
    ]
  }
];

async function addRealBooks() {
  try {
    console.log('📚 Adding real books to library...\n');
    
    for (const book of REAL_BOOKS) {
      const filePath = path.join(STORIES_DIR, `${book.id}.json`);
      
      // Check if book already exists
      try {
        await fs.access(filePath);
        console.log(`⏭️  "${book.title}" already exists, skipping...`);
        continue;
      } catch (error) {
        // File doesn't exist, create it
      }
      
      await fs.writeFile(filePath, JSON.stringify(book, null, 2), 'utf-8');
      console.log(`✅ Added "${book.title}" by ${book.author}`);
    }
    
    console.log(`\n🎉 Successfully added ${REAL_BOOKS.length} real books!`);
    console.log('\n📖 Books added:');
    REAL_BOOKS.forEach(book => {
      console.log(`   - ${book.title} by ${book.author} (${book.difficulty}) - ${book.chapters.length} chapters`);
    });
    
  } catch (error) {
    console.error('❌ Error adding books:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  addRealBooks();
}

module.exports = { addRealBooks, REAL_BOOKS };
