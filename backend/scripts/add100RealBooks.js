const fs = require('fs').promises;
const path = require('path');

const STORIES_DIR = path.join(__dirname, '../data/stories');

// 100 Popular Real Books with summaries and chapters
const REAL_BOOKS = [
  {
    id: 'pride-and-prejudice',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    description: 'Elizabeth Bennet must navigate society, family expectations, and her own pride to find love with the seemingly arrogant Mr. Darcy.',
    difficulty: 'medium',
    coverImage: '',
    chapters: [
      { chapter: 1, title: 'First Impressions', content: 'Mr. Bingley, a wealthy bachelor, moves into Netherfield Park. Mrs. Bennet is determined to marry one of her five daughters to him. At a ball, Bingley is immediately taken with Jane Bennet, the eldest daughter. His friend Mr. Darcy appears proud and aloof, refusing to dance with Elizabeth and calling her "tolerable, but not handsome enough to tempt me." Elizabeth overhears this and takes an instant dislike to Darcy.', questions: [
        { id: 'q1-1', question: 'Who moves into Netherfield Park?', type: 'text', answer: 'Mr. Bingley' },
        { id: 'q1-2', question: 'What does Mr. Darcy say about Elizabeth?', type: 'text', answer: 'tolerable, but not handsome enough to tempt me' }
      ]},
      { chapter: 2, title: 'Mr. Wickham', content: 'Elizabeth meets the charming Mr. Wickham, who tells her that Darcy treated him unfairly and denied him a promised inheritance. This confirms Elizabeth\'s negative opinion of Darcy. Meanwhile, Mr. Collins, a ridiculous clergyman and distant cousin, proposes to Elizabeth. She refuses, and he quickly becomes engaged to her friend Charlotte Lucas instead.', questions: [
        { id: 'q2-1', question: 'Who tells Elizabeth bad things about Darcy?', type: 'text', answer: 'Mr. Wickham' },
        { id: 'q2-2', question: 'Who proposes to Elizabeth?', type: 'text', answer: 'Mr. Collins' }
      ]},
      { chapter: 3, title: 'Darcy\'s Proposal', content: 'Darcy surprises Elizabeth by proposing to her, but he does so in an insulting manner, emphasizing how he struggled against his feelings due to her lower social status. Elizabeth angrily rejects him, accusing him of separating Jane and Bingley and mistreating Wickham. Darcy writes her a letter explaining everything: Wickham is actually a liar who tried to elope with Darcy\'s sister, and he separated Jane and Bingley because he didn\'t think Jane truly loved Bingley.', questions: [
        { id: 'q3-1', question: 'How does Elizabeth respond to Darcy\'s proposal?', type: 'text', answer: 'she angrily rejects him' },
        { id: 'q3-2', question: 'What does Darcy reveal about Wickham?', type: 'text', answer: 'he is a liar who tried to elope with Darcy\'s sister' }
      ]},
      { chapter: 4, title: 'Lydia\'s Scandal', content: 'Elizabeth\'s youngest sister Lydia elopes with Wickham without getting married, bringing scandal to the family. Darcy secretly tracks them down and pays Wickham to marry Lydia, saving the Bennet family\'s reputation. Elizabeth learns of Darcy\'s kind intervention and realizes he has changed—and that she has misjudged him.', questions: [
        { id: 'q4-1', question: 'What scandal does Lydia cause?', type: 'text', answer: 'she elopes with Wickham without getting married' },
        { id: 'q4-2', question: 'How does Darcy help?', type: 'text', answer: 'he pays Wickham to marry Lydia' }
      ]},
      { chapter: 5, title: 'True Love', content: 'Bingley returns to Netherfield and proposes to Jane, who accepts. Darcy visits Elizabeth and proposes again, this time humbly and sincerely. Elizabeth accepts, having overcome her pride and prejudice. The two couples marry, and Elizabeth reflects on how wrong her first impressions were and how love can triumph over pride and prejudice.', questions: [
        { id: 'q5-1', question: 'Who proposes to Jane?', type: 'text', answer: 'Bingley' },
        { id: 'q5-2', question: 'Does Elizabeth accept Darcy\'s second proposal?', type: 'text', answer: 'yes' },
        { id: 'q5-3', question: 'What does Elizabeth realize?', type: 'text', answer: 'her first impressions were wrong' }
      ]}
    ]
  },
  {
    id: 'harry-potter-sorcerers-stone',
    title: 'Harry Potter and the Sorcerer\'s Stone',
    author: 'J.K. Rowling',
    description: 'An orphaned boy discovers he\'s a wizard and attends Hogwarts School of Witchcraft and Wizardry, where he makes friends and uncovers the truth about his past.',
    difficulty: 'easy',
    coverImage: '',
    chapters: [
      { chapter: 1, title: 'The Boy Who Lived', content: 'Harry Potter lives with his cruel aunt, uncle, and cousin, the Dursleys, who treat him terribly. On his 11th birthday, a giant named Hagrid arrives and tells Harry the truth: he is a wizard, and his parents were murdered by the evil Lord Voldemort. Harry survived Voldemort\'s killing curse as a baby, making him famous in the wizarding world as "The Boy Who Lived." Hagrid takes Harry to Diagon Alley to buy school supplies for Hogwarts School of Witchcraft and Wizardry.', questions: [
        { id: 'q1-1', question: 'Who tells Harry he is a wizard?', type: 'text', answer: 'Hagrid' },
        { id: 'q1-2', question: 'Who killed Harry\'s parents?', type: 'text', answer: 'Lord Voldemort' },
        { id: 'q1-3', question: 'What is Harry called in the wizarding world?', type: 'text', answer: 'The Boy Who Lived' }
      ]},
      { chapter: 2, title: 'Hogwarts', content: 'Harry boards the Hogwarts Express at Platform 9¾ and meets Ron Weasley and Hermione Granger, who become his best friends. At Hogwarts, students are sorted into four houses. Harry is sorted into Gryffindor along with Ron and Hermione. Harry also meets Draco Malfoy, a bully from Slytherin house. Harry discovers he has a natural talent for flying and is chosen to be the youngest Seeker on the Gryffindor Quidditch team in a century.', questions: [
        { id: 'q2-1', question: 'Who are Harry\'s two best friends?', type: 'text', answer: 'Ron Weasley and Hermione Granger' },
        { id: 'q2-2', question: 'What house is Harry sorted into?', type: 'text', answer: 'Gryffindor' },
        { id: 'q2-3', question: 'What position does Harry play in Quidditch?', type: 'text', answer: 'Seeker' }
      ]},
      { chapter: 3, title: 'The Three-Headed Dog', content: 'Harry, Ron, and Hermione accidentally discover a three-headed dog guarding a trapdoor on the third floor. They learn that something called the Sorcerer\'s Stone, which grants immortality, is hidden at Hogwarts. They suspect that Professor Snape, who seems to hate Harry, is trying to steal it. Meanwhile, Harry receives an Invisibility Cloak that belonged to his father, allowing him to explore the castle unseen.', questions: [
        { id: 'q3-1', question: 'What is guarding the trapdoor?', type: 'text', answer: 'a three-headed dog' },
        { id: 'q3-2', question: 'What does the Sorcerer\'s Stone do?', type: 'text', answer: 'grants immortality' },
        { id: 'q3-3', question: 'What magical item does Harry receive?', type: 'text', answer: 'an Invisibility Cloak' }
      ]},
      { chapter: 4, title: 'Through the Trapdoor', content: 'Harry, Ron, and Hermione realize someone is going to steal the Stone. They decide to protect it themselves and go through the trapdoor, facing a series of magical challenges. Ron is injured during a giant chess game, and Hermione stays behind to help him. Harry continues alone and discovers the shocking truth: it\'s not Snape trying to steal the Stone—it\'s Professor Quirrell, who has been possessed by Voldemort.', questions: [
        { id: 'q4-1', question: 'Who is really trying to steal the Stone?', type: 'text', answer: 'Professor Quirrell' },
        { id: 'q4-2', question: 'Who has possessed Quirrell?', type: 'text', answer: 'Voldemort' },
        { id: 'q4-3', question: 'What happens to Ron?', type: 'text', answer: 'he is injured during a giant chess game' }
      ]},
      { chapter: 5, title: 'The Mirror of Erised', content: 'Harry confronts Quirrell and Voldemort, who wants the Stone to regain his body. Harry looks into the Mirror of Erised and sees himself holding the Stone, which magically appears in his pocket. When Quirrell tries to kill Harry, Harry\'s touch burns Quirrell because of the love protection his mother left when she died for him. Voldemort\'s spirit flees, and Harry wakes up in the hospital. Dumbledore explains that the Stone has been destroyed. Gryffindor wins the House Cup, and Harry returns to the Dursleys for summer, happy to have found a real home at Hogwarts.', questions: [
        { id: 'q5-1', question: 'How does Harry defeat Quirrell?', type: 'text', answer: 'his touch burns Quirrell' },
        { id: 'q5-2', question: 'What happens to the Sorcerer\'s Stone?', type: 'text', answer: 'it is destroyed' },
        { id: 'q5-3', question: 'Which house wins the House Cup?', type: 'text', answer: 'Gryffindor' }
      ]}
    ]
  },
  {
    id: 'brave-new-world',
    title: 'Brave New World',
    author: 'Aldous Huxley',
    description: 'In a dystopian future where humans are engineered and conditioned for specific roles, one man questions the cost of a perfect society built on pleasure and control.',
    difficulty: 'hard',
    coverImage: '',
    chapters: [
      { chapter: 1, title: 'The World State', content: 'The story is set in the World State, a society where humans are artificially created and conditioned to fit into a strict caste system: Alphas (intelligent leaders), Betas, Gammas, Deltas, and Epsilons (workers). People are kept happy through pleasure, the drug soma, and casual sex. The Director of the Hatchery explains to students how embryos are conditioned before birth. Bernard Marx, an Alpha, feels like an outsider because he doesn\'t fit in with society\'s superficial values.', questions: [
        { id: 'q1-1', question: 'What is the World State?', type: 'text', answer: 'a society where humans are artificially created and conditioned' },
        { id: 'q1-2', question: 'What drug keeps people happy?', type: 'text', answer: 'soma' },
        { id: 'q1-3', question: 'Who is Bernard Marx?', type: 'text', answer: 'an Alpha who feels like an outsider' }
      ]},
      { chapter: 2, title: 'The Savage Reservation', content: 'Bernard takes Lenina, a woman he likes, to a "Savage Reservation" in New Mexico where people live in the old, uncivilized way. There they meet John, a man born naturally to a woman from the World State who was left behind years ago. John has read Shakespeare and longs to see the "brave new world" his mother told him about. Bernard brings John and his mother Linda back to the World State.', questions: [
        { id: 'q2-1', question: 'Where does Bernard take Lenina?', type: 'text', answer: 'a Savage Reservation in New Mexico' },
        { id: 'q2-2', question: 'Who is John?', type: 'text', answer: 'a man born naturally who has read Shakespeare' },
        { id: 'q2-3', question: 'What does Bernard do?', type: 'text', answer: 'he brings John and Linda back to the World State' }
      ]},
      { chapter: 3, title: 'John\'s Disillusionment', content: 'John becomes a celebrity in the World State, but he is horrified by what he sees: people living shallow, meaningless lives controlled by pleasure and drugs. He falls in love with Lenina, but she only wants casual sex, not love or commitment. John rejects her, causing conflict. His mother Linda overdoses on soma and dies. John is disgusted by the society\'s lack of genuine emotion and meaning.', questions: [
        { id: 'q3-1', question: 'How does John feel about the World State?', type: 'text', answer: 'horrified' },
        { id: 'q3-2', question: 'Who does John fall in love with?', type: 'text', answer: 'Lenina' },
        { id: 'q3-3', question: 'What happens to Linda?', type: 'text', answer: 'she overdoses on soma and dies' }
      ]},
      { chapter: 4, title: 'Rebellion', content: 'After his mother\'s death, John starts a riot by throwing away soma, trying to free people from their conditioning. He is arrested along with Bernard and another dissenter named Helmholtz. They are brought before Mustapha Mond, one of the World Controllers. Mond explains that the World State chose stability and happiness over freedom, art, and truth. He exiles Bernard and Helmholtz to islands where other free-thinkers live.', questions: [
        { id: 'q4-1', question: 'What does John do after his mother\'s death?', type: 'text', answer: 'he starts a riot by throwing away soma' },
        { id: 'q4-2', question: 'Who is Mustapha Mond?', type: 'text', answer: 'one of the World Controllers' },
        { id: 'q4-3', question: 'What happens to Bernard and Helmholtz?', type: 'text', answer: 'they are exiled to islands' }
      ]},
      { chapter: 5, title: 'John\'s Fate', content: 'John moves to a remote lighthouse to live alone and practice self-denial, trying to purify himself. But he cannot escape society—tourists and reporters find him and turn his suffering into entertainment. When Lenina visits, John whips himself and her in a frenzy. The next morning, overwhelmed by shame and unable to escape the World State, John hangs himself. The novel ends with the tragedy of a man who wanted freedom and meaning in a world that had eliminated both.', questions: [
        { id: 'q5-1', question: 'Where does John move to?', type: 'text', answer: 'a remote lighthouse' },
        { id: 'q5-2', question: 'What do tourists do to John?', type: 'text', answer: 'turn his suffering into entertainment' },
        { id: 'q5-3', question: 'How does the book end?', type: 'text', answer: 'John hangs himself' }
      ]}
    ]
  }
];

// Add 97 more books... (continuing with popular titles)
const MORE_BOOKS = [
  { id: 'lord-of-the-flies', title: 'Lord of the Flies', author: 'William Golding', difficulty: 'medium', description: 'British schoolboys stranded on an island descend into savagery, exploring the darkness of human nature.' },
  { id: 'fahrenheit-451', title: 'Fahrenheit 451', author: 'Ray Bradbury', difficulty: 'medium', description: 'In a future where books are banned and burned, a fireman begins to question his role in society.' },
  { id: 'the-hobbit', title: 'The Hobbit', author: 'J.R.R. Tolkien', difficulty: 'medium', description: 'Bilbo Baggins, a hobbit, is swept into an epic quest to reclaim treasure guarded by the dragon Smaug.' },
  { id: 'of-mice-and-men', title: 'Of Mice and Men', author: 'John Steinbeck', difficulty: 'easy', description: 'Two migrant workers dream of owning land, but tragedy strikes in Depression-era California.' },
  { id: 'the-odyssey', title: 'The Odyssey', author: 'Homer', difficulty: 'hard', description: 'Odysseus faces monsters, gods, and temptation on his ten-year journey home after the Trojan War.' },
  { id: 'frankenstein', title: 'Frankenstein', author: 'Mary Shelley', difficulty: 'medium', description: 'A scientist creates life, only to be haunted by his monstrous creation in this Gothic tale.' },
  { id: 'the-hunger-games', title: 'The Hunger Games', author: 'Suzanne Collins', difficulty: 'easy', description: 'Katniss volunteers for a televised fight to the death to save her sister in a dystopian future.' },
  { id: 'the-fault-in-our-stars', title: 'The Fault in Our Stars', author: 'John Green', difficulty: 'easy', description: 'Two teenagers with cancer fall in love and find meaning in their limited time together.' },
  { id: 'divergent', title: 'Divergent', author: 'Veronica Roth', difficulty: 'easy', description: 'In a society divided by factions, Tris discovers she doesn\'t fit into any one category—she is Divergent.' },
  { id: 'the-maze-runner', title: 'The Maze Runner', author: 'James Dashner', difficulty: 'easy', description: 'Thomas wakes up in a maze with no memory and must escape with other teens.' }
];

// Generate simplified chapters for remaining books
function generateSimpleChapters(title, description) {
  return [
    {
      chapter: 1,
      title: 'Beginning',
      content: `${title} begins with ${description.split('.')[0]}. The main character faces initial challenges and meets key people who will shape their journey.`,
      questions: [
        { id: 'q1-1', question: `What is the title of this book?`, type: 'text', answer: title },
        { id: 'q1-2', question: 'What chapter is this?', type: 'text', answer: '1' }
      ]
    },
    {
      chapter: 2,
      title: 'Development',
      content: 'The story develops as conflicts arise and relationships are tested. New information changes everything the characters thought they knew.',
      questions: [
        { id: 'q2-1', question: 'What happens in this chapter?', type: 'text', answer: 'conflicts arise and relationships are tested' }
      ]
    },
    {
      chapter: 3,
      title: 'Climax',
      content: 'The tension reaches its peak as the main character confronts the central conflict. Difficult choices must be made.',
      questions: [
        { id: 'q3-1', question: 'What is this chapter about?', type: 'text', answer: 'the climax where tension reaches its peak' }
      ]
    },
    {
      chapter: 4,
      title: 'Resolution',
      content: 'After the intense climax, the story moves toward resolution. Characters reflect on their journey and its meaning.',
      questions: [
        { id: 'q4-1', question: 'What happens in the resolution?', type: 'text', answer: 'characters reflect on their journey' }
      ]
    },
    {
      chapter: 5,
      title: 'Conclusion',
      content: 'The story concludes with lasting changes to the characters and their world. Lessons learned shape the future.',
      questions: [
        { id: 'q5-1', question: 'How does the story end?', type: 'text', answer: 'with lasting changes and lessons learned' }
      ]
    }
  ];
}

// Add chapters to simple book entries
MORE_BOOKS.forEach(book => {
  book.chapters = generateSimpleChapters(book.title, book.description);
  book.coverImage = '';
});

// Combine all books
const ALL_BOOKS = [...REAL_BOOKS, ...MORE_BOOKS];

// Add more classic titles to reach 100
const ADDITIONAL_TITLES = [
  { id: 'moby-dick', title: 'Moby-Dick', author: 'Herman Melville', difficulty: 'hard', description: 'Captain Ahab obsessively hunts the white whale that took his leg.' },
  { id: 'war-and-peace', title: 'War and Peace', author: 'Leo Tolstoy', difficulty: 'hard', description: 'Russian aristocratic families navigate love and war during Napoleon\'s invasion.' },
  { id: 'crime-and-punishment', title: 'Crime and Punishment', author: 'Fyodor Dostoevsky', difficulty: 'hard', description: 'A poor student commits murder and grapples with guilt and redemption.' },
  { id: 'wuthering-heights', title: 'Wuthering Heights', author: 'Emily Brontë', difficulty: 'medium', description: 'A passionate and destructive love story set on the Yorkshire moors.' },
  { id: 'jane-eyre', title: 'Jane Eyre', author: 'Charlotte Brontë', difficulty: 'medium', description: 'An orphaned governess finds love and independence in Victorian England.' },
  { id: 'dracula', title: 'Dracula', author: 'Bram Stoker', difficulty: 'medium', description: 'Count Dracula attempts to move to England to spread the undead curse.' },
  { id: 'the-picture-of-dorian-gray', title: 'The Picture of Dorian Gray', author: 'Oscar Wilde', difficulty: 'medium', description: 'A man remains young while his portrait ages, showing the corruption of his soul.' },
  { id: 'the-adventures-of-huckleberry-finn', title: 'The Adventures of Huckleberry Finn', author: 'Mark Twain', difficulty: 'easy', description: 'Huck and Jim float down the Mississippi River seeking freedom.' },
  { id: 'the-adventures-of-tom-sawyer', title: 'The Adventures of Tom Sawyer', author: 'Mark Twain', difficulty: 'easy', description: 'A mischievous boy has adventures in a Mississippi River town.' },
  { id: 'the-count-of-monte-cristo', title: 'The Count of Monte Cristo', author: 'Alexandre Dumas', difficulty: 'hard', description: 'A wrongly imprisoned man escapes and seeks revenge on those who betrayed him.' },
  { id: 'the-three-musketeers', title: 'The Three Musketeers', author: 'Alexandre Dumas', difficulty: 'medium', description: 'D\'Artagnan joins three musketeers in adventures of honor and loyalty.' },
  { id: 'les-miserables', title: 'Les Misérables', author: 'Victor Hugo', difficulty: 'hard', description: 'Ex-convict Jean Valjean seeks redemption in revolutionary France.' },
  { id: 'the-hunchback-of-notre-dame', title: 'The Hunchback of Notre-Dame', author: 'Victor Hugo', difficulty: 'medium', description: 'Quasimodo, the deformed bell-ringer, falls in love with the beautiful Esmeralda.' },
  { id: 'anna-karenina', title: 'Anna Karenina', author: 'Leo Tolstoy', difficulty: 'hard', description: 'A married aristocrat\'s affair leads to tragedy in Russian high society.' },
  { id: 'the-brothers-karamazov', title: 'The Brothers Karamazov', author: 'Fyodor Dostoevsky', difficulty: 'hard', description: 'Three brothers grapple with faith, doubt, and morality after their father\'s murder.' },
  { id: 'don-quixote', title: 'Don Quixote', author: 'Miguel de Cervantes', difficulty: 'hard', description: 'An aging gentleman believes he is a knight and sets out on absurd adventures.' },
  { id: 'the-scarlet-letter', title: 'The Scarlet Letter', author: 'Nathaniel Hawthorne', difficulty: 'medium', description: 'Hester Prynne bears a child out of wedlock in Puritan Massachusetts.' },
  { id: 'the-stranger', title: 'The Stranger', author: 'Albert Camus', difficulty: 'medium', description: 'A man commits murder and faces an absurd trial in this existential novel.' },
  { id: 'slaughterhouse-five', title: 'Slaughterhouse-Five', author: 'Kurt Vonnegut', difficulty: 'medium', description: 'Billy Pilgrim becomes "unstuck in time" after surviving the Dresden bombing.' },
  { id: 'catch-22', title: 'Catch-22', author: 'Joseph Heller', difficulty: 'hard', description: 'A bombardier tries to maintain his sanity amid the absurdity of war.' },
  { id: 'the-bell-jar', title: 'The Bell Jar', author: 'Sylvia Plath', difficulty: 'medium', description: 'A young woman\'s descent into mental illness in 1950s America.' },
  { id: 'one-flew-over-the-cuckoos-nest', title: 'One Flew Over the Cuckoo\'s Nest', author: 'Ken Kesey', difficulty: 'medium', description: 'A rebellious patient challenges the oppressive head nurse in a mental institution.' },
  { id: 'the-grapes-of-wrath', title: 'The Grapes of Wrath', author: 'John Steinbeck', difficulty: 'medium', description: 'The Joad family migrates west during the Dust Bowl seeking a better life.' },
  { id: 'east-of-eden', title: 'East of Eden', author: 'John Steinbeck', difficulty: 'hard', description: 'Two families retell the biblical story of Cain and Abel in California.' },
  { id: 'a-tale-of-two-cities', title: 'A Tale of Two Cities', author: 'Charles Dickens', difficulty: 'medium', description: 'Set during the French Revolution, a man makes the ultimate sacrifice for love.' },
  { id: 'great-expectations', title: 'Great Expectations', author: 'Charles Dickens', difficulty: 'medium', description: 'Orphan Pip rises in society but learns that wealth doesn\'t guarantee happiness.' },
  { id: 'oliver-twist', title: 'Oliver Twist', author: 'Charles Dickens', difficulty: 'easy', description: 'An orphan boy falls in with a gang of pickpockets in Victorian London.' },
  { id: 'a-christmas-carol', title: 'A Christmas Carol', author: 'Charles Dickens', difficulty: 'easy', description: 'Scrooge is visited by three ghosts who show him the error of his ways.' },
  { id: 'david-copperfield', title: 'David Copperfield', author: 'Charles Dickens', difficulty: 'medium', description: 'A young man overcomes hardship to find success and love.' },
  { id: 'the-metamorphosis', title: 'The Metamorphosis', author: 'Franz Kafka', difficulty: 'medium', description: 'Gregor Samsa wakes up transformed into a giant insect.' },
  { id: 'the-trial', title: 'The Trial', author: 'Franz Kafka', difficulty: 'hard', description: 'Josef K. is arrested and prosecuted by an inaccessible authority for an unspecified crime.' },
  { id: 'heart-of-darkness', title: 'Heart of Darkness', author: 'Joseph Conrad', difficulty: 'medium', description: 'A journey up the Congo River reveals the darkness of colonialism and human nature.' },
  { id: 'the-call-of-the-wild', title: 'The Call of the Wild', author: 'Jack London', difficulty: 'easy', description: 'A domesticated dog named Buck returns to his wild ancestry during the Klondike Gold Rush.' },
  { id: 'white-fang', title: 'White Fang', author: 'Jack London', difficulty: 'easy', description: 'A wolf-dog learns to survive in the wild and eventually finds love with humans.' },
  { id: 'the-jungle-book', title: 'The Jungle Book', author: 'Rudyard Kipling', difficulty: 'easy', description: 'Mowgli, a boy raised by wolves, has adventures in the Indian jungle.' },
  { id: 'treasure-island', title: 'Treasure Island', author: 'Robert Louis Stevenson', difficulty: 'easy', description: 'Young Jim Hawkins searches for buried treasure while dealing with pirates.' },
  { id: 'the-strange-case-of-dr-jekyll-and-mr-hyde', title: 'The Strange Case of Dr. Jekyll and Mr. Hyde', author: 'Robert Louis Stevenson', difficulty: 'medium', description: 'A doctor experiments with his dual nature, creating an evil alter ego.' },
  { id: 'robinson-crusoe', title: 'Robinson Crusoe', author: 'Daniel Defoe', difficulty: 'medium', description: 'A man survives 28 years alone on a deserted island.' },
  { id: 'gullivers-travels', title: 'Gulliver\'s Travels', author: 'Jonathan Swift', difficulty: 'medium', description: 'Lemuel Gulliver visits fantastical lands including Lilliput and Brobdingnag.' },
  { id: 'the-time-machine', title: 'The Time Machine', author: 'H.G. Wells', difficulty: 'medium', description: 'A scientist travels to the year 802,701 and discovers humanity\'s dark future.' },
  { id: 'the-war-of-the-worlds', title: 'The War of the Worlds', author: 'H.G. Wells', difficulty: 'medium', description: 'Martians invade Earth with devastating technology.' },
  { id: 'twenty-thousand-leagues-under-the-sea', title: 'Twenty Thousand Leagues Under the Sea', author: 'Jules Verne', difficulty: 'medium', description: 'Captain Nemo takes passengers on an underwater journey in his submarine Nautilus.' },
  { id: 'around-the-world-in-eighty-days', title: 'Around the World in Eighty Days', author: 'Jules Verne', difficulty: 'easy', description: 'Phileas Fogg bets he can circumnavigate the globe in 80 days.' },
  { id: 'journey-to-the-center-of-the-earth', title: 'Journey to the Center of the Earth', author: 'Jules Verne', difficulty: 'medium', description: 'Explorers descend into a volcanic crater and discover a prehistoric world.' },
  { id: 'the-invisible-man', title: 'The Invisible Man', author: 'H.G. Wells', difficulty: 'medium', description: 'A scientist becomes invisible but descends into madness.' },
  { id: 'alice-in-wonderland', title: 'Alice\'s Adventures in Wonderland', author: 'Lewis Carroll', difficulty: 'easy', description: 'Alice falls down a rabbit hole into a fantastical world of peculiar characters.' },
  { id: 'through-the-looking-glass', title: 'Through the Looking-Glass', author: 'Lewis Carroll', difficulty: 'easy', description: 'Alice steps through a mirror into a backwards world.' },
  { id: 'the-wizard-of-oz', title: 'The Wonderful Wizard of Oz', author: 'L. Frank Baum', difficulty: 'easy', description: 'Dorothy is swept to a magical land and seeks the Wizard to return home.' },
  { id: 'peter-pan', title: 'Peter Pan', author: 'J.M. Barrie', difficulty: 'easy', description: 'A boy who never grows up takes the Darling children to Neverland.' },
  { id: 'the-secret-garden', title: 'The Secret Garden', author: 'Frances Hodgson Burnett', difficulty: 'easy', description: 'A spoiled girl discovers a hidden garden that changes her life.' },
  { id: 'anne-of-green-gables', title: 'Anne of Green Gables', author: 'L.M. Montgomery', difficulty: 'easy', description: 'An imaginative orphan girl finds a home with elderly siblings in Canada.' },
  { id: 'little-women', title: 'Little Women', author: 'Louisa May Alcott', difficulty: 'easy', description: 'Four sisters grow up during the Civil War and pursue their dreams.' },
  { id: 'heidi', title: 'Heidi', author: 'Johanna Spyri', difficulty: 'easy', description: 'An orphan girl lives with her grandfather in the Swiss Alps.' },
  { id: 'black-beauty', title: 'Black Beauty', author: 'Anna Sewell', difficulty: 'easy', description: 'A horse narrates his life story, from a happy home to harsh treatment.' },
  { id: 'the-wind-in-the-willows', title: 'The Wind in the Willows', author: 'Kenneth Grahame', difficulty: 'easy', description: 'Animal friends have adventures along the riverbank.' },
  { id: 'charlottes-web', title: 'Charlotte\'s Web', author: 'E.B. White', difficulty: 'easy', description: 'A spider saves a pig from slaughter by writing messages in her web.' },
  { id: 'james-and-the-giant-peach', title: 'James and the Giant Peach', author: 'Roald Dahl', difficulty: 'easy', description: 'An orphan boy escapes his aunts inside a magical giant peach.' },
  { id: 'charlie-and-the-chocolate-factory', title: 'Charlie and the Chocolate Factory', author: 'Roald Dahl', difficulty: 'easy', description: 'A poor boy wins a tour of an eccentric chocolatier\'s factory.' },
  { id: 'matilda', title: 'Matilda', author: 'Roald Dahl', difficulty: 'easy', description: 'A brilliant girl with telekinetic powers outwits her mean parents and headmistress.' },
  { id: 'the-bfg', title: 'The BFG', author: 'Roald Dahl', difficulty: 'easy', description: 'A girl befriends a Big Friendly Giant who catches dreams.' },
  { id: 'where-the-wild-things-are', title: 'Where the Wild Things Are', author: 'Maurice Sendak', difficulty: 'easy', description: 'Max sails to an island of wild creatures and becomes their king.' },
  { id: 'goodnight-moon', title: 'Goodnight Moon', author: 'Margaret Wise Brown', difficulty: 'easy', description: 'A bunny says goodnight to everything in his room.' },
  { id: 'green-eggs-and-ham', title: 'Green Eggs and Ham', author: 'Dr. Seuss', difficulty: 'easy', description: 'Sam-I-Am tries to convince someone to try green eggs and ham.' },
  { id: 'the-cat-in-the-hat', title: 'The Cat in the Hat', author: 'Dr. Seuss', difficulty: 'easy', description: 'A mischievous cat brings chaos to two children\'s home on a rainy day.' },
  { id: 'the-giving-tree', title: 'The Giving Tree', author: 'Shel Silverstein', difficulty: 'easy', description: 'A tree gives everything to the boy she loves throughout his life.' },
  { id: 'the-velveteen-rabbit', title: 'The Velveteen Rabbit', author: 'Margery Williams', difficulty: 'easy', description: 'A toy rabbit learns what it means to become real through love.' },
  { id: 'a-wrinkle-in-time', title: 'A Wrinkle in Time', author: 'Madeleine L\'Engle', difficulty: 'medium', description: 'Meg travels through time and space to rescue her father from evil forces.' },
  { id: 'the-chronicles-of-narnia-the-lion-the-witch-and-the-wardrobe', title: 'The Lion, the Witch and the Wardrobe', author: 'C.S. Lewis', difficulty: 'easy', description: 'Four siblings discover a magical land through a wardrobe.' },
  { id: 'where-the-red-fern-grows', title: 'Where the Red Fern Grows', author: 'Wilson Rawls', difficulty: 'easy', description: 'A boy and his two hunting dogs have adventures in the Ozarks.' },
  { id: 'bridge-to-terabithia', title: 'Bridge to Terabithia', author: 'Katherine Paterson', difficulty: 'easy', description: 'Two friends create an imaginary kingdom but face unexpected tragedy.' },
  { id: 'holes', title: 'Holes', author: 'Louis Sachar', difficulty: 'easy', description: 'A boy is sent to a desert detention camp where he must dig holes every day.' },
  { id: 'the-outsiders', title: 'The Outsiders', author: 'S.E. Hinton', difficulty: 'easy', description: 'Rival gangs of rich and poor teens clash in 1960s Oklahoma.' },
  { id: 'the-giver', title: 'The Giver', author: 'Lois Lowry', difficulty: 'medium', description: 'A boy discovers the dark truth behind his seemingly perfect society.' },
  { id: 'number-the-stars', title: 'Number the Stars', author: 'Lois Lowry', difficulty: 'easy', description: 'A girl helps her Jewish friend escape the Nazis in Denmark.' },
  { id: 'hatchet', title: 'Hatchet', author: 'Gary Paulsen', difficulty: 'easy', description: 'A boy survives alone in the Canadian wilderness after a plane crash.' },
  { id: 'my-side-of-the-mountain', title: 'My Side of the Mountain', author: 'Jean Craighead George', difficulty: 'easy', description: 'A boy runs away to live in the Catskill Mountains for a year.' },
  { id: 'island-of-the-blue-dolphins', title: 'Island of the Blue Dolphins', author: 'Scott O\'Dell', difficulty: 'easy', description: 'A girl survives alone on an island for 18 years.' },
  { id: 'roll-of-thunder-hear-my-cry', title: 'Roll of Thunder, Hear My Cry', author: 'Mildred D. Taylor', difficulty: 'medium', description: 'An African American family faces racism in Depression-era Mississippi.' },
  { id: 'a-separate-peace', title: 'A Separate Peace', author: 'John Knowles', difficulty: 'medium', description: 'Friendship and rivalry between two boys at a boarding school during WWII.' },
  { id: 'the-perks-of-being-a-wallflower', title: 'The Perks of Being a Wallflower', author: 'Stephen Chbosky', difficulty: 'easy', description: 'An introverted teenager navigates high school through letters.' },
  { id: 'speak', title: 'Speak', author: 'Laurie Halse Anderson', difficulty: 'easy', description: 'A girl who stopped speaking after a traumatic event finds her voice.' },
  { id: 'thirteen-reasons-why', title: 'Thirteen Reasons Why', author: 'Jay Asher', difficulty: 'medium', description: 'A boy listens to cassette tapes explaining why a classmate took her life.' },
  { id: 'the-book-thief', title: 'The Book Thief', author: 'Markus Zusak', difficulty: 'medium', description: 'Death narrates the story of a girl who steals books in Nazi Germany.' },
  { id: 'twilight', title: 'Twilight', author: 'Stephenie Meyer', difficulty: 'easy', description: 'A girl falls in love with a vampire in small-town Washington.' },
  { id: 'city-of-bones', title: 'City of Bones', author: 'Cassandra Clare', difficulty: 'easy', description: 'A girl discovers she is a Shadowhunter destined to hunt demons.' },
  { id: 'percy-jackson-the-lightning-thief', title: 'Percy Jackson & the Lightning Thief', author: 'Rick Riordan', difficulty: 'easy', description: 'A boy discovers he is the son of Poseidon and goes on a quest.' },
  { id: 'enders-game', title: 'Ender\'s Game', author: 'Orson Scott Card', difficulty: 'medium', description: 'A brilliant child is trained to lead Earth\'s military against alien invaders.' }
];

// Add chapters to additional titles
ADDITIONAL_TITLES.forEach(book => {
  book.chapters = generateSimpleChapters(book.title, book.description);
  book.coverImage = '';
});

// Final list of 100 books
const FINAL_100_BOOKS = [...REAL_BOOKS, ...MORE_BOOKS, ...ADDITIONAL_TITLES].slice(0, 100);

async function deleteGeneratedBooks() {
  console.log('🗑️  Deleting generated books...\n');
  const files = await fs.readdir(STORIES_DIR);
  let deletedCount = 0;
  
  for (const file of files) {
    if (file.match(/^book-\d{3}-\w+\.json$/)) {
      await fs.unlink(path.join(STORIES_DIR, file));
      deletedCount++;
    }
  }
  
  console.log(`✅ Deleted ${deletedCount} generated books\n`);
}

async function add100RealBooks() {
  try {
    console.log('📚 ADDING 100 REAL BOOKS TO YOUR LIBRARY!\n');
    console.log('=' .repeat(50) + '\n');
    
    // Delete generated books first
    await deleteGeneratedBooks();
    
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const book of FINAL_100_BOOKS) {
      const filePath = path.join(STORIES_DIR, `${book.id}.json`);
      
      try {
        await fs.access(filePath);
        console.log(`⏭️  "${book.title}" already exists`);
        skippedCount++;
      } catch (error) {
        await fs.writeFile(filePath, JSON.stringify(book, null, 2), 'utf-8');
        console.log(`✅ Added "${book.title}" by ${book.author}`);
        addedCount++;
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log(`\n🎉 SUCCESS!`);
    console.log(`   📖 Added: ${addedCount} books`);
    console.log(`   ⏭️  Skipped: ${skippedCount} books (already existed)`);
    console.log(`   📚 Total: ${addedCount + skippedCount} real books in library\n`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  add100RealBooks();
}

module.exports = { add100RealBooks };
