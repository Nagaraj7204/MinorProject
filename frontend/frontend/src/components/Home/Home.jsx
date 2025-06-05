import React from 'react';
import styles from './Home.module.css';
import { Link } from 'react-router-dom';

// --- Import Videos (Make sure paths are correct) ---
import video1 from '../../assets/video1.mp4';
import video2 from '../../assets/video2.mp4';
import video3 from '../../assets/video3.mp4';
// --- Import Images for How It Works Section ---
import smallImg from '../../assets/small.jpg';
import small1Img from '../../assets/small1.jpg';
import small2Img from '../../assets/small2.jpg';
import small3Img from '../../assets/small3.jpg';
// --- Import Hero Image ---
import heroImage from '../../assets/hero.jpg';
import secondHeroImage from '../../assets/second.jpg';


// --- Import Icons ---
import { FaTasks, FaClock, FaGamepad, FaChild, FaLock, FaChartLine, FaQuoteLeft } from 'react-icons/fa';

// Q&A Data
const faqs = [
  {
    id: 1,
    question: "What is Workopoly?",
    answer: "Workopoly is a task management web application that turns productivity into a game. It helps users manage tasks efficiently, earn points, unlock levels, and stay motivated through gamification elements like badges, progress bars, and quiz challenges.",
    arrowChar: "\u21E9" // Downwards Arrow with Tip Rightwards (for left-aligned answer) ⇩ or ⤵ (U+2935) or ⤋ (U+290B) or ↯ (U+21AF)
  },
  {
    id: 2,
    question: "How does the points and leveling system work in Workopoly?",
    answer: "Each time you complete a task, you earn points. Accumulating points helps you level up, and each new level may unlock rewards like badges, quiz challenges, or advanced features. Completing quizzes also earns points, adding to your overall progress.",
    arrowChar: "\u21E9" // Downwards Arrow with Tip Rightwards (will be mirrored for right-aligned answer via CSS if needed, or use a neutral down arrow)
  },
  {
    id: 3,
    question: "What makes Workopoly different from other task managers?",
    answer: "Unlike traditional task managers, Workopoly combines productivity with fun through games, badges, and visual progress tracking. It keeps users engaged and motivated by turning everyday tasks into achievements and challenges.",
    arrowChar: "\u21E9"
  },
  {
    id: 4,
    question: "Who can use Workopoly?",
    answer: "Workopoly is ideal for students, professionals, and even kids who want to manage their time better while enjoying a gamified experience. Its flexible design caters to both personal productivity and educational engagement.",
    arrowChar: "\u21E9"
  }
];


function Home() {

  return (
    <div className={styles.homeContainer}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContentContainer}>
          <div className={styles.heroTextContent}>
            <h1 className={styles.heroHeadline}>
              Workopoly – Turn Tasks into Triumphs
            </h1>
            <p className={styles.heroSubheadline}>
              Master your time, conquer your goals, and earn rewards while you’re at it. Workopoly is your ultimate gamified task manager that makes productivity fun.
            </p>
            <div className={styles.heroStats}>
              <div className={styles.statItem}>
                <span className={styles.statItemValue}>10,000+</span>
                <span className={styles.statItemLabel}>Users</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statItemValue}>1M+</span>
                <span className={styles.statItemLabel}>Tasks Completed</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statItemValue}>50K+</span>
                <span className={styles.statItemLabel}>Hours Saved</span>
              </div>
            </div>
            <div className={styles.heroButtonWrapper}>
              <Link to="/signup">
                <button className={styles.heroButton}>Get Started</button>
              </Link>
            </div>
          </div>
          <div className={styles.heroImageContainer}>
            <img src={heroImage} alt="Workopoly app preview" className={styles.heroImage} />
          </div>
        </div>
        {/* Decorative bubbles for hero section */}
        <div className={styles.bubbleOne}></div>
        <div className={styles.bubbleTwo}></div>
      </section>

      {/* Intro Section */}
      <section className={styles.introSection} id="intro">
        <h2 className={`${styles.sectionHeading} ${styles.introSectionHeading}`}>🚀 What is Workopoly?</h2>
        <div className={styles.introContentWrapper}>
            <div className={styles.introImageContainer}>
              <img src={secondHeroImage} alt="Workopoly platform overview" className={styles.introSectionImage} />
            </div>
            <div className={styles.introTextContainerFullWidth}>
                <p className={`${styles.introText} ${styles.whatIsWorkopolyLead}`}>
                    Workopoly is more than just a task manager — it’s your personal productivity game.
                </p>
                <p className={styles.introText}>
                    We believe managing tasks shouldn't feel like a chore. That’s why Workopoly turns everyday to-dos into a rewarding, interactive experience. With every task you complete, you earn points, build momentum, and level up your workflow — all while keeping things beautifully organized.
                </p>
                <p className={styles.introText}>
                    Whether you're a student juggling assignments, a professional managing deadlines, or someone just trying to stay on track, Workopoly gives you the tools (and the fun) to turn your goals into wins.
                </p>
            </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className={styles.howItWorksSection} id="how-it-works">
        <h2 className={styles.sectionHeading}>Unlock Productivity in 4 Simple Steps</h2>
        <div className={styles.stepsGrid}>
          <div className={`${styles.step} ${styles.stepWithImage}`}>
            <img src={smallImg} alt="Create Tasks" className={styles.stepImage} />
            <h3 className={styles.stepTitle}>1. Create Tasks</h3>
            <p className={styles.stepDescription}>Add deadlines, categories, and priorities.</p>
          </div>
          <div className={`${styles.step} ${styles.stepWithImage}`}>
            <img src={small1Img} alt="Earn Points" className={styles.stepImage} />
            <h3 className={styles.stepTitle}>2. Earn Points</h3>
            <p className={styles.stepDescription}>Get XP for every task you complete.</p>
          </div>
          <div className={`${styles.step} ${styles.stepWithImage}`}>
            <img src={small2Img} alt="Climb the Ranks" className={styles.stepImage} />
            <h3 className={styles.stepTitle}>3. Climb the Ranks</h3>
            <p className={styles.stepDescription}>See how you compare on the leaderboard.</p>
          </div>
          <div className={`${styles.step} ${styles.stepWithImage}`}>
            <img src={small3Img} alt="Redeem Rewards" className={styles.stepImage} />
            <h3 className={styles.stepTitle}>4. Redeem Rewards</h3>
            <p className={styles.stepDescription}>Use your points to unlock premium features.</p>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className={styles.videoSection} id="videos">
        <h2 className={styles.sectionHeading}>See Workopoly in Action</h2>
        <p className={styles.sectionSubheading}>Short glimpses into how Workopoly makes productivity engaging.</p>
        <div className={styles.videoShowcase}>
          <div className={styles.videoItem}>
            <div className={styles.videoPlayerWrapper}>
              <video playsInline loop muted autoPlay className={styles.videoElement}>
                <source src={video1} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            <div className={styles.videoTextContent}>
              <h4 className={styles.videoTitle}>Effortless Task Creation</h4>
              <p className={styles.videoDescription}>Quickly add new tasks, set due dates, and assign priorities without breaking your flow.</p>
            </div>
          </div>
          <div className={styles.videoItem}>
             <div className={styles.videoPlayerWrapper}>
              <video playsInline loop muted autoPlay className={styles.videoElement}>
                <source src={video2} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            <div className={styles.videoTextContent}>
              <h4 className={styles.videoTitle}>Track Your Progress</h4>
              <p className={styles.videoDescription}>Visualize your accomplishments and see how much you've completed at a glance.</p>
            </div>
          </div>
          <div className={styles.videoItem}>
             <div className={styles.videoPlayerWrapper}>
              <video playsInline loop muted autoPlay className={styles.videoElement}>
                <source src={video3} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            <div className={styles.videoTextContent}>
              <h4 className={styles.videoTitle}>Gamified Motivation</h4>
              <p className={styles.videoDescription}>Earn points, level up, and climb the leaderboard as you conquer your quests.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section className={styles.featuresSection} id="features">
         <h2 className={styles.sectionHeading}>🌟 What Makes Workopoly Different?</h2>
         <div className={styles.featuresGrid}>
            <div className={styles.feature}>
              <div className={styles.featureIconContainer}>
                 <FaTasks className={styles.featureIcon} />
              </div>
              <div className={styles.featureText}>
                <h3 className={styles.featureTitle}>Flexible Task Views</h3>
                <p className={styles.featureDescription}>Organize your way with lists, boards, or calendars. Set priorities, due dates, and tags.</p>
              </div>
            </div>
            <div className={styles.feature}>
               <div className={styles.featureIconContainer}>
                 <FaClock className={styles.featureIcon} />
               </div>
              <div className={styles.featureText}>
                <h3 className={styles.featureTitle}>Integrated Time Tracking</h3>
                <p className={styles.featureDescription}>Log time spent on tasks, analyze your workflow, and improve estimations.</p>
              </div>
            </div>
            <div className={styles.feature}>
               <div className={styles.featureIconContainer}>
                 <FaGamepad className={styles.featureIcon} />
               </div>
              <div className={styles.featureText}>
                <h3 className={styles.featureTitle}>Addictive Gamification</h3>
                <p className={styles.featureDescription}>Earn points for completion, unlock achievements, and compete on leaderboards.</p>
              </div>
            </div>
            <div className={styles.feature}>
               <div className={styles.featureIconContainer}>
                 <FaChartLine className={styles.featureIcon} />
               </div>
              <div className={styles.featureText}>
                <h3 className={styles.featureTitle}>Progress Tracking</h3>
                <p className={styles.featureDescription}>Visualize your progress, completion rates, and time usage with clear charts.</p>
              </div>
            </div>
            <div className={styles.feature}>
               <div className={styles.featureIconContainer}>
                 <FaChild className={styles.featureIcon} />
               </div>
              <div className={styles.featureText}>
                <h3 className={styles.featureTitle}>Built for Everyone</h3>
                <p className={styles.featureDescription}>Perfect for students, professionals, and even kids learning time management.</p>
              </div>
            </div>
            <div className={styles.feature}>
               <div className={styles.featureIconContainer}>
                 <FaLock className={styles.featureIcon} />
               </div>
              <div className={styles.featureText}>
                <h3 className={styles.featureTitle}>Secure & Synced</h3>
                <p className={styles.featureDescription}>Secure login with progress sync across devices. Your data is safe.</p>
              </div>
            </div>
         </div>
      </section>

      {/* Testimonials Section */}
      <section className={styles.testimonialsSection}>
        <h2 className={styles.sectionHeading}>Hear from Our High Scorers</h2>
        <div className={styles.testimonialsGrid}>
          <div className={styles.testimonialCard}>
            <FaQuoteLeft className={styles.quoteIcon} />
            <p className={styles.testimonialText}>"I used to procrastinate like crazy. Workopoly's point system actually motivates me to get stuff done ahead of time!"</p>
            <div className={styles.testimonialAuthor}>
              <span className={styles.authorName}>- Jordan P., University Student</span>
            </div>
          </div>
          <div className={styles.testimonialCard}>
            <FaQuoteLeft className={styles.quoteIcon} />
            <p className={styles.testimonialText}>"As a freelancer, juggling clients was chaotic. Workopoly brought order and, dare I say, fun to my workflow."</p>
            <div className={styles.testimonialAuthor}>
              <span className={styles.authorName}>- Chloe M., Graphic Designer</span>
            </div>
          </div>
          <div className={styles.testimonialCard}>
            <FaQuoteLeft className={styles.quoteIcon} />
            <p className={styles.testimonialText}>"The kids are actually excited about doing chores now to earn points for their avatars. It's been a game-changer!"</p>
            <div className={styles.testimonialAuthor}>
              <span className={styles.authorName}>- David L., Parent</span>
            </div>
          </div>
        </div>
      </section>

      {/* Q&A Section - NEW Structure */}
      <section className={styles.qaSection} id="faq">
        <h2 className={styles.sectionHeading}>Frequently Asked Questions</h2>
        <p className={styles.sectionSubheading}>Got questions? We've got answers!</p>
        <div className={styles.qaContainer}>
          {faqs.map((faq, index) => (
            <div
              key={faq.id}
              className={`${styles.qaItem} ${index % 2 !== 0 ? styles.qaAnswerAlignRight : styles.qaAnswerAlignLeft}`}
            >
              <div className={`${styles.qaCard} ${styles.qaQuestionCard} ${styles[`qaColor${(index % 4) + 1}`]}`}>
                <h4>{faq.question}</h4>
                <div className={styles.qaArrowContainer}>
                  <span className={styles.qaArrow}>{faq.arrowChar}</span>
                </div>
              </div>
              <div className={`${styles.qaCard} ${styles.qaAnswerCard}`}>
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <h2 className={styles.ctaHeading}>📱 Start Today</h2>
        <p className={styles.ctaText}>Your goals won’t wait — and neither should you.</p>
        <Link to="/signup">
          <button className={styles.ctaButton}>Sign Up Free</button>
        </Link>
      </section>
    </div>
  );
}

export default Home;
