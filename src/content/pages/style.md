---
title: Style
subtitle: A page to test the styling of the site.
---

This page is work in progress. It's meant as a place to check how the overall style of the site looks. This includes:

-   Typography
-   Spacing
-   etc.

---

# Heading 1

## Heading 2

### Heading 3

#### Heading 4

##### Heading 5

###### Heading 6

This normal text but sometimes we want to add **emphasis** or perphaps a more subtle _emphasis_ to the text. We can also add links which look like [this](https://google.com). Sometimes we make mistakes and need to ~~strike~~ them out.

We can also create seperation with horizontal rules:

---

Hello from the other side.

---

We can also create lists:

**Unordered List**:

1.  list item 1
2.  list item 2
3.  list item 3

**Ordered List**:

-   list item 1
-   list item 2
-   list item 3

**Nested List**:

1.  list item 1
    -   list item 1.1
    -   list item 1.2
2.  list item 2
    -   list item 2.1
    -   list item 2.2
3.  list item 3
    -   list item 3.1
    -   list item 3.2

Sometimes we need to quote someone:

> “Adding lanes to solve traffic congestion is like loosening your belt to solve obesity.” – Glen Hemistra

Here's a sentence with a footnote. [^1]

Here's some gibberish to test letter spacing, line height, and other typographic elements:

lorem ipsum dolor sit amet, consectetur adipiscing elit. sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Random to-do list:

-   [x] Write the press release
-   [ ] Update the website
-   [ ] Contact the media

Here's another sentence with a footnote. [^2]

[^1]: This is the footnote.
[^2]: This is the other footnote.

---

Oh! Almost forgot about images:

![image](/public/hero.gif)

(and tables but these look ugly at the moment)

| Syntax    | Description |
| --------- | ----------- |
| Header    | Title       |
| Paragraph | Text        |

I will get around to styling code blocks soon but for now here's a snippet:

```javascript
function* parse() {
	yield "Hello";
	yield "from";
	yield "the";
	yield "other";
	yield "side";
}

for (let word of parse()) {
	console.log(word);
}
```
