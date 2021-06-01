Stack Overflow
Products
Search…

acedeywin
21
, 21 reputation
●33 bronze badges
People who code: we want your input. Take the Survey
Home
PUBLIC
Questions
Tags
Users
FIND A JOB
Jobs
Companies
TEAMS
Stack Overflow for Teams – Collaborate and share knowledge with a private group. 
How to fix the issue not all the code paths return value?
Asked 2 years, 10 months ago
Active 2 months ago
Viewed 23k times

Report this ad

15


1
I have an error in the code that I am trying to resolve. I think it needs a return statement but I have that already outside of the forEach loop but it still throws the error:

not all the code path return the value
How to fix below code?

main.ts:

private ValidateRequestArgs(str) {
  let ret: boolean = true;
  // here on val its throwing tslint error not all code paths return value 
  str.split(',').forEach((val) => {
    if (!ret) {
      return false;
    }
    if (List.indexOf(val) > -1) {
      ret = true;
    } else {
      ret = false;
    }
  });
  return ret;
}
javascript
typescript
tslint
Share
Edit
Follow
Flag
edited Jul 21 '18 at 18:45

Rick
3,30899 gold badges2020 silver badges3333 bronze badges
asked Jul 20 '18 at 15:51

hussain
4,7471212 gold badges5151 silver badges120120 bronze badges
1

Not a TS user, but my guess is that lint detects a return in your function, so it considers your function always has to return something, which is not the case. What if you add a return true; after the else statement? – Karl-André Gagnon Jul 20 '18 at 15:57
Add a comment
4 Answers

5

I'm not sure why tslint is complaining, but you can write the whole thing way more elegant as:

return str.split(",").every(el => List.includes(el));
or ES6:

return str.split(",").every(el => List.indexOf(el) > -1);
Share
Edit
Follow
Flag
edited Jul 20 '18 at 15:58
answered Jul 20 '18 at 15:54

Jonas Wilms
107k1313 gold badges9999 silver badges120120 bronze badges

i am not using ES2017 so includes will be a problem, any other solution ? – hussain Jul 20 '18 at 15:56 

@hussain then .indexOf(el) > -1 – Jonas Wilms Jul 20 '18 at 15:57

Perfect Thanks alot – hussain Jul 20 '18 at 16:06
Add a comment

Report this ad

2

tsconfig.json

compilerOptions:{
  "noImplicitReturns": false
}
Share
Edit
Follow
Flag
answered Mar 20 at 0:39

rohit.khurmi095
7122 bronze badges
Add a comment

28

The comlaint is that the first if(){} is missing an else{} block with a return statement. You can disable this behaviour in a tsconfig file setting:

 "noImplicitReturns": false,
Of course you could also add

else {return ...}
But I would not recommend that, since forEach is not supposed to return anything as stated for example here: What does `return` keyword mean inside `forEach` function? or here: https://codeburst.io/javascript-map-vs-foreach-f38111822c0f

Instead better get rid of the first if() altogether. Cheers

Share
Edit
Follow
Flag
edited Apr 21 '20 at 8:39
answered Apr 21 '20 at 8:34

theRealEmu
46144 silver badges66 bronze badges
Add a comment

0

The body of the function passed to forEach has an implicit signature of any -> boolean so it would seem that tslint is expecting you to treat it more statically and return boolean on all code paths.

Share
Edit
Follow
Flag
answered Jul 21 '18 at 18:50

ChaosPandion
73.4k1616 gold badges113113 silver badges152152 bronze badges
Add a comment
Your Answer
Links Images Styling/Headers Lists Blockquotes Code HTML TablesAdvanced help


Community wiki
Not the answer you're looking for? Browse other questions tagged javascript typescript tslint or ask your own question.
The Overflow Blog
Level Up: Linear Regression in Python – Part 2
Shipping confetti to Stack Overflow’s design system
Featured on Meta
The future of Community Promotion, Open Source, and Hot Network Questions Ads
Planned maintenance scheduled for Friday, June 4, 2021 at 12:00am UTC…
Take the 2021 Developer Survey
Hot Meta Posts
10
Cleanup needed: [react-create-app] mistags for [create-react-app]
21
Burn the tag at [highest] priority
5
Clean up [code-translation]

Report this ad
Check out these companies

Lastmile Retail
Digital Marketing, Retail
djangovue.jsamazon-web-services
11 followers

SDVI
Entertainment, Media, SaaS
javascriptangularpython
14 followers

Hummingbot
Cryptocurrency, Financial Technology, Software Development / Engineering
mysqlpythonreactjs
5 open jobs · 96 followers

G2i Inc
Mobile Development, Software Development / Engineering, Web Development
javascriptnode.jsreact
44 followers
More companies on Stack Overflow
Linked
177
What does `return` keyword mean inside `forEach` function?
Related
1502
How to get the value from the GET parameters?
1205
How do you get a list of the names of all files present in a directory in Node.js?
1025
Detecting a mobile browser
992
How do I get the value of text input field using JavaScript?
5960
How to return the response from an asynchronous call?
0
Not all code paths return a value (JavaScript)
2769
Why does my JavaScript code receive a “No 'Access-Control-Allow-Origin' header is present on the requested resource” error, while Postman does not?
1
All code paths does not return the value?
3
Firebase cloud function typescript error “Not all code paths return a value”
1
Not all code paths return a value, but it seems they do
Hot Network Questions
Is the burden of proof a fallacy?
Am I a US person for tax purposes?
Cut with CTRL+MINUS key combination
Is there a solution to stop suffering?
Movie where someone's wife is secretly a monster
How do computers perform operations on numbers that are larger than 64 bits?
Why did SMARTDRV have to be started with /x when DOS started?
Why do Igors (but not Igorinas) lisp when they speak?
Spring 2022 admissions for top math graduate programs
Reverse engineer this old burglar alarm panel
What are the risks and benefits of being the first PhD of a new supervisor?
Deuteronomy 8:2 didn't God already know what was in the hearts of the Israelites
A planet with toxic air
Did AlphaZero also have to learn that each piece has a value?
I live in an older home without ground wiring. Is it safe to install 3-prong GFCI with only a hot and neutral?
Why does the LM317 have such a thin metal tab?
Why isn't it the norm to have research repeated immediately by other academics?
Is there any realistic explanation for Earth-like climate on a Sun-sized planet?
What does research indicate about how one should treat units in elementary school?
Can a rest be taken in a moving cart?
Does the function monad really offer something more than the function applicative functor? If so, what?
Can archers who shoot at a hot air balloon from the ground shoot it down?
Fantasy 3? book series in a castle with only one sane person
Why didn't Windows 98 need the "Starting Windows 98..." screen?
 Question feed

STACK OVERFLOW
Questions
Jobs
Developer Jobs Directory
Salary Calculator
Help
Mobile
Disable Responsiveness
PRODUCTS
Teams
Talent
Advertising
Enterprise
COMPANY
About
Press
Work Here
Legal
Privacy Policy
Terms of Service
Contact Us
Cookie Settings
Cookie Policy
STACK EXCHANGE
NETWORK
Technology
Life / Arts
Culture / Recreation
Science
Other
Blog
Facebook
Twitter
LinkedIn
Instagram
site design / logo © 2021 Stack Exchange Inc; user contributions licensed under cc by-sa. rev 2021.6.1.39387

 
