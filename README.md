# SG StreetGuessr 🇸🇬

> ⚠️ WARNING: This is by far the stupidest thing I've ever made.

Learning game for memorising EVERY... SINGLE... STREET... in Singapore.
Yes, you read that right. After beating this game, you will be able to locate
any street in Singapore on a map. This game is the epitome of useless knowledge.
You will be able to impress your friends at a party with your amazing knowledge
of every single street name in a entire nation. But please don't blame me if you
get weird faces in return.

## Just... why?

So I was playing a game of GeoGuessr the other day when I was bored. One of the
locations was in Singapore. It is important to note that Singapore is one of the
easiest countries to guess correctly in GeoGuessr, and even noobs will be able
to get it right just after a few drops in Singapore.

These are several reasons why (but there are many more):

- Tropical climate and vegetation
- Very well maintained roads
- Tall skyscrapers and white residential buildings, rich vibes
- Black and white curb markings
- Unique yellow road markings beside curbs (indicate whether you may park/stop)
- Unique arrows on the road
- English, Mandarin, Malay and Tamil language on signs
- Distinct green (double decker) buses
- Sheltered pedestrian walkways everywhere
- Green street signs with distinct rounded corners

It's generally pretty useless to learn the different regions of Singapore (and
they also look pretty similar), because Singapore is so small. In GeoGuessr,
even experienced players usually just plonk their pin in the middle of the
island when playing competitively. You can't really lose that many points if
your opponent is slightly closer than you.

Exactly because of this, I thought it'd be a fun idea to memorise every single
street name, so I can beat everyone - even Singaporeans - in their own country
(I'm not Singaporean).

## Tech

- HTML+CSS+JS (because frameworks are for losers)
- Open Street Map (Leaflet API)
- Overpass API (for scraping all the street info)

Code totally sucks. For your own sanity, don't look at it.

## Play

Running on GitHub pages for you: [https://iannisdezwart.github.io/sgsg/].
Your progress is saved in your browser's local storage.
There is a simple learning algorithm that will help you learn the streets
effectively. I used this algorithm before in a flash card app I made, and it
worked pretty well for me. This is how it works:

- Streets are sorted in alphabetical order
- Each street starts with an integer score 0
- Whenever you guess wrong, the score is decreased by 1
- Whenever you guess right, the score is increased by 1
- The next street to be guessed is the one with the lowest score. If there are
  multiple such streets, ties are broken by street name (alphabetically)
- There is one bit of additional logic: if you guess wrong, you won't see that
  street again for 7 rounds. This is to prevent you from becoming a goldfish.
  The number 7 is from my own school experience. (I used to get high grades so
  trust me bro).

You can also select what streets you want to practice by inputting a regex in
the input box in the top right corner. For example, I like to practice batches
of around 100 streets, so I input `^a` to practice all 121 streets starting with
the letter A. There are a lot more streets starting with a B for example, so
then you could do `^b[a-m]` to practice 116 streets starting with BA to BM.

## Final notes

I wonder how long it will take me to learn all the streets. There are 3.5k of
them. My guess is around 6 weeks if I practice an hour a day. In my experience,
learning to locate streets on a map is about twice as hard as learning words in
a foreign language. You do learn a lot though. Especially when looking up the
meaning of street names and coming up with your own crazy mnemonics.

Walao eh, this one gonna take damn long time to learn lah.
Okay, I balik kampung liao.