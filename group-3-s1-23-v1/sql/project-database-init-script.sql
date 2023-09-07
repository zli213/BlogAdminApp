/*
 * Upon submission, this file should contain the SQL script to initialize your database.
 * It should contain all DROP TABLE and CREATE TABLE statments, and any INSERT statements
 * required.
 */
 -- In this blog website database, we have 6 tables: users, articles, comments, like, subscription and notification.
 -- Drop the tables if they already exist.
drop table if exists likes;
drop table if exists notifications;
drop table if exists comments;
drop table if exists articles;
drop table if exists subscriptions;
drop table if exists users;

-- Create the tables.
create table users (
    id INTEGER not null primary key,
    username VARCHAR(64) not null unique,
    fname VARCHAR(32) not null,
    lname VARCHAR(32) not null,
    password VARCHAR(64) not null,
    admin BOOLEAN not null default false,
    birthdate DATE not null,
    avatar_src VARCHAR(500) not null,
    description VARCHAR(256) not null
);
create table articles (
    id INTEGER not null primary key,
    title VARCHAR(200) not null,
    content TEXT not null,
    author INTEGER not null,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    image_src VARCHAR(500) not null,
    additional_images TEXT,
    foreign key (author) references users(id) ON DELETE CASCADE
);
create table comments (
    id INTEGER not null primary key,
    content VARCHAR(256) not null,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    commenter INTEGER not null,
    article INTEGER not null,
    parent_comment INTEGER,
    foreign key (commenter) references users(id) ON DELETE CASCADE,
    foreign key (article) references articles(id) ON DELETE CASCADE,
    foreign key (parent_comment) references comments(id) ON DELETE CASCADE
);
create table likes (
    liker INTEGER not null ,
    article INTEGER not null,
    primary key (liker, article),
    foreign key (liker) references users(id) ON DELETE CASCADE,
    foreign key (article) references articles(id) ON DELETE CASCADE
);
-- Subscriptions table: author is the user being subscribed to, subscriber is the user subscribing

create table subscriptions (
    id INTEGER not null primary key,
    subscriber INTEGER not null,
    author INTEGER not null,
    foreign key (subscriber) references users(id) ON DELETE CASCADE,
    foreign key (author) references users(id) ON DELETE CASCADE
);
-- Table should have an id, a read to indicate whether the notification has been read, and type to indicate the type of notification 
-- and a subsciption id to indicate which subscription the notification is for.
create table notifications (
    id INTEGER not null primary key,
    read_status BOOLEAN not null default false,
    notification_type VARCHAR(32) not null,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    article_id INTEGER DEFAULT NULL,
    comment_id INTEGER DEFAULT NULL,
    subscription INTEGER not null,
    foreign key (article_id) references articles(id) ON DELETE CASCADE,
    foreign key (comment_id) references comments(id) ON DELETE CASCADE,
    foreign key (subscription) references subscriptions(id) ON DELETE CASCADE
);

-- insert some test data
-- Insert users
insert into users (id, username, fname, lname, password, admin, birthdate, avatar_src, description)
values
    (1, 'paul123','Paul', 'Highum', '$2b$10$XrWyTOvUp.zge8BU722SHeqlhjG/TqQMA9lx7x9Ac6Fdq.qsbpLYS', false, '1980-01-01', '/images/avatar1.svg', 'Hello, I am Paul.'), --pw: test1
    (2, 'osama123', 'Osama', 'Khan', '$2b$10$hh24xHJXPl0j9/deGdxg..qUTLKMdo/h/jWob3ReAbvyfz9GYZcw2', false, '1980-01-02', '/images/avatar2.svg', 'Hello, I am Osama.'), --pw: test2
    (3, 'jiseon123', 'Jiseon', 'Yoo', '$2b$10$Fm95ym.PSIDcAOhuPSzfse1AqsWdFrzbqMEy3WL7phV7jblx2vuxe', false, '1980-01-03', '/images/avatar6.svg', 'Hello, I am Jiseon.'), --pw: test3
    (4, 'tong123', 'Tong', 'Chen', '$2b$10$mMvKJHrjVdGm2r/NChonk.XDBCdbXPt3P06vpBur6B3xKSfnbiITu', false, '1980-01-04', '/images/avatar5.svg', 'Hello, I am Tong.'), --pw: test4
    (5, 'zhaohua123', 'Zhaohua', 'Li', '$2b$10$gsj9YMRO994ZpKKICD3UMugJu2tkDA/aMSRMKfpA2MzUhgNpRANom', false, '1980-01-05', '/images/avatar3.svg', 'Hello, I am Zhaohua.'), --pw: test5
    (6, 'admin', 'Super', 'Admin', '$2b$10$jY8PGINSRUsJX44FnF3G/u/w/YEczWq05rCwq5VkLOL2GyyYnpNTW', true, '1980-01-06', '/images/avatar4.svg', 'Hello, I am SUPER ADMIN.'); --pw: admin
-- Insert articles, we would store the more images sources as JSON converted to text
-- If there is only one image, then the additional_images field can be left empty.

INSERT INTO articles (id, title, content, author, date, image_src, additional_images)
VALUES
    (1, 'Revolutionary Algorithm Unveiled: Changing the Future of Machine Learning', 'Researchers from a prestigious university have recently revealed a groundbreaking algorithm poised to revolutionize the field of machine learning. By leveraging advanced neural networks and deep reinforcement learning techniques, this algorithm demonstrates unprecedented accuracy in complex data analysis tasks. Experts predict that this development will pave the way for significant advancements in artificial intelligence applications across various industries. Stay tuned as we delve deeper into the mechanics behind this remarkable breakthrough.', 1, '2023-05-01 01:01:50', '/images/Article_image_one.jpg', NULL),
    (2, 'Quantum Computing Breakthrough: Unlocking Infinite Computational Power', 'In a significant leap forward, scientists have made a groundbreaking breakthrough in the realm of quantum computing. Through ingenious engineering and harnessing the power of qubits, researchers have successfully demonstrated the ability to achieve infinite computational power. This achievement holds the potential to solve complex problems with unprecedented speed, transforming industries such as cryptography, optimization, and drug discovery. Exciting times lie ahead as we explore the implications of this extraordinary advance.', 2, '2023-05-02 01:01:50', '/images/Article_image_two.jpg', NULL),
    (3, 'The Future of Cybersecurity: AI-Powered Defense Systems', 'As cyber threats continue to evolve, so does the need for innovative defense mechanisms. Enter AI-powered cybersecurity systems, the cutting-edge technology designed to combat sophisticated attacks. These intelligent systems employ machine learning algorithms to detect and neutralize threats in real-time, bolstering network security and safeguarding sensitive data. Stay informed as we delve into the intricacies of this transformative technology, providing insights into the future of cybersecurity.', 3, '2023-05-03 01:01:50', '/images/Article_image_three.png', NULL),
    (4, 'Code Optimization 2.0: Enhancing Performance Through Smart Algorithms', 'In the pursuit of faster and more efficient software, developers have unlocked a new frontier in code optimization. Smart algorithms, capable of dynamically adjusting resources and eliminating bottlenecks, have emerged as game-changers. By optimizing code during runtime, applications can now achieve unprecedented performance levels, leading to enhanced user experiences and increased productivity. Join us as we explore the latest advancements in this exciting field.', 4, '2023-05-04 01:01:50', '/images/Article_image_four.jpg', NULL),
    (5, 'The Rise of Blockchain: Transforming Industries Beyond Cryptocurrency', 'Blockchain technology has transcended its origins in cryptocurrency and is now poised to revolutionize various industries. From healthcare to supply chain management, this decentralized ledger system offers unparalleled transparency, security, and efficiency. By eliminating intermediaries and ensuring immutable records, blockchain is reshaping the way we conduct business. Discover the endless possibilities and potential disruptions as we dive into the transformative power of blockchain.', 5, '2023-05-05 01:01:50', '/images/Article_image_five.jpg', NULL),
    (21, 'Breaking Boundaries: Quantum Machine Learning Takes Center Stage', 'The realms of quantum computing and machine learning collide as researchers embark on a pioneering field of study: quantum machine learning. This cutting-edge discipline explores the utilization of quantum algorithms to optimize and accelerate traditional machine learning tasks. With the potential to tackle complex problems faster than classical approaches, quantum machine learning represents a quantum leap in the field of artificial intelligence. Join us as we delve into the fascinating world of quantum machine learning.', 1, '2023-05-06 01:01:50', '/images/Article_image_six.png', NULL),
    (22, 'Ethical Considerations in AI: Ensuring Bias-Free Algorithms', 'With the increasing integration of artificial intelligence into our daily lives, the ethical implications of AI algorithms have come under scrutiny. Addressing the issue of bias within these algorithms is crucial to fostering fairness and avoiding discrimination. Researchers and policymakers are working diligently to develop techniques that mitigate bias, striving for algorithmic transparency and accountability. Explore the challenges and ethical considerations surrounding AI as we delve into this critical topic.', 2, '2023-05-07 01:01:50', '/images/Article_image_seven.jpg', NULL),
    (23, 'Virtual Reality: A Paradigm Shift in User Experience', 'Virtual reality (VR) technology has transformed the way we interact with digital content, immersing users in realistic and captivating virtual environments. From gaming and entertainment to training and education, VR offers a paradigm shift in user experience. With the advancements in hardware and software, this cutting-edge technology is becoming more accessible and influential across diverse fields. Embark on a virtual journey with us as we explore the boundless possibilities of VR.', 3, '2023-05-08 01:01:50', '/images/Article_image_eight.jpg', NULL),
    (24, 'The Dawn of Quantum Cryptography: Unbreakable Encryption', 'Quantum cryptography, the unhackable encryption method, has arrived. Leveraging the principles of quantum mechanics, this innovative approach ensures secure communication channels that are impervious to eavesdropping and hacking attempts. By utilizing quantum key distribution protocols, sensitive data can be exchanged with unparalleled security. Discover the fascinating world of quantum cryptography and the promising future it holds for data protection.', 4, '2023-05-09', '/images/Article_image_one.jpg', NULL),
    (25, 'Artificial Neural Networks: Unleashing the Power of Deep Learning', 'Artificial neural networks, inspired by the intricate workings of the human brain, have revolutionized the field of deep learning. By utilizing multiple layers of interconnected nodes, these networks can analyze vast amounts of data and extract complex patterns. From image recognition to natural language processing, artificial neural networks have made significant strides in enabling machines to learn and understand like never before. Join us as we dive into the inner workings of these remarkable networks.', 5, '2023-05-10 01:01:50', '/images/Article_image_two.jpg', NULL),
    (26, 'The Internet of Things: Connecting the Unconnected', 'The Internet of Things (IoT) is rapidly transforming our world, connecting previously unconnected objects and enabling seamless communication between devices. From smart homes and cities to industrial automation, the IoT revolutionizes how we interact with technology. Sensors, actuators, and network connectivity converge to create a network of intelligent devices that streamline processes, optimize efficiency, and enhance our daily lives. Discover the endless possibilities of this interconnected future.', 1, '2023-05-1 01:01:50', '/images/Article_image_three.png', NULL),
    (27, 'Rapid Prototyping: Accelerating Innovation Through 3D Printing', '3D printing technology has become a game-changer in the realm of rapid prototyping, revolutionizing the way products are developed and manufactured. By transforming digital designs into physical objects with remarkable precision, 3D printing allows for quick iteration and cost-effective production. From automotive to healthcare industries, this cutting-edge technology is driving innovation and transforming traditional manufacturing processes. Explore the world of rapid prototyping as we uncover its potential.', 2, '2023-05-12 01:01:50', '/images/Article_image_four.jpg', NULL),
    (28, 'Augmented Reality: Bridging the Physical and Digital Worlds', 'Augmented reality (AR) has emerged as a transformative technology, bridging the gap between the physical and digital realms. By overlaying digital information onto the real world, AR enhances our perception and interaction with the environment. From gaming and entertainment to healthcare and retail, this immersive technology offers endless possibilities. Step into the augmented world with us as we explore the innovative applications and future potential of augmented reality.', 3, '2023-05-13 01:01:50', '/images/Article_image_five.jpg', NULL),
    (29, 'Big Data Analytics: Unlocking Insights for Smarter Decision-Making', 'In the era of information overload, big data analytics has emerged as a crucial tool for extracting valuable insights from vast amounts of data. With advanced algorithms and powerful computing systems, organizations can analyze complex data sets to identify patterns, trends, and correlations. These actionable insights empower businesses, governments, and researchers to make data-driven decisions and gain a competitive edge. Dive into the world of big data analytics and discover its transformative impact.', 4, '2023-05-14 01:01:50', '/images/Article_image_six.png', NULL),
    (30, 'Cyber-Physical Systems: Where the Physical and Digital Worlds Converge', 'Cyber-physical systems (CPS) represent the integration of computation, communication, and control within physical entities, creating a symbiotic relationship between the digital and physical worlds. From autonomous vehicles and smart grids to intelligent manufacturing, CPS enable the seamless coordination of physical processes with digital systems. As CPS continue to evolve, they hold the potential to revolutionize industries, enhance efficiency, and shape the future.', 5, '2023-05-15 01:01:50', '/images/Article_image_seven.jpg', NULL);
    
-- Insert comments with some nested ones
insert into comments (id, content, date, commenter, article, parent_comment)
values 
    (1, 'Comment 1', '2023-05-06 01:15:50', 1, 2, null), -- Paul comments on Osama's article
    (2, 'Comment 2', '2023-05-07 01:15:50', 2, 3, null), -- Osama comments on Jiseon's article
    (3, 'Comment 3', '2023-05-08 01:15:50', 3, 4, null), -- Jiseon comments on Tong's article
    (4, 'Comment 4', '2023-05-09 01:15:50', 4, 5, null), -- Tong comments on Zhaohua's article
    (5, 'Comment 5', '2023-05-10 01:15:50', 5, 1, null), -- Zhaohua comments on Paul's article
    (6, 'Reply to Comment 1', '2023-05-11 01:15:50', 2, 2, 1), -- Osama replies to Paul's comment
    (7, 'Reply to Comment 2', '2023-05-12 01:15:50', 3, 3, 2), -- Jiseon replies to Osama's comment
    (8, 'Reply to Comment 3', '2023-05-13 01:15:50', 4, 4, 3), -- Tong replies to Jiseon's comment
    (9, 'Reply to Comment 4', '2023-05-14 01:15:50', 5, 5, 4), -- Zhaohua replies to Tong's comment
    (10, 'Reply to Comment 5', '2023-05-15 01:15:50', 1, 1, 5); -- Paul replies to Zhaohua's comment


-- Insert likes
insert into likes (liker, article)
values 
    (1, 3), -- Paul likes Jiseon's article
    (2, 4), -- Osama likes Tong's article
    (3, 5), -- Jiseon likes Zhaohua's article
    (4, 1), -- Tong likes Paul's article
    (5, 2); -- Zhaohua likes Osama's article

-- Insert subscriptions, author is the user being subscribed to, subscriber is the user subscribing
insert into subscriptions (id, subscriber, author)
values 
    (1, 2, 1), -- Osama subscribes to Paul
    (2, 3, 2), -- Jiseon subscribes to Osama
    (3, 4, 3), -- Tong subscribes to Jiseon
    (4, 5, 4), -- Zhaohua subscribes to Tong
    (5, 1, 5); -- Paul subscribes to Zhaohua

-- Insert notifications (assuming all notifications are unread)
insert into notifications (id, read_status, notification_type, subscription, article_id)
values 
    (1, false, 'new_article', 1, 1),  -- New comment notification for Osama's subscription to Paul
    (2, false, 'new_article', 2, 2),     -- New like notification for Jiseon's subscription to Osama
    (3, false, 'new_article', 3, 3),  -- New article notification for Tong's subscription to Jiseon
    (4, false, 'new_article', 4, 4),     -- New like notification for Zhaohua's subscription to Tong
    (5, false, 'new_article', 5, 5);  -- New comment notification for Paul's subscription to Zhaohua



--Mock data for analytics part (data related to user id 6)
-- use this part after sign up
INSERT INTO articles (id, title, content, author, date, image_src, additional_images)
    values
        (6, 'Everyone was busy, so I went to the movie alone.', 'Content of article 1.', 6, '2023-05-01 11:01:01', '/images/Article_image_one.jpg', NULL),
        (7, 'They improved dramatically once the lead singer left.', 'Content of article 2.', 6, '2023-05-02 11:01:01', '/images/Article_image_two.jpg', NULL),
        (8, 'Pink horses galloped across the sea.', 'Content of article 3.', 6, '2023-05-03 11:01:01', '/images/Article_image_three.png', NULL),
        (9, 'Each person who knows you has a different perception of who you are.', 'Content of article 4.', 6, '2023-05-04 11:01:01', '/images/Article_image_four.jpg', NULL),
        (10, 'Siri became confused when we reused to follow her directions.', 'Content of article 5.', 6, '2023-05-05 11:01:01', '/images/Article_image_six.png', NULL),
		(11, 'Flash photography is best used in full sunlight.', 'Content of article 1.', 6, '2023-05-05 15:01:01', '/images/Article_image_one.jpg', NULL),
        (12, 'Rock music approaches at high velocity.', 'Content of article 2.', 6, '2023-05-06 11:01:01', '/images/Article_image_two.jpg', NULL),
        (13, '8% of 25 is the same as 25% of 8 and one of them', 'Content of article 3.', 6, '2023-05-06 20:01:01', '/images/Article_image_three.png', NULL),
        (14, 'Each person who knows you has a different perception of who you are.', 'Content of article 4.', 6, '2023-05-07 11:01:01', '/images/Article_image_four.jpg', NULL),
        (15, 'Getting up at dawn is for the birds.', 'Content of article 5.', 6, '2023-05-08 11:01:01', '/images/Article_image_six.png', NULL),
		(16, 'Everyone was busy, so I went to the movie alone.', 'Content of article 1.', 6, '2023-05-09 11:01:01', '/images/Article_image_one.jpg', NULL),
        (17, 'Jerry liked to look at paintings while eating garlic ice cream.', 'Content of article 2.', 6, '2023-05-10 11:01:01', '/images/Article_image_two.jpg', NULL),
        (18, 'As the asteroid hurtled toward earth', 'Content of article 3.', 6, '2023-05-11 11:01:01', '/images/Article_image_three.png', NULL),
        (19, 'You have no right to call yourself', 'Content of article 4.', 6, '2023-05-12 11:01:01', '/images/Article_image_four.jpg', NULL),
        (20, 'Her scream silenced the rowdy teenagers', 'Content of article 5.', 6, '2023-05-13 11:01:01', '/images/Article_image_six.png', NULL);
		
		
INSERT INTO comments (id, content, date, commenter, article, parent_comment)
	values 
		(11, 'Comment 11', '2023-05-22 11:01:01', 1, 6, null),
		(12, 'Comment 12', '2023-05-22 11:02:01', 2, 7, null),
		(13, 'Comment 13', '2023-05-23 11:01:01', 3, 7, null),
		(14, 'Comment 14', '2023-05-23 11:10:01', 4, 8, null),
		(15, 'Comment 15', '2023-05-23 15:01:01', 5, 9, null),
        (16, 'Comment 16', '2023-05-23 18:02:01', 6, 10, null),
		(17, '17-Reply to Comment 11', '2023-05-25 11:03:01', 3, 6, 11),
		(18, '18-Reply to Comment 13', '2023-05-25 11:09:01', 4, 7, 12), 
		(19, '19-Reply to Comment 14', '2023-05-26 12:01:01', 5, 8, 14),
		(20, '20-Reply to Comment 15', '2023-05-27 15:58:01', 1, 9, 15),
		(21, 'Comment 21', '2023-05-27 18:01:01', 3, 10, null),
		(22, 'Comment 22', '2023-05-27 20:01:01', 4, 10, null),
		(23, 'Comment 23', '2023-05-28 08:02:01', 5, 10, null),
		(24, 'Comment 24', '2023-05-28 11:05:01', 3, 10, null),
		(25, 'Comment 25', '2023-05-28 11:07:01', 4, 10, null),
		(26, 'Comment 26', '2023-05-28 20:01:01', 5, 11, null),
		(27, '27-Reply to Comment 21', '2023-05-28 21:01:01', 4, 10, 21), 
		(28, '28-Reply to Comment 22', '2023-05-28 22:01:01', 5, 10, 22),
		(29, '29-Reply to Comment 23', '2023-05-28 22:58:01', 1, 10, 23),
		(30, 'Comment 30', '2023-05-29 08:01:01', 3, 15, null),
		(31, 'Comment 31', '2023-05-29 10:01:01', 4, 16, null),
		(32, 'Comment 32', '2023-05-29 11:02:01', 5, 17, null),
		(33, 'Comment 33', '2023-05-29 12:05:01', 3, 18, null),
		(34, 'Comment 34', '2023-05-29 14:07:01', 4, 19, null),
		(35, 'Comment 35', '2023-05-29 20:01:01', 5, 20, null),
		(36, '36-Reply to Comment 30', '2023-05-30 01:01:01', 4, 15, 30), 
		(37, '27-Reply to Comment 31', '2023-05-30 02:01:01', 5, 16, 31),
		(38, '28-Reply to Comment 35', '2023-05-30 03:58:01', 1, 20, 35),
		(39, 'Comment 39', '2023-05-30 08:01:01', 3, 6, null),
		(40, 'Comment 40', '2023-05-30 10:01:01', 4, 7, null),
		(41, 'Comment 41', '2023-05-30 11:02:01', 5, 17, null),
		(42, 'Comment 42', '2023-05-30 12:05:01', 3, 18, null),
		(43, 'Comment 43', '2023-05-31 14:07:01', 4, 19, null),
		(44, 'Comment 44', '2023-05-31 20:01:01', 5, 20, null),
        (45, '45-Reply to Comment 41', '2023-05-31 01:01:01', 4, 17, 41), 
		(46, '46-Reply to Comment 42', '2023-05-31 02:01:01', 5, 18, 42),
		(47, '47-Reply to Comment 43', '2023-05-31 03:58:01', 1, 19, 43);


INSERT INTO likes (liker, article)
    values 
        (1, 6),
        (2, 6),
        (3, 6),
        (4, 7),
        (5, 8),
        (5, 9),
		(6, 1),
		(6, 2),
        (5, 10),
		(1, 11),
        (2, 11),
        (3, 12),
        (4, 13),
        (5, 14),
        (5, 15),
		(6, 15),
		(6, 16),
        (5, 17),
		(1, 18),
        (2, 18),
        (3, 18),
        (4, 18),
        (5, 18),
        (5, 19),
		(6, 19),
		(6, 20),
        (5, 20);
		
		
INSERT INTO subscriptions (id, subscriber, author)
	values 
		(6, 2, 6),
		(7, 3, 6),
		(8, 4, 6),
		(9, 5, 6),
		(10, 6, 5),
		(11, 6, 1),
		(12, 6, 2);

insert into notifications (id, read_status, notification_type, subscription, article_id)
	values 
		(6, false, 'new_article', 6, 6),  
		(7, false, 'new_article', 7, 7),    
		(8, false, 'new_article', 8, 8), 
		(9, false, 'new_article', 9, 6),  
		(10, false, 'new_article', 11, 1);
