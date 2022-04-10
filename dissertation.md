---
layout: page
title: Interactive Scalable Interfaces for Machine Learning Interpretability
permalink: dissertation/
redirect_from: defense/
---

<span class="dissertation-subtitle">
Data-driven paradigms now solve the world's hardest problems by automatically learning from data. Unfortunately, what is learned is often unknown to both the people who train the models and the people they impact. This has led to a rallying cry for *machine learning interpretability*. But how do we enable interpretability? How do we scale up explanations for modern, complex models? And how can we best communicate them to people?
<span>

Since machine learning now impacts people's daily lives, we answer these questions taking a *human-centered perspective* by designing and developing interactive interfaces that can enable interpretability at scale and for everyone. This thesis focuses on:

##### 1. Enabling Machine Learning Interpretability

User research with practitioners guides the creation of our novel operationalization for interpretability, which helps tool builders design interactive systems for model and prediction explanations. We develop two such visualization systems, [Gamut][gamut] and [TeleGam][telegam], which we deploy at Microsoft Research as a design probe to investigate the emerging practice of interpreting models. 

##### 2. Scaling Deep Learning Interpretability

Our first-of-its-kind [Interrogative Survey][deepvis] reveals critical yet understudied areas of deep learning interpretability research, such as the lack of higher-level explanations for neural networks. Through [Summit][summit], an interactive visualization system, we present the first scalable graph representation that summarizes and visualizes what features deep learning models learn and how those features interact to make predictions (e.g., InceptionNet trained on ImageNet with 1.2M+ images).

##### 3. Communicating Interpretability with Interactive Articles

We use [interactive articles][interactive-articles], a new medium on the web, to teach people about machine learning's capabilities and limitations, while developing a new interactive publishing initiative called the [Parametric Press][parametric]. From our success publishing interactive content at scale, we generalize and detail the affordances of interactive articles by connecting techniques used in practice and the theories and empirical evaluations put forth by diverse disciplines of research.

***

This thesis contributes to *information visualization*, *machine learning*, and more importantly *their intersection*, including open-source interactive interfaces, scalable algorithms, and new, accessible communication paradigms. Our work is making significant impact in industry and society: our visualizations have been deployed and demoed at Microsoft and built into widely-used interpretability toolkits, our interactive articles have been read by 250,000+ people, and our interpretability research is supported by NASA.

{% include dissertation.html %}

## Thesis Defense

**Fred Hohman**  
[fredhohman.com](https://fredhohman.com/)  
School of Computational Science & Engineering  
College of Computing  
Georgia Institute of Technology

**Date:** Monday, October 5, 2020  
**Time:** 1:30pm - 2:30pm EST  
**Location:** remote via Zoom (email for invite)

**Committee**  
Duen Horng (Polo) Chau - *Advisor, Georgia Tech, CSE*  
Alex Endert - *Co-advisor, Georgia Tech, IC*  
Chao Zhang - *Georgia Tech, CSE*  
Nathan Hodas - *Pacific Northwest National Lab*  
Scott Davidoff - *NASA Jet Propulsion Lab*  
Steven Drucker - *Microsoft Research*

<p>
    <iframe width="100%" height="315" src="https://www.youtube.com/embed/TNH8RqyNfmo" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</p>

<!-- **Materials**   -->
* [Research Statement][statement]  
* [Slides, low quality][talk-low-db] (50MB)  
* [Slides, high quality][talk-high-db] (200MB)  
* [Slide export animations + demo videos][talk-export]

**Bio (from October 2020)**  
Fred Hohman is a PhD candidate at Georgia Tech's College of Computing.
His research focuses on enabling machine learning interpretability at scale and for everyone, by designing and developing interactive interfaces to help people confidently understand data-driven systems. Besides building tools, he also creates data visualizations and writes interactive articles to simply communicate complex ideas.

He has collaborated with designers, developers, and scientists at Apple, Microsoft Research, NASA JPL Human Interfaces, and Pacific Northwest National Lab. He won a NASA PhD Space Technology Research Fellowship, a Microsoft AI for Earth Award for using AI to improve sustainability, and the President's Fellowship for top incoming PhD students. He has also won an ACM CHI 2019 Best Paper award; a KDD 2018 Audience Appreciation Award, Runner-up; an IEEE VIS VISxAI Best Paper, Honorable Mention; and a SIGMOD 2017 Best Demo, Honorable Mention. His work has appeared in popular press, such as the Stack Overflow Blog, Fast Company, and Data Stories. He co-organizes the Workshop on Visualization for AI Explainability (VISxAI) at IEEE VIS. He double majored in mathematics and physics.

[talk-low]: {{ site.url }}/talk-low-quality.pdf
[talk-high]: {{ site.url }}/talk-high-quality.pdf
[talk-export]: https://youtu.be/k8fzkxxxyr8
[talk-low-db]: https://www.dropbox.com/s/b4aqsp6ota3zani/defense-low-quality.pdf?dl=0
[talk-high-db]: https://www.dropbox.com/s/97q8gcinczfnfvu/defense-high-quality.pdf?dl=0
[cv]: https://fredhohman.com/cv
[cv-pdf]: https://fredhohman.com/cv.pdf
[statement]: {{ site.url }}/research-statement.pdf

[gamut]: {{ site.url }}/papers/gamut
[telegam]: {{ site.url }}/papers/telegam
[deepvis]: {{ site.url }}/papers/deepvis
[summit]: {{ site.url }}/papers/summit
[parametric]: {{ site.url }}/papers/parametric
[interactive-articles]: {{ site.url }}/papers/interactive-articles