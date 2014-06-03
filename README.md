# Association UI for Symphony

This project has kindly been funded by Bernardo Dias da Cruz, Ben Babcock, Juraj Kapsz, Daniel Golbig, Vojtech Grec, Andrea Buran, [Brendan Abbot](http://bloodbone.ws/), [Roman Klein](http://romanklein.com), [Korelogic](http://korelogic.co.uk/), Ngai Kam Wing, [David Oliver](http://doliver.co.uk/), Patrick Probst, Mario Butera, John Puddephatt, [Goldwiege](http://www.goldwiege.de/) and others. 

## A New Take on Subsections: An Association Interface

With the release of Symphony 2.4, a question that I've heard a lot over the course of the last couple of years came up again: Will [Subsection Manager](https://github.com/hananils/subsectionmanager) be updated to the latest Symphony version?

The answer is twofold. No, Subsection Manager as you know it will not be updated. The underlying concept is too complex, not focussed on the right things and does not scale well. Still, the basic ideas behind the UI – the search, the inline editor – are very useful when handling associations and lacking in Symphony so far. 

With this post, we'll offer you a concept how to replace Subsection Manager with something new, more versatile and interchangeable based on the latest Symphony features: the Association Interface. To bring this idea to life, we're offering our time and expertise in turn for funding by you, the community.

### Starting Point

The core functions for relationship management are offered by Symphony itself. Thanks to the commitment of John Porter, we have a solid base for managing associations which Symphony exposes in a simple interface in the right drawer since version 2.3.

Besides Subsection Manager, there are two major extensions dealing with associations:

- [Select Box Link](https://github.com/symphonycms/selectbox_link_field) and
- [Select Box Link Plus](https://github.com/TwistedInteractive/selectbox_link_field_plus)

While the first is quite robust, it's lacking a real UI. The second one is similar to Subsection Manager in terms of complexity: although it shares name with the official SBL extension, it's a separate field with a very complex set of features (I'd say, it's even more complex than SSM).

The main problem with all existing solutions available: they can't replace each other without you editing the database and your entries by hand. All extensions focus on their own field instances and don't look at the broader concept of associations, that is also used by default select boxes and tag lists (the usage of "dynamic values" creates associations that can be shown in the entry indexes).

### Step 1: Combining Subsection Manager, Duplicators and Selectize

![Combining Subsection Manager and Seletize](http://projekte.nilshoerrmann.de/screenshots/association-ui_combining.png)

As of version 2.4, Symphony includes [Selectize](http://brianreavis.github.io/selectize.js/), a hybrid text and select box. Combining its features with core interface components like Symphony Duplicators and our know-how of building Subsection Manager allows the development of a fast, feature-rich UI for finding and attaching entries. This UI can enhance select boxes, tags list and Select Box Link fields alike. Using JavaScript and CSS only, the interface can be plugged into existing installs without having to change the field or section structure. It can be switched on and off without affecting data storage. So the kind of Assocition UI we'd like to build will be a real add-on you can use to enhance and streamline the user experience.

It will be compatible with Symphony 2.4 and above.

## Step 2: Inline Editing
#
![Paper Stack](http://projekte.nilshoerrmann.de/screenshots/association-ui_paper-stack.png)

Subsection Manager proved that displaying and editing associated entries inline reduces cognitive complexity of association management. The main problem was the implementation that relied on a small, space-limited iframe inside the Duplicator interface. But inline editing is not about previewing content, it's about creating content. It needs space.

Our idea is to create a new inline editor that builds on the existing layout structure of the backend. Symphony's main content area looks like a sheet of paper, so let's do what we do with real paper when we read and write: stack it. Think of one sheet for one Symphony entry: we can pop up the child entry we'd like to edit on top of its parent and return to the parent entry when we're done. The inline editor will overlay the current content area, still showing the header of the parent in order to make the context and hierachy clear.

[Basecamp](http://signalvnoise.com/posts/3111-basecamp-next-ui-preview) has been doing something similar for a few years.

### Step 3: Nested and Sortable Data Source output

Two features have been very prominent in Subsection Manager: nested and sortable Data Source output. 

Nested or inline output of associated entries has been a time saver when you create your Data Sources. It also simplified logic in your templates because you didn't have to match data across node sets. The idea is to provide these features as a separate extension so they can be used independently of the UI. In order to improve performance compared to Subsection Manager, the extension should create virtual Data Sources that replicate the logic internally that you'd normally have to setup by hand: the virtual Data Sources should fetch IDs from the existing XML tree (like using output parameters), load the child data using the Symphony Data Source class (like adding a secondary Data Source filtered by these parameters) and add the result to your associated entries (this is what you normally do in your XML by matching different nodes based on entry IDs). The Data Source editor can be enhanced to offer a selection of fields to be returned in the XML.

Sort order can be determined by storage order in the database. So the Association UI just needs to offer an additional sorting feature to set the order. 

### Funding Goals

Creating an association interface for Symphony is a complex task. We are aware of this as we have been supporting the Symphony community with Subsection Manager over the last four years. It takes time to build and test the components and it also takes time to maintain and update them over time. That's why we'd kindly like to ask you to support this project to lift association management to a new level.

These are our funding goals:

1. **500€**: Work on the Association UI will begin in a private repository only donators will have access to.
2. **1000€**: Work on the inline editor will begin and the Association UI will be made available to everyone.
3. **1500€**: Work on nested and sortable Data Source output will begin.

[![PayPal Donation](https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=YAVPERDXP89TC)

### Donations: 1510€  

Thanks for your support!

Nils and Johanna   
hana+nils, <http://hananils.de>
